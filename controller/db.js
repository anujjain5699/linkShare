const mongoose = require('mongoose')
require('dotenv').config({path:'./config.env'})

function connectDB(){
    //database connection
    mongoose.connect(process.env.MONGOURL)
        .then(()=>{
            console.log(`DB connected listening on http://localhost:${process.env.PORT}`)
        })
        .catch(err=>console.log(err.message))
}

module.exports =connectDB