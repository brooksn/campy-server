//https://github.com/hueniverse/hawk
var Request = require('request');
var Hawk = require('hawk');
var url = "http://localhost:3000/new_post/1";

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
    text: 'Hello World!'
  }
};
var requestOptions = {
    uri: url,
    method: 'POST',
    body: JSON.stringify(post),
    headers: {
      "Content-Type": "application/json"
    }
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
