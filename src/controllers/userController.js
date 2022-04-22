//===========================================================================================================================
const userModel = require("../models/userModel")
const bcrypt = require ("bcrypt")
const saltRounds =10
const jwt=require("jsonwebtoken")
const s3link = require("../aws/s3link")
const mongoose = require("mongoose")

//========================================VALIDATIONS==============================================================
const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};
const isValid = function (value) {
  if (typeof value === "undefined" || typeof value == "null") {
    return false;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return true;
  }
  if (typeof value === ("object") && Object.keys(value).length > 0) {
      return true;
    }
};
isValidRequestBody = function (requestbody) {
  if (Object.keys(requestbody).length > 0) {
    return true;
  }
};
//=================================================================================================================
const createUser= async function(req,res){
try{
      const data = req.body
      let {fname,lname,email,password,phone,address,} =data
      
      if (!isValidRequestBody(data)) {
          return res.status(400).send({ status: false, msg: "Body is require field" })
      }
      if (!isValid(fname)) {
          return res.status(400).send({ status: false, msg: "fname is require field " })
      }
      if (!isValid(lname)) {
          return res.status(400).send({ status: false, msg: "lname is require field" })
      }
      if (!isValid(email)) {
          return res.status(400).send({ status: false, msg: "email is require field" })
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).send({ status: false, msg: `Invalid email address!` });
      }   
      const DuplicateEmail = await userModel.findOne({ email });
      if (DuplicateEmail) {
          return res.status(400).send({ status: false, message: "This email Id already exists with another user" });
      }
      if (!isValid(password)) {
          return res.status(400).send({ status: false, msg: "password is require field" })
      }
      if (!(password.trim().length >= 8 && password.trim().length <= 15)) {
        return res.status(400).send({ status: false, message: "Please provide password with minimum 8 and maximum 14 characters" })
    };
      if (!isValid(phone)) {
          return res.status(400).send({ status: false, msg: "phone is require field" })
      }
      if (!/^([+]\d{2})?\d{10}$/.test(phone)) {
        return res.status(400).send({ status: false, msg: "please provide a valid phone Number" });
      }
      const duplicatePhone = await userModel.findOne({ phone })
      if (duplicatePhone) {
          return res.status(400).send({ status: false, message: "This phone number already exists with another user" });
      }
      if (!isValid(address)) {
          return res.status(400).send({ status: false, msg: "address require field" })
      }
      if(!isValid(address.shipping.street)){
          return res.status(400).send({status:false,msg:" shipping street is require field"})
        }
      if(!isValid(address.shipping.city)){
          return res.status(400).send({status:false,msg:" shipping city is require field"})
        }
      if(!isValid(address.shipping.pincode)){
          return res.status(400).send({status:false,msg:" shipping pincode is require field"})
        }
      if (!/^([+]\d{2})?\d{6}$/.test(address.shipping.pincode.trim())) {
          return res.status(400).send({ status: false, message: 'Shipping PinCode not valid, please provide 6 Digit valid pinCode' });
      }
      if(!isValid(address.billing.street)){
          return res.status(400).send({status:false,msg:"billing street is require field"})
        }
      if(!isValid(address.billing.city)){
          return res.status(400).send({status:false,msg:"billing city is require field"})
        }
      if(!isValid(address.billing.pincode)){
          return res.status(400).send({status:false,msg:"billing pincod is require field"})
        }
      if (!/^([+]\d{2})?\d{6}$/.test(address.billing.pincode.trim())) {
          return res.status(400).send({ status: false, message: 'Billing PinCode not valid, please provide 6 Digit valid pinCode' });
      }

      let files=req.files
      if(!isValidRequestBody(files)){
        return res.status(400).send({status:false,message:"Add file is a require filed"})
      }
      if(files.length==0){return res.status(400).send({status:false,msg:"please give file"})}

      profileImage = await s3link.uploadFile(files[0])
    
      let hash = bcrypt.hashSync(password, saltRounds);
      console.log(password)
      const userData = {
          fname,
          lname,
          profileImage,
          email,
          password:hash,
          phone,
          address
      }
      const savedUser = await userModel.create(userData);
      res.status(201).send({status:true,message:'User Created',data:savedUser})
  }
catch(err){res.status(500).send({Status:false,error:err.message})}}

