var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors');
var router = express.Router();
var url = require('url');
var validUrl = require('valid-url');
var dns = require('dns');
var uniqid = require('uniqid');
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);

var shortUrlSchema = new mongoose.Schema({
  shortUrl: { type: String, required: true },
  originalUrl: { type: String, required: true }
});

var ShortUrl = new mongoose.model('ShortUrl', shortUrlSchema);

var port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({extended: 'false'}));
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get("/api/shorturl/:shortUrl", function (req, res, next) {
  ShortUrl.findOne({shortUrl: req.params.shortUrl}, function(err, data) {
    if (err) return res.json({ error: "invalid URL 1" });
    if (!data) return res.json({ error: "invalid URL 2" });
    return res.redirect(data.originalUrl);
  });
});

app.post("/api/shorturl/new", function (req, res, next) {
  if (!validUrl.isUri(req.body.url)) return res.json({ error: "invalid URL 3" });
  dns.lookup(url.parse(req.body.url).host, {}, function(err, address, family) {
    if (err) return res.json({ error: "invalid URL 4" });
    var shortUrl = new ShortUrl({shortUrl: uniqid(), originalUrl: req.body.url});
    shortUrl.save(function(err, data) {
      if (err) return res.json({ error: "invalid URL 5" });
      return res.json({original_url: data.originalUrl, short_url: data.shortUrl});
    });
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});