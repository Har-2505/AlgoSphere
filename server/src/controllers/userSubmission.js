const  Problem =require('../Models/problem');
const Submission=require('../Models/submission');

const {getLanguageById,submitBatch,submitToken}=require('../utils/problemUtility')
const submitCode =async(req,res)=>{
try{
const userId=req.result._id;
const  problemId=req.params.id;
const {code,language}=req.body;
if(!userId || !code ||!problemId || !language)
    return res.status(400).send("Some Field is Messing");

const problem=  await Problem.findById(problemId);

const submittedResult=await Submission.create({
    userId,
    problemId,
    code,
    language,
    status:'pending',
    testCasesTotal:problem.hiddenTestCases.length
})

//judge 0 ko submit karna hai

        const languageId = getLanguageById(language);
            const submissions = problem.hiddenTestCases.map((testcase)=>({
            source_code:code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));
 const submitResult = await submitBatch(submissions);

        
        
        if (!submitResult || !Array.isArray(submitResult)) {
            throw new Error("Failed to communicate with Judge0.");
        }

        const resultToken=submitResult.map((value)=>value.token);
        const testResult=await submitToken(resultToken);
        //submit result ko update karo
     let testCasesPass=0;
     let runtime=0;
     let memory=0;
     let status='accepted';
     let errorMessage=null;
     for(const test of testResult){
        if(test.status_id==3)
        {
           testCasesPass++;
runtime += Number(test.time) || 0;
           memory=Math.max(memory,test.memory)
        }
        else{
        if(test.status_id==4)
        {
            status='error',
            errorMessage=test.stderr

        }
        else{
status='wrong'
  errorMessage=test.stderr
        }
        }
       }

       //store result in database
       submittedResult.status=status;
       submittedResult.testCasesPassed=testCasesPass;
       submittedResult.errorMessage=errorMessage;
       submittedResult.runtime= runtime;
       submitResult.memory= memory;
       await submittedResult.save();

      if(!req.result.problemSolved.includes(problemId))
        {
             req.result.problemSolved.push(problemId)
            await req.result.save();
        } 

       res.status(201).send(submittedResult);

       
}
catch(err)
{

res.status(500).send("Internal Server Error"+ err);
}
}




const runCode =async(req,res)=>{
try{
const userId=req.result._id;
const  problemId=req.params.id;
const {code,language}=req.body;
if(!userId || !code ||!problemId || !language)
    return res.status(400).send("Some Field is Messing");

const problem=  await Problem.findById(problemId);



//judge 0 ko submit karna hai

        const languageId = getLanguageById(language);
            const submissions = problem.visibleTestCases.map((testcase)=>({
            source_code:code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));
 const submitResult = await submitBatch(submissions);

        
        
        if (!submitResult || !Array.isArray(submitResult)) {
            throw new Error("Failed to communicate with Judge0.");
        }

        const resultToken=submitResult.map((value)=>value.token);
        const testResult=await submitToken(resultToken);
        //submit result ko update karo
    

      
       res.status(201).send(testResult);

       
}
catch(err)
{

res.status(500).send("Internal Server Error"+ err);
}
}



module.exports={submitCode,runCode}