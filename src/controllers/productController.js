const mongoose = require("mongoose");
const {
  findById
} = require("../models/productModel");
const productModel = require("../models/productModel");
const s3link = require("../aws/s3link");

//========================================VALIDATIONS=================================================================
isValidRequestBody = function (requestbody) {
  if (Object.keys(requestbody).length > 0) {
    return true;
  }
};
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
const isvalidStringOnly = function (value) {
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

//==================================================================================================================

const createProduct=async function(req,res){
  try{
  let data=req.body
  let files=req.files
  if(!(isValidRequestBody(data)||(files))){
    return res.status(400).send({status:false,msg:"please give some data to update"})
  }

  let {title,description,price,currencyId,currencyFormat,isFreeShipping,availableSizes,installments,isDeleted}=data
let productImage

if(!isValid(title)){
  return res.status(400).send({status:false,msg:"please give title"})
}
let duPtitle=await productModel.findOne({title})

if(duPtitle){
  return res.status(400).send({status:false,msg:"this title already exist"})
}
if(!isValid(description)){
  return res.staus(400).send({status:false,msg:"please give product description"})
}
if(!isValid(price)){
  return res.staus(400).send({status:false,msg:"please provide price of your product"})
}
if(!isValid(currencyId)){
  return res.status(400).send({status:false,msg:"please give currencyId"})
}
if(currencyId!="INR"){
  return res.status(400).send({status:false,msg:"currencyId only take INR INSIDE STRING"})
}
if(currencyFormat!="₹"){
  return res.status(400).send({status:false,msg:"give ₹ symboll inside string"})
}
if(!isValid(currencyFormat)){
  return res.status(400).send({status:false,msg:"please give currencyFormat"})
}
if(!isValid(availableSizes)){
  return res.status(400).send({status:false,msg:"please set availableSizes"})
}
availableSizes=availableSizes.split(",")
if (availableSizes) {
for(let i=0;i<availableSizes.length;i++){
if (!["S", "XS","M","X", "L","XXL", "XL"].includes(availableSizes[i])) {
  return res.status(400).send({ status: false,msg: "invalid sizes",});
}
}}
if(!files.length>0){
  return res.status(400).send({status:false,msg:"please give file"})
}
productImage=await s3link.uploadFile(files[0])

if(installments){
  var z1 = /^[0-9]*$/;
if (!z1.test(installments)) {
return res.status(400).send({status:false,msg:"installments takes number only"})
}
}
let products={
  title,
  description,
  productImage,
  price,
  currencyId,
  currencyFormat,
  availableSizes,
  installments,
  isFreeShipping,
  isDeleted,
}
let SaveProducts=await productModel.create(products)
res.status(201).send({status:true,msg:"Sucess",data:SaveProducts})}

catch(err){
 return res.status(500).send({status:false,error:err.message})}
}
//==========================================================================================================================

let getProduct= async function (req, res) {
  try {
    let data = req.query;
    const filterquery = { isDeleted: false };
    const {name,size,priceGreaterThan,priceLessThan } = data;

    if (isValid(size)) {
      filterquery.availableSizes = size.trim();
    }
    if (!isvalidStringOnly(size)) {
      return res.status(400).send({ staus: false, msg: "size required" });
    }
    if (isValid(name)) {
      filterquery.title ={$regex:name.trim()}
    }
if(name){
    if (!isValid(name)){
      return res.status(400).send({ status: false, msg: "name is required" });
    }}
    if(isValid(priceGreaterThan)){
        filterquery.price={$gt:priceGreaterThan}
    }
    if(isValid(priceLessThan)){
      filterquery.price= {$lt:priceLessThan}
  }
  let searchProducts
  
  if(sortbyprice){
    filterquery.sortbyprice=sortbyprice
    
  if(sortbyprice==-1){
    
   searchProducts = await productModel.find(filterquery).sort({price:-1})
  return res.status(200).send({status:true,msg:"price,higher to lower",data:searchProducts})}
  if(sortbyprice==1){
    
     searchProducts = await productModel.find(filterquery).sort({price:1})
    return res.status(200).send({status:true,msg:"price lower to higher",data:searchProducts})}
    
     else{return res.status(400).send({status:false,msg:"sortbyprice only take 1 and -1"})}
    }
     
     else{
searchProducts=await productModel.find(filterquery)}

    if (Array.isArray(searchProducts) && searchProducts.length == 0) {
      return res.status(404).send({ status: false, msg: "No product found" });
    }
    res.status(200).send({ status: true,msg:"sucess", data: searchProducts });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};
// =========================================================================================================================================================================================================
const getProductById =async(req,res)=>{
try {
 const productId = req.params.productId

 if(!productId){
   return res.status(400).send({status:false,message:"product id is required field"})
 }
if(!isValidObjectId(productId)){
 return res.status(400).send({status:false,message:"invalid Id"})
}
checkId = await productModel.findById({_id:productId})

if(!checkId){return res.status(404).send({status:false,msg:"no data with this id found"})}
console.log(checkId)
if(checkId.isDeleted==true){return res.status(400).send({status:false,msg:"deleted data"})}

res.status(200).send({status:true,msg:"sucess",data:checkId})
  
} catch (error) {
  return res.status(500).send({status:false,message:error.message})
}
};
//  ==============================================================================================================================================
const updateProduct = async function (req, res) {
try {
  let productId = req.params.productId;

  if (!isValidObjectId(productId)) {
    return res.status(400).send({ status: false, msg: "invalid objectid" });
  }
  let checkidinDb=await productModel.findById(productId)

  if(!checkidinDb){
    return res.status(404).send({status:false,msg:" id is not found"})
  }
  if (checkidinDb.isDeleted == true) {
    return res.status(404).send("This product Already Deleted");
   }
  
let data=req.body
  let {title,description,price,isFreeShipping,availableSizes,installments}=data

  let files=req.files

  if(!(isValidRequestBody(data)||(files))){
    return res.status(400).send({status:false,msg:"please give some data to update"})
  }
  if (!isvalidStringOnly(title)) {
    return res.status(400).send({status:false,msg:"please give title"})
  }
  if(title){
  const titleAlreadyUsed = await productModel.findOne({ title:title });
  console.log(title)
  if (titleAlreadyUsed) {
   return res.status(400).send({status:false,msg:"tittle alerady exist"})
  }}
  if (!isvalidStringOnly(description)) {

  return res.status(400).send({ status: false, msg: "description is required for updation" });
  }
  if (!isvalidStringOnly(price)) {
     return res.status .send({ status: false, msg: "price is required for updation" })}
     if(price){
      var z1 = /^[0-9]*$/;
  if (!z1.test(price)) 
  {return res.status(400).send({status:false,msg:"price takes number only"})}
  }
  if (!isvalidStringOnly(isFreeShipping)) {
   return res.status(400).send({ status: false, msg: "isfreeshipping is required for updation" });
  }
  if (!isvalidStringOnly(availableSizes)) {
    return res.status(400).send({ status: false, msg: "availableSizes is required for updation" });
    }
    if (availableSizes) {
      availableSizes=availableSizes.split(",")
      for(let i=0;i<availableSizes.length;i++){
      if (!["S", "XS","M","X", "L","XXL", "XL"].includes(availableSizes[i])) {
        return res.status(400).send({status: false,msg: "invalid sizes"})
      }
    }}
    if (!isvalidStringOnly(installments)) {
      return res.status(400).send({ status: false, msg: "installments is required for updation" });
      }
      if(installments){
        var z1 = /^[0-9]*$/;
    if (!z1.test(installments)){
    return res.status(400).send({status:false,msg:"installments takes number only"})}
    }
  let productImage
if(files){
if(files.length>0){
productImage = await s3link.uploadFile(files[0])}}

  let updateProduct = await productModel.findOneAndUpdate( { _id:productId, isDeleted: false },data,{ new: true }
  )
  res.status(201).send({status:false,msg:"updated sucessfully",data:updateProduct})

} catch (error) {
  res.status(500).send({ satus: false, msg: error.message });
}
};
// ================================================================================================================================================================
const deleteProductByid = async(req,res)=>{
 try {
   const productId = req.params.productId
   if(!productId){
     return res.status(400).send({status:false,message:"product id is required field"})
   }
 if(!isValidObjectId(productId)){
   return res.status(400).send({status:false,message:"invalid Id"})
 }
checkId = await productModel.findById(productId)

if(!checkId){
  return res.status(404).send({status:false,msg:"no data with this id found"})
}
if(checkId.isDeleted==true){
  return res.status(400).send({status:false,msg:"deleted data"})
}
 deletebyid = await productModel.findByIdAndUpdate({_id:productId},{isDeleted:true,deletedAt:new Date()},{new:true})
 res.status(200).send({status:false,msg:"sucess",data:deletebyid})

 } catch (error) {
   return res.send(500).send({status:false,message:error.message})
 }
}
//==============================================================================================================
module.exports={
  createProduct,
  getProduct,
  getProductById,
  updateProduct,
  deleteProductByid
}

