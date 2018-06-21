/*
    Author : Seon Namkung
    Date : 2018/04/20    
    PUT API CALL
*/

module.exports = function (app, rds, aws, upload, path, mail, bcrypt) {
    //Update Profile
    app.put('/api/user', function (req, res) {
        let json = JSON.parse(JSON.stringify(req.body));
        let ID = `'${json.ID}'`;
        let PW = json.PW;
        let Name = `'${json.Name}'`;
        let Email = `'${json.Email}'`;
        let Company = `'${json.Company}'`;
        let Role = `'${json.Role}'`;
        if (PW == "") {
            rds.query(`UPDATE User SET Name = ${Name}, Email = ${Email},Company = ${Company},Role=${Role} Where ID = ${ID} `, function (error, results, field) {
                if (error || results.affectedRows == 0) {
                    res.status(500).json({
                        result: 'error'
                    });
                    res.end();
                    return;
                }
                res.json({
                    result: 'success'
                });
                res.end();
            });
        } else {
            const salt = bcrypt.genSaltSync(10); // salt값 생성, 10이 default
            const hash = bcrypt.hashSync(PW, salt); // Digest  
            rds.query(`UPDATE User SET PW = '${hash}', Name = ${Name}, Email = ${Email},Company = ${Company},Role=${Role} Where ID = ${ID} `, function (error, results, field) {
                if (error || results.affectedRows == 0) {
                    res.status(500).json({
                        result: 'error'
                    });
                    res.end();
                    return;
                }
                res.json({
                    result: 'success'
                });
                res.end();
            });
        }
    });

    // Update Item

    app.put('/api/item/:post_id', upload.fields([{
        name: 'image',
        maxCount: 1
    }, {
        name: 'architecture',
        maxCount: 1
    }]), function (req, res) {        
        var s3 = new aws.S3({
            apiVersion: '2006-03-01'
        });
        var title = req.body.title;
        var cloud = req.body.cloud;
        var description = req.body.description;
        let category = "";
        if (typeof req.body.category == "string") {
            category += (req.body.category);
        } else {
            for (var i in req.body.category) {
                if (i == req.body.category.length - 1) {
                    category += (req.body.category[i]);
                } else {
                    category += (req.body.category[i] + "$");
                }
            }
        }
        let date = new Date();
        // Update database        
        rds.query(`UPDATE Post SET \
                Title = '${title}',\
                Cloud = '${cloud}',\
                Category = '${category}',\
                Description = '${description}' \
                WHERE Post_ID = ${req.params.post_id} AND User = '${req.session.user_uid}'\
                `, function (error, results, field) {
            if (error || results.affectedRows == 0) {
                res.status(500).json({
                    result: 'error'
                });
                res.end();
                return;
            } else {
                //Find original file's url of S3
                rds.query("Select Image,File from Post where Post_ID = '" + req.params.post_id + "' and User = '" + req.session.user_uid + "'", function (error, results, field) {
                    if (error || results.affectedRows == 0) {
                        res.status(500).json({
                            result: 'error'
                        });
                        res.end();
                        return;
                    } else {
                        let image_url = results[0].Image;
                        let file_url = results[0].File;
                        if (req.files['image'] != undefined) {
                            //Delete original files in S3
                            let param_images = {
                                Bucket: "kangnam",
                                Key: (results[0].Image).split('kangnam/')[1]
                            };
                            s3.deleteObject(param_images, function (err, data) {
                                if (err) console.log(err, err.stack); // an error occurred
                                else console.log(data); // successful response                 
                            });
                            let new_image = cloud + "/img" + date.getSeconds() + req.session.user_uid + "-" + category + "-" + title + path.extname(req.files['image'][0].originalname); //ex) <Folder>/<filename.extension>                        
                            image_url = "https://s3-ap-southeast-1.amazonaws.com/kangnam/" + new_image;
                            //Upload new files to S3
                            let s3_image_params = {
                                Bucket: 'kangnam',
                                Key: new_image,
                                ACL: 'public-read',
                                ContentType: req.files['image'][0].mimetype,
                                ContentLength: req.files['image'][0].size
                            };
                            let s3_image_obj = new aws.S3({
                                params: s3_image_params
                            });
                            s3_image_obj.upload({
                                Body: req.files['image'][0].buffer
                            }).
                            on('httpUploadProgress', function (evt) {
                                console.log(evt);
                            }).send();
                        }
                        if (req.files['architecture'] != undefined) {
                            let param_file = {
                                Bucket: "kangnam",
                                Key: (results[0].File).split('kangnam/')[1]
                            };
                            s3.deleteObject(param_file, function (err, data) {
                                if (err) console.log(err, err.stack); // an error occurred
                                else console.log(data); // successful response                 
                            });
                            let new_file = req.body.cloud + "/file" + date.getSeconds() + req.session.user_uid + "-" + category + "-" + req.body.title + path.extname(req.files['architecture'][0].originalname); //ex) <Folder>/<filename.extension>
                            file_url = "https://s3-ap-southeast-1.amazonaws.com/kangnam/" + new_file;
                            let s3_file_params = {
                                Bucket: 'kangnam',
                                Key: new_file,
                                ACL: 'public-read',
                                ContentType: req.files['architecture'][0].mimetype,
                                ContentLength: req.files['architecture'][0].size
                            };
                            let s3_file_obj = new aws.S3({
                                params: s3_file_params
                            });
                            s3_file_obj.upload({
                                Body: req.files['architecture'][0].buffer
                            }).
                            on('httpUploadProgress', function (evt) {
                                console.log(evt);
                            }).send();
                        }
                        rds.query(`UPDATE Post SET Image = '${image_url}',File = '${file_url}' WHERE Post_ID = ${req.params.post_id} AND User = '${req.session.user_uid}'`, function (error, results, field) {
                            if (error || results.affectedRows == 0) {
                                res.status(500).json({
                                    result: 'error'
                                });
                                res.end();
                                return;
                            }
                        });
                    }
                });
            }
        });
        res.end();
    });

    // Find admin
    app.put('/api/find/:email', function (req, res) {
        var email = req.body.email;
        const salt = bcrypt.genSaltSync(10); // salt값 생성, 10이 default
        const hash = bcrypt.hashSync('123456789a', salt); // Digest        
        rds.query(`UPDATE User SET PW = '${hash}' WHERE Email = '${email}'`, function (error, results) {
            if (error || results.affectedRows == 0) {
                res.status(500).json({
                    result: 'error'
                });
                res.end();
                return;
            } else {
                var mailOptions = {
                    from: 'nkseon@gmail.com',
                    to: email,
                    subject: 'KangNamStyle Password change',
                    text: 'Temporary Password : 123456789a'
                }
                mail.sendMail(mailOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                    mail.close();
                });
                res.end();
            }
        });
    });
}