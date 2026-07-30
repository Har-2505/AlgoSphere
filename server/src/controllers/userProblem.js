const Problem =require("../Models/problem");
const User = require("../Models/user");


const {getLanguageById,submitBatch,submitToken}=require('../utils/problemUtility')
const createProblem=async(req,res)=>{
    const { title,dscription,difficultylevel, tag, 
         visibleTestCases, hiddenTestCases
        ,startcode,refrenceSolution,problemCreator
    }=req.body;
    try{
 for(const {language,completeCode} of refrenceSolution){
         

   

        const languageId = getLanguageById(language);
          
        // I am creating Batch submission
        const submissions = visibleTestCases.map((testcase)=>({
            source_code:completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));


        const submitResult = await submitBatch(submissions);
        
       
        if (!submitResult || !Array.isArray(submitResult)) {
            throw new Error("Failed to communicate with Judge0.");
        }

        const resultToken=submitResult.map((value)=>value.token);
         
    //   ["","","" //token]

        const testResult=await submitToken(resultToken);
        console.log(testResult);
       for(const test of testResult){
        if(test.status_id!=3)
        {
            return res.status(400).send("Error Occured");
        }
       }


      }


 //we can store in our db
 await Problem.create({
    ...req.body,
    problemCreator:req.result._id

 })
res.status(201).send("Problem Created Sucessfully");
    }

catch(err){
res.status(400).send("Error: "+err);
}}

const updateProblem=async(req,res)=>{
const {id}=req.params;
    const { title,dscription,difficultylevel, tag, 
         visibleTestCases, hiddenTestCases
        ,startcode,refrenceSolution,problemCreator
    }=req.body;
try {
if(!id){
    return  res.status(400).send("Missing Id Field");
}
const DsaProblem=await Problem.findById(id);
if(!DsaProblem)
{
    return res.status(400).send("ID is not present in server");
}

     for(const {language,completeCode} of refrenceSolution){
         

   

        const languageId = getLanguageById(language);
          
        // I am creating Batch submission
        const submissions = visibleTestCases.map((testcase)=>({
            source_code:completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));


        const submitResult = await submitBatch(submissions);
        console.log(submitResult);
        
        if (!submitResult || !Array.isArray(submitResult)) {
            throw new Error("Failed to communicate with Judge0.");
        }

        const resultToken=submitResult.map((value)=>value.token);
         
    //   ["","","" //token]

        const testResult=await submitToken(resultToken);
        console.log(testResult);
       for(const test of testResult){
        if(test.status_id!=3)
        {
            return res.status(400).send("Error Occured");
        }
       }


      }

  const newProblem=  await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true})
  res.status(200).send(newProblem);
} catch (err) {
    res.status(500).send("Error: "+err);
}
}

const deleteProblem =async(req,res)=>{
    const {id}=req.params;
    try{
if(!id)
{
    return res.status(400).send("ID IS MISSING");
}

const deletedProblem= await  Problem.findByIdAndDelete(id);
if(!deleteProblem)
{
    return res.status(404).send("Problem is Missing");
}
res.status(200).send("Problem Deleted Sucessfully");

}
    catch(err)
    {
res.status(500).send("Error: "+err);
    }
}

const getProblemBiId=async(req,res)=>{
const {id}=req.params;
try{
if(!id)
    return res.status(400).send("ID is Missing");
const getProblem= await Problem.findById(id).select('_id  title dscription  difficultylevel  tag visibleTestCases  startcode   refrenceSolution');
if(!getProblem)
    return res.status(400).send("Problem is Missing");
res.status(200).send(getProblem);
}
catch(err)
{
    res.status(500).send("Error: "+err);
}

}


const getAllProblem=async(req,res)=>{

try{

const getProblem= await Problem.find({}).select('_id title difficultylevel tag');
if(getProblem.length==0)
    return res.status(400).send("Problem is Missing");
res.status(200).send(getProblem);
}
catch(err)
{
    res.status(500).send("Error: "+err);
}

}


const solvedAllProblembyUser = async(req,res)=>{
    try{
        const userId=req.result._id;
        const user=await User.findById(userId).populate({path:"problemSolved",
            select:'_id title difficultylevel tag  '}
        ); 
       
    
        res.status(200).send(user.problemSolved);
    }
    catch(err)
    {
        res.status(500).send("Server error");
    }
}

const submittedProblem=async(req,res)=>{
  try {
    const userId=req.result._id;
    const problemid=req.params.pid;

    const ans=await Submission.find({userId,problemid});
    if(ans.length==0)
    {
      res.status(200).send("No Submission");
    }
    res.status(200).send(ans);
  } catch (error) {
  res.status(500).send("Internal Server Error");
  }
}


module.exports={createProblem,updateProblem,deleteProblem,getProblemBiId,getAllProblem, solvedAllProblembyUser,submittedProblem};