//   =================================================================================================================================================
const login = async function (req, res) {
  try {
      const data = req.body
      const { email, password } = data
      let query = req.query
      if (isValidRequestBody(query)) {
          return res.status(400).send({ status: false, message: 'this is not allowed' })
      }
      if (!data) {
          return res.status(400).send({ status: false, message: "please input Some Data" })
      }
      if (!isValid(email)) {
          return res.status(401).send({ status: false, message: "please input valid emailId" })
      }
      if (!isValid(password)) {
          return res.status(401).send({ status: false, message: "please input valid password" })
      }
      const user = await userModel.findOne({ email:email})
      if(!user){
        return res.status(400).send({ status: false, message: "mail id is not found" });
      }
          const decryptedPassword = await bcrypt.compareSync(data.password, user.password);
          console.log(decryptedPassword)
        if(!decryptedPassword){
        res.status(401).send({ error: "Password is not found" });
    }
      if(decryptedPassword){
          const userID = user._id
      const payLoad = { userId: userID }
      const secretKey = "group2secretkey"

      const token = jwt.sign(payLoad, secretKey, { expiresIn: "1hr" })

      return res.status(201).send({ status: true, message: "login successful", data: {userId: user._id,token} })
      }
  } catch (error) {
      return res.status(500).send({ status: false, message: error.message })
  }
}
// =================================================================================================================================
const getUser=async function(req,res){
try{
  let userId=req.params.userId
  if(!isValidObjectId(userId)){return res.status(400).send({status:false,msg:"invalid userId format"})}

let getUser=await userModel.findById(userId)
if(!getUser){
return res.status(404).send({status:false,msg:"no user with this Id found"})
}
res.status(200).send({status:true,msg:"sucess",data:getUser})
}
catch(err){res.status(500).send({status:false,error:err.message})}
}
// ==============================================================================================================================================================

const updateUser = async function(req,res){
  try{
      const userId = req.params.userId
    if (!isValidObjectId(userId)) {
        return res.status(400).send({ status: false, msg: "userId is invalid" })
    }
    checkuser=await userModel.findById(userId)

    if(!checkuser){return res.status(404).send({status:true,msg:"user with this id not found"})}
    
    let { fname, lname, email, phone, password, address } = req.body
    let file = req.files
    const dataObject = {};
    if (!(isValidRequestBody(req.body)||(file))) {
        return res.status(400).send({ status: false, msg: "enter data to update" })
    }
    if (isValid(fname)) {
        dataObject['fname'] =fname
    }
    if (isValid(lname)) {
        dataObject['lname'] = lname
    }
    if (isValid(email)) {
        let findMail = await userModel.findOne({ email: email })
        if (findMail) {
            return res.status(400).send({ status: false, msg: "this email is already register" })
        }
        dataObject['email'] = email
    }
    if (isValid(phone)) {
        let findPhone = await userModel.findOne({ phone: phone })
        if (findPhone) {
            return res.status(400).send({ status: false, msg: "this mobile number is already register" })
        }
        dataObject['phone'] = phone
    }
    if (isValid(password)) {
        if (!password.length >= 8 && password.length <= 15) {
            return res.status(400).send({ status: false, msg: "password length should be 8 to 15" })
        }
        let saltRound = 10
        const hash = await bcrypt.hash(password, saltRound)
        dataObject['password'] = hash
    }
    if (file.length > 0) {
        let uploadFileUrl = await s3link.uploadFile(file[0])
        dataObject['profileImage'] = uploadFileUrl
    }
    if (address) {
        if (address.shipping) {
            if (address.shipping.street) {

                dataObject['address.shipping.street'] = address.shipping.street
            }
            if (address.shipping.city) {

                dataObject['address.shipping.city'] = address.shipping.city
            }
            if (address.shipping.pincode) {
                
                if(!/(^[0-9]{6}(?:\s*,\s*[0-9]{6})*$)/.test(address.shipping.pincode)){
                 return res.status(400).send({status:false, msg:`pincode six digit number`})
                }
                dataObject['address.shipping.pincode'] = address.shipping.pincode
            }
        }
        if (address.billing) {
            if (address.billing.street) {

                dataObject['address.billing.street'] = address.billing.street
            }
            if (address.billing.city) {

                dataObject['address.billing.city'] = address.billing.city
            }
            if (address.billing.pincode) {
               
                if(!/(^[0-9]{6}(?:\s*,\s*[0-9]{6})*$)/.test(address.billing.pincode)){
                  return res.status(400).send({status:false, msg:`pincode six digit number`})
                 }
                dataObject['address.billing.pincode'] = address.billing.pincode
            }
        }
    }
    const updateProfile = await userModel.findOneAndUpdate({_id:userId }, dataObject , { new: true })
    if (!updateProfile) {
        return res.status(404).send({ status: false, msg: "user profile not found" })
    }
    return res.status(200).send({ status: true, msg: "User Profile updated", data: updateProfile })
}
  catch(err){res.status(500).send({status:false,error:err.message})}
}
//============================================================================================================
module.exports={
  createUser,
  login,
  getUser,
  updateUser
}
