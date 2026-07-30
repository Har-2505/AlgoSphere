const jwt=require('jsonwebtoken');
const User=require('../Models/user')
const redisclient=require('../config/redis')

const userMiddleware=async(req,res,next)=>{
    try{
        const {token}=req.cookies;
        if(!token)
        {
            throw new Error("Token is  not prsent");
            
        }
         const payload = jwt.verify(req.cookies.token,process.env.JWT_KEY);
        
        const {_id}=payload;

        if(!_id)
        {
            throw new Error("ID is missing");
        }

        const result = await User.findById(_id);

        if(!result)
        {
            throw new Error("User Doesn't Exist");
        }

    const isBlocked=await redisclient.exists(`token:${token}`);
  if(isBlocked)
  {
    throw new Error("Invalid Token");
  }


        req.result=result;
        next();

    }

    
    catch(err)
    {
        res.status(401).send("error: " + err.message);
    }
    }

module.exports=userMiddleware;