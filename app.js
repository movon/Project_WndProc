var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var crypto = require('crypto');
var favicon = require('serve-favicon');
var register = require('./routes/register');
var routes = require('./routes/index');
var guides = require('./routes/guides');
var chat = require('./routes/chat');
var adduser = require('./routes/adduser');
var login = require('./routes/login');
var logout = require('./routes/logout');
var adminpanel = require('./routes/adminpanel');
var userpanel = require('./routes/userpanel');
var changepassword = require('./routes/changepassword');
var { Client } = require('pg');
client = new Client({ connectionString: process.env.DATABASE_URL});
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon1.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
var token = crypto.randomBytes(64).toString('hex');

getExtra = function (req) {
    'use strict';
    var extra = '';
    extra += '<li><a href="/">Home</a></li>';
    extra += '<li><a href="/guides">Guides</a></li>';
    if (!!req.session.username) {
        extra += '<li><a href="/chat">Chat</a></li>';
        extra += '<li><a href="/logout">Log Out</a></li>';
        extra += '<li><a href="/userpanel">User Panel</a></li>';
        if (req.session.privileges === 'admin') {
            extra += '<li><a href="/adminpanel">Admin Panel</a></li>';
        }
    } else {
        extra += '<li><a href="/register">Register</a></li>';
        extra +=  '<li><a href="/login">Log in</a></li>';
    }
    return extra;
};


app.use(session({
    secret: token,
    name: 'sessionID',
    proxy: true,
    resave: true,
    saveUninitialized: true
}));

app.use('/', routes);
app.use('/guides/*', guides);
app.use('/guides', guides);
app.use('/chat', chat);
app.use('/register', register);
app.use('/adduser', adduser);
app.use('/login', login);
app.use('/logout', logout);
app.use('/adminpanel', adminpanel);
app.use('/userpanel', userpanel);
app.use('/changepassword', changepassword);
// catch 404 and forward to error handler
app.use(function (req, res) {
    'use strict';
    res.status(404);
    var extra = getExtra(req);
    res.render('notfound404', { title: 'Not Found', req: req, extra: extra, username: req.session.username});
});

console.log("creating users if doesn't exist");
client.connect();
client.query("select * from users limit 1;").then((row) => {
    console.log("users table exists");
}, (err) => {
    console.log("users table does not exist");
    client.query("create table users (user_id serial PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, hashed VARCHAR(50) NOT NULL, email VARCHAR(355), salt VARCHAR(100) NOT NULL, privileges VARCHAR(50) NOT NULL);")
        .then(() => {
            console.log("table was created correctly");
        }, (err) => {
            console.error("table was NOT created correctly", err, err.stack);
    });
});
// error handlers
/*
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// production error handler
// no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
*/


module.exports = app;
