var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();

var user_infos = {};
var etag_count = 0;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/login', function(req, res){
	res.sendFile(__dirname + '/login.html');
});

app.post('/login', function(req, res){
	var user_info = {};
	user_info.username = req.body.username || ''; 
	user_info.password = req.body.password || '';
	user_info.etag = req.body.etag || '';
	if(user_info.etag && user_info.username && user_info.password){
		user_infos[user_info.etag] = user_info;
	}
});

app.get('/session-etag.js', function(req, res){
	var etag = req.headers["if-none-match"];
	if(!etag){
		etag = 'etag_' + etag_count++;
	}
	res.setHeader('Cache-Control', 'max-age=0');
	res.setHeader('ETag', etag);
	res.setHeader('Content-Type', 'text/javascript');
	res.setHeader('Transfer-Encoding', 'chunked');

	var user_info = user_infos[etag] || {etag:etag};
	user_info = JSON.stringify(user_info);

	res.end(`window.user_info = ${user_info}`);
});

app.listen(3000);

module.exports = app;
