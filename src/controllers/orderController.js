let orderModel=require("../models/orderModel")
let userModel=require("../models/userModel")
let mongoose=require('mongoose');
const res = require("express/lib/response");
const { send } = require("express/lib/response");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");

//========================================VALIDATIONS=================================================================
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
}
isValidRequestBody = function (requestbody) {
    if (Object.keys(requestbody).length > 0) {
        return true;
    }
}
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
const isvalidStatus = function (value) {
    return ["pending", "completed", "canceled"].indexOf(value) !== -1
}
//===================================================================================================================
let order=async function(req,res){
try{
let userId=req.params.userId

if(!isValidObjectId(userId)){
    return res.status(400).send({status:false,msg:"invalid id"})
}
let userExist=await userModel.findById(userId)

if(!userExist){
    return res.status(404).send({status:false,msg:"user with this userId not found"})
}
let data=req.body
if(!isValidRequestBody(data)){
    return res.status(400).send({status:false,msg:"please provide some data"})
}

let {items,totalPrice,totalItems,totalQuantity,cancellable,status}=data
totalPrice=0
totalQuantity=0

let checkCart=await cartModel.findOne({userId:userId})
console.log(checkCart)
if(!checkCart){
    return res.status(400).send({status:true,msg:"cart with this id not present"})
}
if(!isValid(items)){
    return res.stauts(400).send({status:true,msg:"your items array is empty, Nothing to order"})
}
for (let i = 0; i < items.length; i++) {
    if (!items[i].quantity && items[i].quantity == 0) {
   return res.status(400).send({ status: false, msg: "please give quantity to products" }) 
   }
if(!isValidObjectId(items[i].productId)){
    return res.status(400).send({status:true,msg:"invalid productId"})
}
}
let productid
let storeprodid=[]
for(let i=0;i<items.length;i++){
    productid=items[i].productId
    storeprodid.push(productid)
}
let product
let storeprod=[]
for(let i=0;i<storeprodid.length;i++){
    product=await productModel.findById(storeprodid[i])
storeprod.push(product)
}
let resProd=storeprod.flat()
console.log(resProd)
for(let i=0;i<resProd.length;i++){
    if(resProd.isDeleted==true){
        return res.status(400).send({status:false,msg:"some product you wanna order is deleted"})
    }
    totalPrice=totalPrice+(storeprod[i].price)*(items[i].quantity)
    totalQuantity=totalQuantity+items[i].quantity
}
if(status){if(!isvalidStatus(status)){
    return res.status(400).send({status:false,msg:"invalid status"})}
}
totalItems=items.length
let crted={
    userId,
    items,
    totalPrice,
    totalItems,
    totalQuantity,
    cancellable,
    status
}
let Order=await orderModel.create(crted)
 res.status(200).send({status:true,msg:"order placed",data:Order})
}
catch(err){res.status(500).send({status:false,error:err.message})}
}

// ===============================================================update order====================================================
let updateOrder= async function(req,res){
let userId=req.params.userId
let orderId=req.body.orderId
let status=req.body.status
if(!isValidRequestBody(req.body)){
    return res.status(400).send({status:false,msg:"please give orderId and status in body"})
}
if(!isValidObjectId(userId)){
    return res.status(400).send({status:false,msg:"invalid userId"})
}
let checkuser=await userModel.findById(userId)
if(!checkuser){
    return res.status(404).send({status:false,msg:"user with this id not found"})
}
if(!isValidObjectId(orderId)){
    return res.status(400).send({status:false,msg:"invalid orderId"})
}
let checkOrder=await orderModel.findById(orderId)
if(!checkOrder){
    return res.status(404).send({status:false,msg:"order with this id not found"})
}
if(!isvalidStatus(status)){
    return res.status(400).send({status:false,msg:"invalid status"})
}
if(checkOrder.cancellable==false){
    return res.status(400).send({status:false,msg:"you can't update your order, since it is not cancellable"})
}   
let updateOrder=await orderModel.findOneAndUpdate({_id:orderId},{status:status},{new:true})
res.status(200).send({status:true,msg:"order updated sucessfully",data:updateOrder})
}
//============================================================================================================
module.exports={
    order,
    updateOrder
}
