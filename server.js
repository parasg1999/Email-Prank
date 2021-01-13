/*jshint esversion: 6 */
var express = require("express"),
    bodyParser = require("body-parser"),
    app = express(),
    nodemailer = require('nodemailer'),
    multer = require('multer');
require('dotenv').config();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, (Date.now() + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]).toString());
    }
});

const upload = multer({
    storage: storage
});

console.log(process.env.SENDGRID_KEY);

var creatingTransport = () => {

    var transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_KEY
        }
    });

    return transporter;
}

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

app.get("/", function (req, res) {
    res.render('login', { req });
});

var sendEmail = async function ({ from, to, subject, text, html, attachments }) {

    let transporter = creatingTransport();

    transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
        attachments,
    })
        .then()
        .catch(console.error());
}

app.post('/sendEmail', upload.single('file'), (req, res) => {
    const { from, to, subject, text } = req.body;
    console.log(from, to, subject, text)

    console.log(req.file);

    if (typeof req.file !== 'undefined') {
        sendEmail({
            from,    // sender
            to,    // receiver
            subject, // Subject
            text,               // message body
            attachments: [
                {
                    filename: req.file.originalname,
                    path: req.file.path
                }
            ]
        }, (error, info) => {
            if (error) {
                return console.log(error);
            }
        })
    } else {
        sendEmail({
            from,    // sender
            to,    // receiver
            subject, // Subject
            text,               // message body
        }, (error, info) => {
            if (error) {
                return console.log(error);
            }
        })
    }

    res.send('yay');
})


var port = 13000;
app.listen(port, function () {
    console.log("Serving on port", port);
});
