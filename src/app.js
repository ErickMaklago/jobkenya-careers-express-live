require('dotenv').config();
const nodemailer=require('nodemailer');
const bodyParser=require('body-parser');

const express=require('express');
const path=require('path');
const mustacheExpress=require('mustache-express');
const JOBS=require('./jobs');

const app=express();

app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname,'public')))

app.set('views',path.join(__dirname,'pages'));
app.set('view engine','mustache');
app.engine('mustache',mustacheExpress());

app.get('/',(req,res)=>{
    //res.send('Hello Erick!');
    //res.sendFile(path.join(__dirname,'pages/index.html'))
    res.render('index',{jobs:JOBS});
})

app.get('/jobs/:id',(req,res)=>{
    const id=req.params.id;
    const matchedJob=JOBS.find(job=>job.id.toString()===id);
    res.render('job',{job:matchedJob});
})

//app.post('/jobs/:id/apply',(req,res)=>{
//    res.send("Got the application");
//})

const transporter=nodemailer.createTransport({
    host:'smtp.gmail.com',//SMTP host for email provider
    port:465,//SMTP port for email provider (Port 587 for TLS (Transport Layer Security) encryption /465 for SSL (Secure Sockets Layer) encryption)
    secure:true,
    auth:{
        user:process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD
    }
});

app.post('/jobs/:id/apply',(req,res)=>{
    const{name,email,phone,dob,position,resume,coverletter }=req.body;

    const id=req.params.id;
    const matchedJob=JOBS.find(job=>job.id.toString()===id);

    console.log('req.body',req.body);
    console.log('matchedJob',matchedJob);

    const mailOptions = { 
        from: process.env.EMAIL_ID, 
        to: [process.env.EMAIL_ID], 
        subject: `New Application for ${matchedJob.title}`, 
        html: ` 
        <p><strong>Name:</strong> ${name}</p> 
        <p><strong>Email:</strong> ${email}</p> 
        <p><strong>Phone:</strong> ${phone}</p> 
        <p><strong>Date of Birth:</strong> ${dob}</p> 
        <p><strong>Resume:</strong> ${resume}</p> 
        <p><strong>Cover Letter:</strong> ${coverletter}</p> 
        `,
        // attachments: [ 
        //     { 
        //         filename: 'resume.pdf', // The name of the file as it will appear in the email 
        //         path: '/path/to/resume.pdf', // The path to the PDF file on your server 
        //         contentType: 'application/pdf' // The MIME type for PDF files 
        //     }, 
        //     { 
        //         filename: 'resume.docx', // The name of the file as it will appear in the email 
        //         path: '/path/to/resume.docx', // The path to the Word document on your server 
        //         contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // The MIME type for Word documents 
        //     } 
        // ]
    };

    transporter.sendMail(mailOptions,(error,info)=>{
        if (error){
            console.error(error);
            res.status(500).send('Error sending email');
        } else{
            console.log('Email sent:'+info.response);
            res.status(200).send('Email sent successfully');
        }
    })


//console.log(req.body);
});



const port=process.env.PORT||3000;

app.listen(port,()=> {
    console.log('Server running on https://localhost:${port}');
})