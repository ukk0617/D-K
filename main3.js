// include modules
var mysql = require('mysql');
var http = require('http');
// load modules
const express = require('express');
const app = express();
// DEFINE
const port = process.env.PORT || 3000;

// DB connection configure
const config = {
        host    : "10.0.0.12",
        user    : "root",
        password: "It12345!",
        port    : 3306
}
var connection = mysql.createConnection(config);

connection.connect(function(err) {
        if (err) {
                console.error("Database connection failed : " + err.stack);
                return;
        }

        console.log('Connected to database.');
});

connection.changeUser({
    database : 'project'
}, (err) => {
    if (err) {
      console.log('Error in changing database', err);
      return;
    }
    // Do another query
});

//app.get('', (req, res) => {
//      res.sendFile(__dirname + '/main.html')
//})

app.set('view engine', 'ejs');
//app.engine('html',require('ejs').renderFile);


app.get('/main3.js', function (req, res, next) {
//    res.render('main3.js')  
        var output = '';
        connection.query('select * from member;', function (err, rows, fields) {
        if (!err) {
            for(let i=0; i <rows.length; ++i)
            {
                var id = rows[i]['id'];
                var email = rows[i]['email'];
                var full_name = rows[i]['full_name'];
                var password = rows[i]['password'];
                var phone_number = rows[i]['phone_number'];
                var department_name = rows[i]['department_name'];

                output += '<tr><td>' + id + '</td>' +
                            '<td>' + email + '</td>' +
                            '<td>' + full_name + '</td>' +
                            '<td>' + password + '</td>' +
                            '<td>' + phone_number + '</td>' +
                            '<td>' + department_name + '</td></tr><hr>';
            }
//              console.log(output);
                res.send(output);
                //res.render('/views/board.html', {'output': output});
                //return(output);
            }else{
                res.statusCode=302
                res.setHeader("Location","http://13.125.125.45/404.html");
                res.end();
            }
    }); return (output);
        connection.end();
}).listen(3000);

 app.engine('html',require('ejs').renderFile);
app.get('/board.html.js', function(req, res) {
        res.render('board.html')
})