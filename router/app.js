/*
    Author : Seon Namkung
    Date : 2018/04/20    
    Page API CALL
*/

module.exports = function (app,session,request) {
    app.get('/join', function (req, res) {
        res.render('join');
    });

    
    app.get('/login', function (req, res) {
        res.render('login');
    });
        
    app.get('/index', function (req, res) {
        const sess = req.session;
        res.render('index',{nickname : sess.user_uid ? sess.user_uid : ''});
    });

    //Dashboard.html is index
    app.get('/', function (req, res) {
         const sess = req.session;         
         request.get('http://localhost:8080/api/list', function (error, response, body) {            
             var json = JSON.parse(body);             
             res.render('dashboard',{nickname : sess.user_uid ? sess.user_uid : '',list : json});
        });
        
    });
    

    //Dashboard.html
    app.get('/dashboard.html', function (req, res) {
        const sess = req.session;      
        request.get('http://localhost:8080/api/list', function (error, response, body) {            
            var json = JSON.parse(body);             
            res.render('dashboard',{nickname : sess.user_uid ? sess.user_uid : '',list : json});
       });
    });

    app.get('/dashboard.html/:cloud/:category', function (req, res) {
        const sess = req.session;      
        request.get('http://localhost:8080/api/list/'+req.params.cloud+"/"+req.params.category, function (error, response, body) {            
            var json = JSON.parse(body);                    
            res.render('dashboard',{nickname : sess.user_uid ? sess.user_uid : '',list : json});
       });
    });

    //pages/login.html
    app.get('/pages/login.html', function (req, res) {
        const sess = req.session;      
        res.render('pages/login',{nickname : sess.user_uid ? sess.user_uid : ''});
    });

    //pages/itemin.html
    app.get('/pages/itemin.html/:postid', function (req, res) {
        const sess = req.session;  
        request.get('http://localhost:8080/api/item/'+req.params.postid, function (error, response, body) {            
            var json = JSON.parse(body);             
            res.render('pages/itemin',{nickname : sess.user_uid ? sess.user_uid : '', item : json[0]});
       });     
    });

    //pages/find.html
    //계정 찾기
    app.get('/pages/find.html', function (req, res) {
        const sess = req.session;      
        res.render('pages/find',{nickname : sess.user_uid ? sess.user_uid : ''});
    });

    //pages/register.html
    app.get('/pages/register.html', function (req, res) {
        const sess = req.session;      
        res.render('pages/register',{nickname : sess.user_uid ? sess.user_uid : ''});
    });

    //pages/user.html
    app.get('/pages/user.html', function (req, res) {
        const sess = req.session;  
        request.get('http://localhost:8080/api/user/'+sess.user_uid, function (error, response, body) {            
            var json = JSON.parse(body);             
            res.render('pages/user',{nickname : sess.user_uid ? sess.user_uid : '', info : json});
       });        
    });

    //forms/newitem.html
    app.get('/forms/newitem.html', function (req, res) {
        const sess = req.session;      
        res.render('forms/newitem',{nickname : sess.user_uid ? sess.user_uid : ''});
    });

    //tables/myitemlist.html
    app.get('/tables/myitemlist.html', function (req, res) {
        const sess = req.session;   
        request.get('http://localhost:8080/api/list/'+sess.user_uid, function (error, response, body) {                        
            var json = JSON.parse(body);                         
            res.render('tables/myitemlist',{nickname : sess.user_uid ? sess.user_uid : '', list : json});
       });          
    });
    app.get('/forms/updateitem.html/:postid',function(req,res){
        const sess = req.session;          
        request.get('http://localhost:8080/api/item/'+req.params.postid, function (error, response, body) {                        
            var json = JSON.parse(body);                         
            res.render('forms/updateitem',{nickname : sess.user_uid ? sess.user_uid : '',item:json[0]});
       });  
        
    })
}