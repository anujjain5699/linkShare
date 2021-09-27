const router = require('express').Router()
const authController = require('../controller/authController')

//upload file
router.post('/api/files',authController.files_post)
//get ready to send link
router.get('/files/:uuid',authController.files_get)
//get download link
router.get('/files/download/:uuid',authController.files_download)
//send file via email
router.post('/api/files/send',authController.email_post)

router.get('/',(req,res) =>{
    try{
        res.render('index')
    }catch(e){console.log(e.message)}
})

module.exports=router