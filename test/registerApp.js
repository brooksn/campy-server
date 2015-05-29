//https://github.com/hueniverse/hawk
var Request = require('request');
var Hawk = require('hawk');
var endpoint = 'new_post';
var userid = 3;
var url = 'http://localhost:3000/tent/' + endpoint + '/' + userid;
//console.log('url: ' + url);

// Client credentials

var credentials = {
    id: 'l8KxRj2zXSK8oY9VHE4Zd',
    key: '_wzccdkOhA4ViByy1DmqY',
    algorithm: 'sha256'
};

// Request options

var post = {
  type: 'https://tent.io/types/app/v0',
  content: {
    text: 'Hello World! ' + Date.now()
  }
};
var requestOptions = {
    uri: url,
    headers: {'Content-Type': 'application/json'},
    method: 'POST',
    body: JSON.stringify(post)
};
console.log(JSON.stringify(requestOptions, null, '  '));

// Generate Authorization request header
var opts;
opts = {credentials: credentials, ext: 'some-app-data' };


var header = Hawk.client.header(url, requestOptions.method, opts);
//requestOptions.headers.Authorization = header.field;

// Send authenticated request

Request(requestOptions, function (error, response, body) {

    // Authenticate the server's response

    var isValid = Hawk.client.authenticate(response, credentials, header.artifacts, { payload: body });

    // Output results

    console.log(response.statusCode + ': ' + body + (isValid ? ' (valid)' : ' (invalid)'));
});
