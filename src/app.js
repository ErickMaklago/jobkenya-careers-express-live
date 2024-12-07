require('dotenv').config();
const nodemailer = require('nodemailer');
const multer = require('multer');
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const mustacheExpress = require('mustache-express');
const JOBS = require('./jobs');

const app = express();
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'pages'));
app.set('view engine', 'mustache');
app.engine('mustache', mustacheExpress());

app.get('/', (req, res) => {
    res.render('index', { jobs: JOBS });
});

app.get('/jobs/:id', (req, res) => {
    const id = req.params.id;
    const matchedJob = JOBS.find(job => job.id.toString() === id);
    res.render('job', { job: matchedJob });
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD
    }
});

app.post('/jobs/:id/apply', upload.single('resume'), (req, res) => {
    const id = req.params.id;
    const matchedJob = JOBS.find(job => job.id.toString() === id); // Define matchedJob here

    console.log(req.file); // Log the uploaded file information
    const resumePath = path.join(__dirname, 'uploads', req.file.filename);

    const mailOptions = {
        from: process.env.EMAIL_ID,
        to: req.body.email,
        subject: `New Application for ${matchedJob.title}`, // Use matchedJob here
        html: `
        <p><strong>Name:</strong> ${req.body.name}</p>
        <p><strong>Email:</strong> ${req.body.email}</p>
        <p><strong>Phone:</strong> ${req.body.phone}</p>
        <p><strong>Date of Birth:</strong> ${req.body.dob}</p>
        <p><strong>Resume:</strong> ${req.file.originalname}</p>
        <p><strong>Cover Letter:</strong> ${req.body.coverletter}</p>
        `,
        attachments: [
            {
                filename: req.file.originalname,
                path: resumePath,
                contentType: req.file.mimetype
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            res.status(500).send('Error sending application');
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).render('applied');
        }
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
