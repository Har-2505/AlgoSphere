const jwt = require('jsonwebtoken');
const redisclient = require('../config/redis');
const User = require('../Models/user');

const adminMiddleware = async(req,res,next)=>{
    try{

        const {token}=req.cookies;

        if(!token){
            throw new Error("Token is not present");
        }

        const payload = jwt.verify(
            token,
            process.env.JWT_KEY
        );

        const {_id, role}=payload;

        if(!_id){
            throw new Error("ID is missing");
        }

        const result = await User.findById(_id);

        if(!result){
            throw new Error("User doesn't exist");
        }

        if(role !== "admin"){
            throw new Error("Only admin can access");
        }

        const isBlocked = await redisclient.exists(
            `token:${token}`
        );

        if(isBlocked){
            throw new Error("Token is blocked");
        }


        req.result=result;
        next();

    }
    catch(err){
        res.status(401).send("error: "+err.message);
    }
}


module.exports=adminMiddleware;