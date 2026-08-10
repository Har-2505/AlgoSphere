const Problem =require("../Models/problem");
const User = require("../Models/user");
const Submission = require("../Models/submission");
const SolutionVideo = require("../Models/solutionVideo");

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
    return res.status(404).send("Problem is Missing");

    const videos = await SolutionVideo.findOne({problemId:id});

    if(videos){    
      const problemObj = getProblem.toObject();
      problemObj.secureUrl = videos.secureUrl;
      problemObj.cloudinaryPublicId = videos.cloudinaryPublicId;
      problemObj.thumbnailUrl = videos.thumbnailUrl;
      problemObj.duration = videos.duration;

      return res.status(200).send(problemObj);
    }


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
    const problemId=req.params.pid;

    console.log("Backend submittedProblem - Fetching submissions for:");
    console.log("  userId:", userId);
    console.log("  problemId:", problemId);

    const ans=await Submission.find({userId, problemId});
    console.log("  Submissions found in DB:", ans);

    res.status(200).send(ans);
  } catch (error) {
    console.error("Backend submittedProblem - Error:", error);
    res.status(500).send("Internal Server Error");
  }
}


const getProfileStats = async (req, res) => {
  try {
    const userId = req.result._id;

    // 1. Fetch user to get solved problems list
    const user = await User.findById(userId).populate({
      path: "problemSolved",
      select: "_id title difficultylevel tag"
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const solvedProblems = user.problemSolved || [];

    // 2. Fetch all problems in system to calculate totals
    const allProblems = await Problem.find({}, "_id difficultylevel tag");

    // 3. Count total vs solved by difficulty
    const totalDifficulties = { easy: 0, medium: 0, hard: 0 };
    const solvedDifficulties = { easy: 0, medium: 0, hard: 0 };

    allProblems.forEach(p => {
      const diff = (p.difficultylevel || "").toLowerCase();
      if (diff === "easy" || diff === "medium" || diff === "hard") {
        totalDifficulties[diff]++;
      }
    });

    solvedProblems.forEach(p => {
      const diff = (p.difficultylevel || "").toLowerCase();
      if (diff === "easy" || diff === "medium" || diff === "hard") {
        solvedDifficulties[diff]++;
      }
    });

    // 4. Count total vs solved by topic tags
    const totalTopics = {};
    const solvedTopics = {};

    allProblems.forEach(p => {
      const tag = p.tag === 'linkedlist' ? 'linkedList' : p.tag;
      if (tag) {
        totalTopics[tag] = (totalTopics[tag] || 0) + 1;
      }
    });

    solvedProblems.forEach(p => {
      const tag = p.tag === 'linkedlist' ? 'linkedList' : p.tag;
      if (tag) {
        solvedTopics[tag] = (solvedTopics[tag] || 0) + 1;
      }
    });

    // Compile topics object
    const topics = {};
    Object.keys(totalTopics).forEach(tag => {
      topics[tag] = {
        total: totalTopics[tag],
        solved: solvedTopics[tag] || 0
      };
    });

    // 5. Fetch all submissions from past 365 days
    const pastYearDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const submissions = await Submission.find({
      userId,
      createdAt: { $gte: pastYearDate }
    }, "createdAt");

    // 6. Group submissions by date YYYY-MM-DD
    const submissionsMap = {};
    submissions.forEach(sub => {
      if (sub.createdAt) {
        const dateStr = sub.createdAt.toISOString().split("T")[0];
        submissionsMap[dateStr] = (submissionsMap[dateStr] || 0) + 1;
      }
    });

    const score = (solvedDifficulties.easy * 10) + (solvedDifficulties.medium * 30) + (solvedDifficulties.hard * 100);

    res.status(200).json({
      totalProblems: totalDifficulties,
      solvedProblems: solvedDifficulties,
      submissions: submissionsMap,
      topics,
      solvedList: solvedProblems,
      score
    });

  } catch (error) {
    console.error("Error generating profile stats:", error);
    res.status(500).json({ error: "Failed to generate profile stats" });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    // 1. Fetch all users and populate their solved problems
    const users = await User.find({}, "firstName problemSolved").populate({
      path: "problemSolved",
      select: "difficultylevel"
    });

    // 2. Fetch all submissions to count totals for accuracy calculation
    const submissions = await Submission.find({}, "userId status");

    // 3. Map submissions by userId for O(1) lookups
    const submissionStats = {};
    submissions.forEach(sub => {
      if (sub.userId) {
        const uId = sub.userId.toString();
        if (!submissionStats[uId]) {
          submissionStats[uId] = { total: 0, accepted: 0 };
        }
        submissionStats[uId].total++;
        if (sub.status === "accepted") {
          submissionStats[uId].accepted++;
        }
      }
    });

    // 4. Compute score, solved details, and accuracy for each user
    const leaderboard = users.map(user => {
      const uId = user._id.toString();
      const solved = user.problemSolved || [];
      
      let easyCount = 0;
      let mediumCount = 0;
      let hardCount = 0;

      solved.forEach(p => {
        const diff = (p.difficultylevel || "").toLowerCase();
        if (diff === "easy") easyCount++;
        else if (diff === "medium") mediumCount++;
        else if (diff === "hard") hardCount++;
      });

      const score = (easyCount * 10) + (mediumCount * 30) + (hardCount * 100);
      
      const stats = submissionStats[uId] || { total: 0, accepted: 0 };
      const accuracy = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0;

      return {
        _id: user._id,
        firstName: user.firstName || "Anonymous",
        score,
        solvedCount: solved.length,
        solvedBreakdown: { easy: easyCount, medium: mediumCount, hard: hardCount },
        accuracy,
        totalSubmissions: stats.total
      };
    });

    // 5. Sort leaderboard by score (descending), then solvedCount (descending), then accuracy (descending)
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.solvedCount !== a.solvedCount) return b.solvedCount - a.solvedCount;
      return b.accuracy - a.accuracy;
    });

    res.status(200).json(leaderboard);

  } catch (error) {
    console.error("Error generating leaderboard statistics:", error);
    res.status(500).json({ error: "Failed to generate leaderboard stats" });
  }
};

module.exports={createProblem,updateProblem,deleteProblem,getProblemBiId,getAllProblem, solvedAllProblembyUser,submittedProblem,getProfileStats,getLeaderboard};
