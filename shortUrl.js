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

// Find
var findOneByShortUrl = function(shortUrl, done) {
  ShortUrl.findOne({shortUrl: shortUrl}, function(err, data) {
    if (err) return done({ error: "invalid URL" });
    if (!data) return done({ error: "invalid URL" });
    return done(null, data);
  });
};

// Create
var createAndSaveUrl = function(originalUrl, done) {
  if (!validUrl.isUri(originalUrl)) {
    return done({ error: "invalid URL" });
  }
  
  dns.lookup(url.parse(originalUrl).host, {}, function(err, address, family) {
    if (err) {
      return done({ error: "invalid URL" });
    }
  });
  
  var shortUrl = new ShortUrl({shortUrl: uniqid(), originalUrl: originalUrl});
  
  shortUrl.save(function(err, data) {
    if (err) return done(err);
    return done(null, data);
  });
}

// Exports
exports.ShortUrlModel = ShortUrl;
exports.findOneByShortUrl = findOneByShortUrl;
exports.createAndSaveUrl = createAndSaveUrl;