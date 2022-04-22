const jwt =require('jsonwebtoken')
const authentication = async(req,res,next)=>{
 try {
     let token = req.header("Authorization","Bearer Token")
     if(!token){
         return res.status(400).send({status:false,message:"give the token"})
     }
     let toeknData = token.split(" ")
     let verifyToken = jwt.verify(toeknData[1],"group2secretkey")
     if(!verifyToken){
         return res.status(401).send({status:false,message:"not verified user"})
     }
     next()
 } catch (error) {
     res.status(500).send({status:false,message:error.message})
 }
}
const authorization = async (req,res,next)=>{
    try {

        let token = req.header("Authorization","Bearer Token")
        if(!token){
            return res.status(400).send({status:false,message:"give the token"})
        }
        let toeknData = token.split(" ")
        let verifyToken = jwt.verify(toeknData[1],"group2secretkey")

        let userId=req.params.userId
    
            if(verifyToken.userId!== userId){    
                return res.status(404).send({status: false, msg: "you are not authorized to change this"})
            }
            next()

    } catch (error) {
        return res.status(500).send({status:false,message:error.message})
    }
}





module.exports={
    authentication,
    authorization
}