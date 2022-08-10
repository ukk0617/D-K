// include module
var express = require('express');
var mysql =require('mysql');
var bodyParser=require('body-parser');
var app = express();
var session= require('express-session');
var fileStore= require('session-file-store')(session);
// load moudle, 미들웨어 실행
app.use(express.static('static')); 
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(session({
    secret: 'sung',
    resave: false,
    saveUninitialized: true,
    store: new fileStore()
}));

// set html rendering engine to ejs
app.set('view engine','ejs');
app.engine('html',require('ejs').renderFile)

// DB connection configuration
const config = {
    host : "db1.cac4pv4f8grd.ap-northeast-2.rds.amazonaws.com", 
    user : "root",
    password : 'It12345!',
    port : 3306
}
// Connect to DB
var connection = mysql.createConnection(config);
    // Connection confirm console log
connection.connect(function(err){
    if(err){
        console.error("DB connection failed - " + err.stack);
        return;
        }
        console.log('Connected to DB');
});
    // change DB databsae =="mysql$use database wordpress"
connection.changeUser({database:'wordpress'},(err) =>{
    if(err){
        console.log('Error in changing DB',err);
        return;
    }
});


// routing
// views
    //testing
app.get('/index.js', function(req,res) {
    res.render(__dirname+'main.html');
});
    //login view
app.get('/',function(req,res){
    if(req.session.logined){
        res.render(__dirname+'/views/logout.html',{id: req.session.user_id});
    }else 
    res.render(__dirname+'/views/login.html')
});
    // register view
app.get('/register.html',function(req,res){
    res.render(__dirname+'/views/register.html')
});


//controllers
    // login controller
app.post('/login.js',function(req,res){
        // <form> 에서 보낸 값을 받아온다 POST
    var data={
        'id' : req.body.id,
        'password' : req.body.password   
    }
    console.log('post id : '+data.id);
    console.log('post password : '+data.password);
        //res.send(data.id+" "+data.password)

        // DB로 query해서 레코드가 있는지 확인한다
    var output='';
    connection.query('select id,password from member where id="'+data.id+'";', function(err,rows,fields){
        console.log('queried');
        if (err) { 
            //1. 쿼리에 실패하면 -> 에러페이지
            res.status=302;
            res.send('Error : '+err)
            res.end();
        }else if(rows.length<=0){
           //2. 레코드가 없으면 -> 로그인 실패 페이지
            res.send('no id match found');
            res.end();
        }else   
        {   //3. 레코드가 있으면 ->
                // 비밀번호와 아이디 확인
            if( rows[0]['id']==data.id && rows[0]['password']==data.password)
            {   //같으면 로그인 성공 페이지== 로그인 세션을 가진 메인페이지
            
                req.session.logined= true;
                req.session.user_id=req.body.id;
                res.render(__dirname+'/views/login.ejs',{data});
            }
                // 다르면 로그인 실패, 에러를 출력하고 다시 로그인 페이지로
            else
            {
                res.send("<script>alert('비밀번호가 일치하지 않습니다.'); location.href='/login.html';</script>") 
            }
        }
    }); return (0);
        
});
    //logout controller
app.get('/logout',function(req,res){
    req.session.destroy();
    res.redirect('/');
});

    // register controller
app.post('/register.js',function(req,res){
        // post로 회원가입 정보를 받아온다
    var data = req.body;
        // 아이디 중복 검사
        // DB에 쿼리문을 날려 err,rows,fields값을 받아오는 콜백함수를 사용한다.
    connection.query('SELECT * from member where id=?',data.id,function(err,rows,fields){
        if(err) {
            console.log('Error: '+err);
            throw err;
        }
        if (rows.length<=0){
            // 중복되는 아이디가 없다. 회원가입 성공. DB에 레코드를 추가한다.
            var params= [data.id,'email','sung',data.password,'010','D&K'];
            console.log(" datas : " + data.id +"  , "+data.password);
            connection.query('insert into member values(?,?,?,?,?,?)',params,function(err,results){
                if(err){
                    console.log('Error insert query : '+err);
                    throw err;
                }else{
                    // 성공 창을 띄우고 이전 회원가입 페이지로 돌아간다
                    res.send("<script>alert('success'); location.href='http://localhost:3000/register.html';</script> ");
                }
            });
        }else{
            // 아이디가 중복된다
            // 회원가입 실패. 에러를 띄우고 회원가입 페이지를 초기화 시킨다.
                // + 비밀번호 유효성
                // + 이메일 유효성
                // + 전화번호 유효성 검사
            res.render(__dirname+'/views/register.ejs',{data})
        }
    })
});





// 서버 실행
// listen port : 3000 // 서버는 3000포트를 사용한다
app.listen(3000,()=>{
    console.log('server.js listening on port 3000');
});