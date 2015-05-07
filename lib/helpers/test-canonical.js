var canonical = require('./tent-canonical-post-json');
var crypto = require('crypto');
var apost = {
  "app": {
    "name": "Status",
    "url": "https://apps.cupcake.io/status"
  },
  "content": {
    "text": "Saw a sheep shearing demonstration a few weeks ago. If all farms operate like that I have zero ethical issues with wool."
  },
  "entity": "https://daniel.cupcake.is",
  "extraneous": 1430.664961443,
  "id": "R5WpeSJFFfNwFETyjZtTXA",
  "published_at": 1430664961443,
  "type": "https://tent.io/types/status/v0#",
  "version": {
    "id": "sha512t256-3303d4ff87a1f8f120f407b9fb28dc0dcef02001f5786b4a04e8cb835d886c14",
    "published_at": 1430664961443
  }
};
var postcopy = JSON.parse(JSON.stringify(apost));
var canpost = JSON.stringify(canonical(postcopy), null, '');
var shasum = crypto.createHash('sha512');
shasum.update(canpost);
var d = 'sha512t256-' + shasum.digest('hex').substr(0,64);
var pass = d == apost.version.id;

console.log('pass: ' + pass);

