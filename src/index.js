const express = require("express")
const app = express()
const mongoose = require("mongoose")
const route = require ("./route/route")
const bodyparser = require("body-parser")
const multer = require("multer")

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))
app.use(multer().any())

mongoose.connect("mongodb+srv://As_357:oJAKh3z4S39UgaUZ@cluster0.k4tlh.mongodb.net/As_357",{
    useNewUrlParser:true
})
.then(()=>{console.log("mongodb is connected")})
.catch((err)=>{console.log(err.message)})

app.use("/",route);

const port = process.env.PORT || 3000

app.listen(port,()=>{
    console.log(`server is running at ${port}`)
})