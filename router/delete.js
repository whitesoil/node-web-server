/*
    Author : Seon Namkung
    Date : 2018/04/20    
    DELETE API CALL
*/

module.exports = function (app, rds, aws,session) {

    //Delete user
    app.delete('/api/user', function (req, res) {
        var json = JSON.parse(JSON.stringify(req.body));
        var ID = "'" + json.ID + "'";
        var PW = "'" + json.PW + "'";
        rds.query("DELETE FROM User WHERE ID = " + ID + " AND " + "PW = " + PW, function (error, results, field) {
            if (error || results.affectedRows == 0) {
                res.status(403).json({
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
    });

    //Delete item
    app.delete('/api/item/:postid', function (req, res) {        
        var s3 = new aws.S3({apiVersion: '2006-03-01'});
        var user_uid = req.session.user_uid;
        var post_id = req.params.postid;        
        rds.query(`Select Image,File FROM Post Where Post_ID = ${post_id} and User = '${user_uid}'`, function (error, results, field) {
            if (error || results.affectedRows == 0) {
                res.error.status(403);                                
                res.end();
                return;                                                                            
            }else{
                let image = results[0].Image.split('kangnam/')[1];
                let file = results[0].File.split('kangnam/')[1];
                let param_image = {
                    Bucket: "kangnam",
                    Key: image
                };            
                var param_file = {
                    Bucket: "kangnam",
                    Key: file
                };
                s3.deleteObject(param_image, function (err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else console.log(data); // successful response                 
                });
                s3.deleteObject(param_file, function (err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else console.log(data); // successful response                 
                });
                rds.query(`DELETE FROM Post WHERE User = '${user_uid}' and Post_ID = ${post_id}`, function (error, results, field) {
                    if (error || results.affectedRows == 0) {
                        res.error.status(403);
                        res.end();
                        return;                                                                            
                    }else{
                        res.end();
                    }      
                });                  
            }       
        });                                       
    });
}