/*
    Author : Seon Namkung
    Date : 2018/05/28
    POST API CALL
*/

module.exports = function (app, rds, aws,upload,path,session,bcrypt) {

    //Sign in
    app.post('/api/signin', function (req, res) {
        let json = JSON.parse(JSON.stringify(req.body));
        let ID = `'${json.ID}'`;
        let PW = json.PW;
        rds.query(`SELECT * FROM User WHERE ID = ${ID}`, function (error, results, fields) {
            if (error || results.length == 0) {                                
                res.status(412).redirect('/pages/login.html');         
                return;
            }else{
                if(bcrypt.compareSync(PW,results[0].PW)){
                    req.session.user_uid = results[0].ID                    
                    res.redirect('/');
                    
                }else{
                    res.status(412).send("<script>alert('Password Error');window.location = 'http://localhost:8080/pages/login.html'</script>");
                }
                res.end();                                          

            }
        });
    });

    // ID Collision check
    app.post('/api/idcollision', function (req, res) {
        let json = JSON.parse(JSON.stringify(req.body));        
        let ID = `'${json.ID}'`;
        console.log(ID);
        rds.query(`SELECT ID FROM User WHERE ID = ${ID}`, function (error, results, fields) {
            if (error || results.length != 0) {                                
                res.status(412).json({
                    result: 'ID Collision'
                });
                res.end();
                return;
            }else{
                console.log(results.length);
                res.json({
                    result : 'OK'
                });
                    res.end();                
            }
        });
    });


    //Sign up
    app.post('/api/user', function (req, res) {
        let json = JSON.parse(JSON.stringify(req.body));
        let ID = `'${json.ID}'`;
        let PW = json.PW;        
        let Name = `'${json.Name}'`;
        let Email = `'${json.Email}'`;
        let Company = `'${json.Company}'`;
        let Role = `'${json.Role}'`;
        rds.query(`SELECT ID FROM User WHERE ID = ${ID}`, function (error, results, fields) {
            if (error || results.length != 0) {                                
                res.status(412).redirect('/pages/register.html');
                res.end();
                return;
            }else{
                const salt = bcrypt.genSaltSync(10); // salt값 생성, 10이 default
                const hash = bcrypt.hashSync(PW, salt); // Digest                        
                rds.query(`INSERT INTO User VALUES(${ID},'${hash}',${Name},${Email},${Company},${Role})`, function (error, results, fields) {
                    if (error) {
                        res.status(500).redirect('/pages/register.html');
                        res.end();
                        return;
                    }
                    res.redirect('/pages/login.html');
                    res.end();
                });
            }
        });
    });

    //Post Item
    app.post('/api/item/:userid', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'architecture', maxCount: 1 }]), function (req, res) {                
        let category = "";                
        if(typeof req.body.category == "string"){
            category += (req.body.category);
        }else{
            for(var i in req.body.category){            
                if(i == req.body.category.length-1){
                    category += (req.body.category[i]);                
                }else{
                    category += (req.body.category[i] + "$");
                }     
            }
        }
        
        let date = new Date();
        let myBucket = 'kangnam';
        let image = req.body.cloud + "/img" + date.getSeconds() + req.params.userid + "-" + category + "-" + req.body.title + path.extname(req.files['image'][0].originalname); //ex) <Folder>/<filename.extension>                        
        let file = req.body.cloud + "/file" + date.getSeconds() + req.params.userid + "-" + category + "-" + req.body.title + path.extname(req.files['architecture'][0].originalname); //ex) <Folder>/<filename.extension>
        
        let id = "'" + req.params.userid + "'";
        let title = "'" + req.body.title + "'";
        let cloud = "'" + req.body.cloud + "'";
        let categories = "'" + category + "'";
        let image_url = "'https://s3-ap-southeast-1.amazonaws.com/kangnam/" + image + "'";            
        let file_url = "'https://s3-ap-southeast-1.amazonaws.com/kangnam/" + file + "'";            
        let desc = "'" + req.body.description + "'";                     
                    
        let s3_image_params = {
            Bucket: 'kangnam',
            Key: image,
            ACL: 'public-read',
            ContentType: req.files['image'][0].mimetype,
            ContentLength: req.files['image'][0].size
        };
        let s3_file_params = {
            Bucket: 'kangnam',
            Key: file,
            ACL: 'public-read',
            ContentType: req.files['architecture'][0].mimetype,
            ContentLength: req.files['architecture'][0].size
        };
        let s3_image_obj = new aws.S3({
            params: s3_image_params
        });
        let s3_file_obj = new aws.S3({
            params: s3_file_params
        });
        s3_image_obj.upload({
            Body: req.files['image'][0].buffer
        }).
        on('httpUploadProgress', function (evt) {
            console.log(evt);
        }).send();
        s3_file_obj.upload({
            Body: req.files['architecture'][0].buffer
        }).
        on('httpUploadProgress', function (evt) {
            console.log(evt);
        }).send();
        rds.query(`INSERT INTO Post (User,Title,Cloud,Category,Image,File,Description,Date) VALUES(${id},${title},${cloud},${categories},${image_url},${file_url},${desc},now())`, function (error, results, fields) {
            if (error) {
                res.status(500);
                res.end();                
            }else{   
                res.redirect("/tables/myitemlist.html");          
                res.end();
            }                                
        });
    });
}