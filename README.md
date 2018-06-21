# ABC
2018 Capstone project node.js version

## Commands
* NginX 실행 : sudo service nginx start (nginx 설치 요망)
* 서버 실행 : forever start server.js (global로 설치 요망)
* 서버 종료 : forever stopall
* 서버 로컬 테스트 : nodemon server.js  (global로 설치해서 실행)
* 설치된 패키지 목록 : npm ls --depth 0

## Announcement
* npm install로 Packages 설치 필요
* meta에 반드시 charset UTF-8 포함
* git add 전에 git config core.autocrlf true -> New line error 해결
* ABC 바로 아래에 admin.json 파일 생성
```
{
    "host" : "RDS 엔드포인트(url)",
    "user" : "RDS 유저 UD",
    "password" : "RDS 유저 PW",
    "database" : "사용할 RDS의 Database(인스턴스이름이 아닌 인스턴스 내부의 Database)",
    "google_id" : "구글 계정 ID for Sending Email",
    "google_pw" : "구글 계정 PW for Sending Email",
    "secret" : "암호 복호화를 위한 Key"
}
```

## Packages
* express
* ejs
* body-parser
* mysql
* fs
* aws-sdk
* multer
* path
* bcrypt-nodejs
* express-session
* request
* nodemailer

## Amazon Web Services
* Cloud9
* EC2
* CloudFront
* S3
* RDS
* Certification

## API
### GET
    * /api/user/:userid
    * /api/list
    * /api/list/:cloud/:category
    * /api/list/:userid
    * /api/signout
    * /api/item/:postid

### POST
    * /api/user
    * /api/signin
    * /api/item/:userid
    * /api/edit/:userid/:post_id
    * /api/idcollision

### PUT
    * /api/user
    * /api/item/:post_id
    * /api/find/:email

### DELETE
    * /api/user
    * /api/item/:postid

## RDS
### Schema
    CREATE TABLE User(
            ID varchar(20) NOT NULL,
            PW varchar(255) NOT NULL,
            Name varchar(30) NOT NULL,
            Email varchar(40) NOT NULL,
            Company varchar(20) NOT NULL,
            Role varchar(20) NOT NULL,
            PRIMARY KEY (ID)
            ) ENGINE=InnoDB CHARSET=UTF8;
            
    CREATE TABLE Post(
            Post_ID int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
            User varchar(30) NOT NULL,
            Title varchar(40) NOT NULL,
            Cloud varchar(40) NOT NULL,
            Category varchar(20) NOT NULL, 
            Image varchar(255) NOT NULL,
            File varchar(255) NOT NULL,
            Description varchar(2000) NOT NULL,
            ) ENGINE=InnoDB CHARSET=UTF8;

### How to use
    var mysql = require('mysql');

    var rds = mysql.createConnection({
        host : '[DB_Address]',
        user : '[DB_USER]',
        password : '[DB_PASSWORD]',
        port : '[DB_PORT]'
        database : '[DB_Name]'
    });

    rds.connect();

    rds.query('[QUERY]', function (error, results, fields) {});

    rds.end();

## S3
### How to use
#### Credential Setting
    aws_access_key_id = your_access_key
    aws_secret_access_key = your_secret_key
#### Upload
    var aws = require('aws-sdk');    

    let s3_image_params = {
            Bucket: '[Bucket 이름]',
            Key: '[Bucket 아래 경로]',
            ACL: 'public-read',
            ContentType: '[Content의 MIME]',
            ContentLength: [Content Length]
    };

    let s3_image_obj = new aws.S3({
            params: s3_image_params
    });

    s3_image_obj.upload({
        Body: [File]
    }).on('httpUploadProgress', function (evt) {
            console.log(evt);
    }).send(); 
#### Delete
    var aws = require('aws-sdk');    
    var s3 = new aws.S3({apiVersion: '2006-03-01'});

    let param_image = {
        Bucket: '[Bucket 이름]',
        Key: '[Bucket 아래 경로]',
    }; 

    s3.deleteObject(param_image, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
            else console.log(data); // successful response                 
    });
