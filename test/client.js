//https://github.com/hueniverse/hawk
var Request = require('request');
var Hawk = require('hawk');
var querystring = require('querystring');
var q = '?' + querystring.stringify({foo:'bar', entity: 'https://indy24.cupcake.is'});
var endpoint = 'discover';
var userid = 3;
var url = 'http://localhost:3000/' + endpoint + '/' + userid + q;

// Client credentials

var credentials = {
    id: 'l8KxRj2zXSK8oY9VHE4Zd',
    key: '_wzccdkOhA4ViByy1DmqY',
    algorithm: 'sha256'
}

// Request options

var post = {
  type: 'https://tent.io/types/status/v0',
  content: {
    text: 'Hello World! ' + Date.now()
  }
};
var requestOptions = {
    uri: url,
    headers: {"Content-Type": "application/json"},
    method: 'GET'
    //body: JSON.stringify(post),
};

// Generate Authorization request header

var header = Hawk.client.header(url, requestOptions.method, { credentials: credentials, ext: 'some-app-data' });
requestOptions.headers.Authorization = header.field;

// Send authenticated request

Request(requestOptions, function (error, response, body) {

    // Authenticate the server's response

    var isValid = Hawk.client.authenticate(response, credentials, header.artifacts, { payload: body });

    // Output results

    console.log(response.statusCode + ': ' + body + (isValid ? ' (valid)' : ' (invalid)'));
});
