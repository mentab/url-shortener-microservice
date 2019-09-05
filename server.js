var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors');
var router = express.Router();

var port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({extended: 'false'}));
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

var findOneByShortUrl = require('./shortUrl.js').findOneByShortUrl;
app.get("/api/shorturl/:shortUrl", function (req, res, next) {
  findOneByShortUrl(req.params.shortUrl, function(err, data) {
      if(err) return res.json(err);
      if(!data) return res.json({message: 'Missing callback argument'});
      res.redirect(data.originalUrl);
  });
});

var createAndSaveUrl = require('./shortUrl.js').createAndSaveUrl;
app.post("/api/shorturl/new", function (req, res, next) {
  createAndSaveUrl(req.body.url, function(err, data) {
    if(err) return res.json(err);
    if(!data) return res.json({message: 'Missing callback argument'});
    res.json({original_url: data.originalUrl, short_url: data.shortUrl});
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});