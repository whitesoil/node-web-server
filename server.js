const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mysql = require('mysql');
const aws = require('aws-sdk');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt-nodejs');
const request = require('request');
const nodemailer = require('nodemailer');
const memorystorage = multer.memoryStorage()
var upload = multer({ storage: memorystorage })

let app = express();
let admin = JSON.parse(fs.readFileSync('./admin.json', 'utf8'));

const rds = mysql.createConnection({
    host : admin.host,
    user : admin.user,
    password : admin.password,
    database : admin.database
});
rds.connect();

const mail = nodemailer.createTransport({
    service : 'Gmail',
    auth: {
      user: admin.google_id,
      pass: admin.google_pw
    }
  });



app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
    secret: admin.secret,
    resave: false,
    saveUninitialized: true
}));

const port = process.env.PORT || 8080;
const server = app.listen(port,function(){
    console.log("Server is running");
});

const getAPI = require('./router/get')(app,rds);
const postAPI = require('./router/post')(app,rds,aws,upload,path,session,bcrypt);
const putAPI = require('./router/put')(app,rds,aws,upload,path,mail,bcrypt);
const deleteAPI = require('./router/delete')(app,rds,aws,session);
const mainAPI = require('./router/app')(app,session,request);