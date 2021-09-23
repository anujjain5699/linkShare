const express=require('express')
const connectDB=require('./controller/db')
const authRoutes=require('./routes/authRoutes')
const app=express();
require('dotenv').config({path:'./config.env'})
PORT=process.env.PORT || 3000;

//middleware
app.use(express.json()); 
app.set('view engine','ejs')
app.use(express.static('public'))

//connect database
connectDB()

//Routes
app.use(authRoutes);

app.listen(PORT,()=>{
    console.log(`Listening on port`);
})