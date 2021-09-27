const express=require('express')
const connectDB=require('./controller/db')
const authRoutes=require('./routes/authRoutes')
const cors=require('cors')
const app=express();
const path = require('path')
require('dotenv').config({path:'./config.env'})
const PORT=process.env.PORT || 3000;

//cors
const corsOption={
    origin:process.env.ALLOWED_CLIENTS.split(',')
}


//middleware
app.use(express.json()); 
app.set('view engine','ejs')
app.use('/public',express.static(path.join(__dirname, 'public')))
app.use(cors(corsOption))

//connect database
connectDB()

//Routes
app.use(authRoutes);

app.listen(PORT,()=>{
    console.log(`Listening on port localhost`);
})