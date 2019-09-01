'use strict'; 

// Load environment variables
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Setup dependencies
const request = require('request');
const twilioClient = require('twilio')(twilioAccountSid, twilioAuthToken);

// Define random strings
// [TODO] Query DynamoDB for message completion strings
const messageCompletions = [
  "I slipped and got it all down my front",
  "I had it tested and it dosen't look good",
  "I totally agree with what Donald Trump said"
];

// Required in responses for CORS support to work
const headers = {'Access-Control-Allow-Origin': '*'};

module.exports.sendChaosSms = async function (event, context) {

  // Construct a chaos message to send
  var randomMessageIndex = Math.floor(Math.random() * messageCompletions.length);
  var messageToSend = event.body.message.replace("__________________", messageCompletions[randomMessageIndex]);

  // Randomly choose number to send the message to
  var numbers = event.body.to.split(",");
  var randomNumberIndex = Math.floor(Math.random() * numbers.length);
  var numberToSend = numbers[randomNumberIndex];

  // Try to send the message
  const twilioRequest = {
    to: numberToSend,
    body: messageToSend || '',
    from: twilioPhoneNumber,
  };

  console.log('Twilio request:', twilioRequest);

  // Send SMS
  return twilioClient.messages
    .create(twilioRequest)
    .then(twilioResponse => {

      console.log('Twilio response:', twilioResponse);
      
      // check for success
      if (twilioResponse.errorCode) {
        // Error
        const errorResponse = {
          headers: headers,
          statusCode: 500,
          body: JSON.stringify({
            status: 'error',
            message: twilioResponse.errorMessage,
            error: twilioResponse.errorCode,
            response: twilioResponse
          })
        };
    
        console.log('Error response:', errorResponse);

        return errorResponse;
      }
      else {
        // Success
        const successResponse = {
          headers: headers,
          statusCode: 200,
          body: JSON.stringify({
            status: 'success',
            message: twilioResponse.body,
            raw: twilioResponse
          })
        };
  
        console.log('Successful response:', successResponse);

        return successResponse;
      }
    })
    .catch(twilioResponse => {
        // Error
        const errorResponse = {
          headers: headers,
          statusCode: 500,
          body: JSON.stringify({
            status: 'error',
            message: twilioResponse.errorMessage,
            error: twilioResponse.errorType,
            response: twilioResponse
          })
        };
    
        console.log('Exception response:', errorResponse);

        return errorResponse;
    });
};

