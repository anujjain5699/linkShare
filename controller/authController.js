const multer = require('multer')
const path = require('path')
const File = require('../models/fileModel')
const { v4: uuid4 } = require('uuid')
const sendMail = require('../services/emailServices')
let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
})

let upload = multer({
    storage: storage,
    limits: { fileSize: 100000 * 100 }
}).single('myFile')

module.exports.files_post = (req, res) => {

    //Store file
    upload(req, res, async (err) => {
        //validate request
        if (!req.file) {
            return res.status(404).json({ error: "All fields required" });
        }

        if (err) {
            return res.status(500).send({ error: err.message })
        }

        //Store into Database
        const file = new File({
            filename: req.file.filename,
            uuid: uuid4(),
            path: req.file.path,
            size: req.file.size,
        })

        const response = await file.save();
        return res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` })
    })
}

module.exports.files_get = async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid })
        if (!file) {
            return res.render('download', { error: "Link has been expired..." })
        }
        return res.render('download', {
            uuid: file.uuid,
            fileName: file.filename,
            fileSize: file.size,
            downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`
        })

    } catch (e) {
        return res.render('download', { error: "Link not working.." })
    }
}

module.exports.files_download = async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid })
        if (!file) {
            return res.render('download', { error: "Link has been expired..." })
        }

        const filePath = `${__dirname}/../${file.path}`;
        res.download(filePath);
    } catch (e) {
        return res.render('download', { error: "Link not working.." })
    }
}

module.exports.email_post = async (req, res) => {
    const { uuid, emailTo, emailFrom } = req.body;
    //validate request
    if (!uuid || !emailTo || !emailFrom) {
        return res.status(422).send({ error: "All fields required" })
    }

    try {
        //get data from database
        const file = await File.findOne({ uuid: uuid })
        if (file.sender) {
            console.log("Email already send")
            return res.status(422).send({ error: "Email already send" })
        }
        file.sender = emailFrom;
        file.receiver = emailTo;
        const response = await file.save();
        //send email
        sendMail({
            from: emailFrom,
            to: emailTo,
            subject: "linkShare file sharing",
            text: `${emailFrom} shared a file to you.`,
            html: require('../services/emailTemplate')({
                emailFrom: emailFrom,
                downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
                size: parseInt(file.size / 1000) + ' KB',
                expires: '24 hours'
            })
        }).then(() => {
            return res.json({ success: true });
        }).catch(e => {
            return res.status(500).json({ error: 'Error in email sending.',message:e.message });
        })
    } catch (e) {
        return res.status(500).send({ error: 'Something went wrong.',message:e.message });
    }
}