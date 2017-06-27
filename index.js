'use strict';

const app = require('express')();
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
const dotenv = require('dotenv');
// const FacebookBot = require('./facebook-bot');

dotenv.load();

app.set('port', process.env.PORT || 8000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/hook', function (req, res) {

    console.log('hook request');

    try {
        let speech;
        let isAuthenticated;

        if (req.body) {
            const requestBody = req.body;

            if (requestBody.result) {
                const result = requestBody.result;
                // 'authenticate' action
                if(result.action === 'authenticate') {
                  if(result.parameters.apiKey.any !== '') {
                    // Some API key provided
                    if (result.parameters.apiKey.any === '1234') {
                      isAuthenticated = 1;
                      speech = 'Successfully authenticated! Now you can check your balance and transactions :)';
                    } else {
                      speech = 'Invalid API Key. Please provide a valid API Key!';
                    }
                  } else {
                    // No API key provided yet, then return whatever api.ai returns
                    speech = result.fulfillment.speech;
                  }
                } else if(result.action === 'getBalance') {
                  if(result.parameters.isAuthenticated === '1.0') {
                    // User is already authenticated
                    const balance = Math.floor(Math.random() * 1000) + 100
                    speech = `Your balance as of now is EUR ${balance}`;
                  } else {
                    speech = 'You are not authenticated!!';
                  }
                }
            }
        }

        console.log('result: ', speech);

        return res.json({
            speech: speech,
            displayText: speech,
            contextOut: [
              {
                name: 'authentication',
                lifespan: 5,
                parameters: {
                  isAuthenticated: isAuthenticated
                }
              }
            ],
            source: 'apiai-webhook-sample'
        });
    } catch (err) {
        console.error("Can't process request", err);

        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});

// Set Express to listen out for HTTP requests
var server = app.listen(app.get('port'), () => {
  console.log("Listening on port %s", server.address().port);
});