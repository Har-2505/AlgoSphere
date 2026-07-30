const express = require('express');
const SubmitRouter=express.Router();
const { submitCode, runCode } = require('../controllers/userSubmission')
const userMiddleware =require('../Middleware/userMiddleware');

SubmitRouter.post("/submit/:id",userMiddleware,submitCode)
SubmitRouter.post("/run/:id",userMiddleware,runCode);
module.exports=SubmitRouter;
