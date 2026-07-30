const express = require('express');
const {register,login,lagout,adminRegister,deleteProfile} =require("../controllers/userAuthent");
const authRouter=express.Router();
const userMiddleware=require('../Middleware/userMiddleware')
const adminMiddleware=require('../Middleware/adminMiddleware');
authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/lagout',lagout)
authRouter.post('/admin/register',adminMiddleware,adminRegister);

authRouter.post('/lagout',userMiddleware,lagout);
authRouter.delete('/profile',userMiddleware,deleteProfile);
module.exports=authRouter;