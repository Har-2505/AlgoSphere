const express=require('express');
const adminMiddleware=require('../Middleware/adminMiddleware');
const problemRouter=express.Router();

const userMiddleware =require('../Middleware/userMiddleware');
const {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemBiId,
    getAllProblem,
    solvedAllProblembyUser,
    submittedProblem
} = require("../controllers/userProblem");

problemRouter.post('/create',adminMiddleware,createProblem);
problemRouter.put('/update/:id',adminMiddleware,updateProblem);
problemRouter.delete('/delete/:id',adminMiddleware,deleteProblem);


problemRouter.get('/problemById/:id',userMiddleware,getProblemBiId);
problemRouter.get('/getAllProblem',userMiddleware,getAllProblem);
problemRouter.get('/problemSolvedByUser',userMiddleware,solvedAllProblembyUser);
problemRouter.get('/submittedProblem/:pid',userMiddleware,submittedProblem);
module.exports=problemRouter;