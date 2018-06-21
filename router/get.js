/*
    Author : Seon Namkung
    Date : 2018/06/08   
    GET API CALL
*/

module.exports = function (app, rds) {

    // Get user's information except password    
    app.get('/api/user/:userid', function (req, res) {
        rds.query('SELECT ID,PW,Name,Email,Company,Role FROM User WHERE ID = "' + req.params.userid + '"', function (error, results, fields) {
            if (error || results[0] == null) {
                res.status(404).json({
                    result: 'error'
                });
                res.end();
                return;
            }
            res.json(results[0]);            
            res.end();
        });
    });

    //Get unspecified item list 
    app.get('/api/list', function (req, res) {
        rds.query('SELECT * from Post', function (error, results, fields) {
            if (error || results[0] == null) {
                res.status(404).json({
                    result: 'error'
                });
                res.end();
                return;
            }
            res.json(results);
            res.end();
        });
    });

    /*
     * Get item list including keywords
     * Call : /api/list/AWS/AI$Mobile => Get list AI,Mobile architecture which is constructed in AWS and Azure     
     */
    app.get('/api/list/:cloud/:category', function (req, res) {
        let str_clouds = (req.params.cloud).split('$');
        let cloud = `'%${str_clouds[0]}%'`;

        let categories = (req.params.category).split('$');
        let str_category = "%";
        for (i in categories) {
            str_category += categories[i] + "%";
        }
        str_category += "%"

        rds.query(`SELECT * FROM Post WHERE Cloud Like ${cloud} AND Category Like '${str_category}'`, function (error, results, fields) {
            if (error || results[0] == null) {
                res.status(404).json({
                    result: 'error'
                });
                res.end();
                return;
            }
            res.json(results);
            res.end();
        });
    });

    //Get item list of user owns
    app.get('/api/list/:userid', function (req, res) {
        rds.query("SELECT * FROM Post WHERE User = '" + req.params.userid + "'", function (error, results, fields) {
            if (error || results[0] == null) {
                res.status(404).json({
                    result: 'error'
                });
                res.end();
                return;
            }
            res.json(results);
            res.end();
        });
    });

    //Get item of post id
    app.get('/api/item/:postid', function (req, res) {
        rds.query(`SELECT * FROM Post WHERE Post_ID = ${req.params.postid}`, function (error, results, fields) {
            if (error || results[0] == null) {
                res.status(404).json({
                    result: 'error'
                });
                res.end();
                return;
            }
            res.json(results);
            res.end();
        });
    });

    //Sign out
    app.get('/api/signout', function (req, res) {
        delete req.session.user_uid;
        res.redirect('/');
    });
}