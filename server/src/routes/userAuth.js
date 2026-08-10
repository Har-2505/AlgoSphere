const express = require('express');
const {register,login,logout,adminRegister,deleteProfile} =require("../controllers/userAuthent");
const authRouter=express.Router();
const userMiddleware=require('../Middleware/userMiddleware')
const adminMiddleware=require('../Middleware/adminMiddleware');
authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout)
authRouter.post('/admin/register',adminMiddleware,adminRegister);
authRouter.get('/check',userMiddleware,(req,res)=>{
    const reply={
        firstName:req.result.firstName,
        emailId:req.result.emailId,
        _id:req.result._id
    }
    res.status(200).json({
        user:reply,
        message:"Valid User"
    })
})


authRouter.post('/logout',userMiddleware,logout);
authRouter.delete('/profile',userMiddleware,deleteProfile);
module.exports=authRouter;