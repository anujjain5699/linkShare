const express=require('express')
const connectDB=require('./controller/db')
const authRoutes=require('./routes/authRoutes')
const cors=require('cors')
const app=express();
require('dotenv').config({path:'./config.env'})
const PORT=process.env.PORT || 3000;

//cors
const corsOption={
    origin:process.env.ALLOWED_CLIENTS.split(',')
}


//middleware
app.use(express.json()); 
app.set('view engine','ejs')
app.use(express.static('public'))
app.use(cors(corsOption))
// app.use(function(req, res,next){
//     res.header("Access-Control-Allow-Origin", "*")
//     res.header("Access-Control-Allow-Methods", "POST,GET,DELETE,PUT")
//     res.header("Access-Control-Allow-Headers", "Origin,X-requested-With,Content-Type,Accept")
//     next()
// })

//connect database
connectDB()

//Routes
app.use(authRoutes);

app.listen(PORT,()=>{
    console.log(`Listening on port`);
})