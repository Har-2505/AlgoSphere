const validator=require('validator');

const validate=(data)=>{
const mandatoryfield=['firstName','emailId','password'];
const IsAllowed = mandatoryfield.every((k) => Object.keys(data).includes(k));
if(!IsAllowed)
{
    throw new Error("Soe Field Missing");

}

if(!validator.isEmail(data.emailId))
    throw new Error("Invalid Email");

if(data.password.length < 6)
    throw new Error("Password must be at least 6 characters long");
}
module.exports=validate;