const User=require("../Models/user");
const validate=require("../utils/validator");
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const redisclient=require('../config/redis')
const Submission=require('../Models/submission');


const register=async(req,res)=>{
    try{
       validate(req.body);
       const {firstName,emailId,password}=req.body;
       req.body.role='user',
       req.body.password = await bcrypt.hash(password,10);
       const user=await User.create(req.body);
   const token=jwt.sign({_id:user.id , emailId:emailId,role:'user'},process.env.JWT_KEY,{expiresIn:60*60});
   res.cookie('token',token,{maxAge:60*60*1000});
   res.status(201).send("User Register Successfully");
      
    }
    catch(err){
  res.status(400).send("Error: "+err);
    }
}
const login=async(req,res)=>{
  try{
      const {emailId,password}=req.body;
      if(!emailId)
        throw new Error("Invalid Credentials");
      if(!password)
        throw new Error("Invalid Credentials");
const user = await User.findOne({ emailId });

if (!user) {
    throw new Error("Invalid Credentials");
}
  const  match= await bcrypt.compare(password,user.password);
  if(!match)
    throw new Error("Invalid Credentials")
  
 const token=jwt.sign({_id:user.id , emailId:emailId,role:user.role},process.env.JWT_KEY,{expiresIn:60*60});
   res.cookie('token',token,{maxAge:60*60*1000});
res.status(200).send("Login Successfullly");
  }
  catch(err){
res.status(401).send("Error: "+ err);
  }
}
const lagout = async(req,res)=>{
  try{

    const {token} = req.cookies;

    if(!token){
      return res.status(401).send("Token not found");
    }

    const payload = jwt.decode(token);

    if(!payload){
      return res.status(401).send("Invalid token");
    }

    await redisclient.set(`token:${token}`, "Blocked");

    await redisclient.expireAt(`token:${token}`, payload.exp);

    res.cookie("token", null, {
      expires: new Date(Date.now())
    });

    res.send("Logout Successfully");

  }
  catch(err){
    res.status(503).send("Error: "+err.message);
  }
}
const adminRegister=async(req,res)=>{
  try{
       validate(req.body);
       const {firstName,emailId,password}=req.body;

       req.body.password = await bcrypt.hash(password,10);
       const user=await User.create(req.body);
   const token=jwt.sign({_id:user.id , emailId:emailId,role:user.role},process.env.JWT_KEY,{expiresIn:60*60});
   res.cookie('token',token,{maxAge:60*60*1000});
   res.status(201).send("User Register Successfully");
      
    }
    catch(err){
  res.status(400).send("Error: "+err);
    }

}
const deleteProfile=async(req,res)=>{
try{
     const userid=req.result._id;
     await User.findByIdAndDelete(userid);
    //  await Submission.deleteMany({userid});
     res.status(200).send("Delete Sucessfully");
}
catch(err)
{
res.status(500).send("Internal Server Error");
}
}


module.exports={register,login,lagout,adminRegister,deleteProfile};


