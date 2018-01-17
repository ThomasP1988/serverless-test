import AWS from 'aws-sdk';
const axios = require('axios');
const EmailTemplate = require('email-templates');
const SWITCH_ENDPOINT = "https://rest.staging.energyhelpline.com/domestic/energy/switches/";

export async function main(event, context, callback) {
  AWS.config.region = 'eu-west-1';
  const ses = new AWS.SES();
  const emailTemplate = new EmailTemplate({
    views: { root: 'emails' }
  });
  const data = JSON.parse(event.body);
  const params = event.queryStringParameters;
  let switchData = {};

  try {
    const switchRequest = await axios.get(SWITCH_ENDPOINT + params.switchId);
    switchData = switchRequest.data;
  } catch (e) {
    console.log(e);
    callback(e, { status: false });
  }
  try {
    const renderedEMail = await emailTemplate
      .render('switched/html', {
        name: switchData.customerData.firstName
      });
      let emailReceiver = switchData.customerData.eMail;

  let emailParams = {
    Destination: {
      ToAddresses: [emailReceiver]
    },
    Message: {
      Body: {
        Html: {
          Data: renderedEMail,
          Charset: "utf-8"
        },
        Text: {
          Data: "account switched",
          Charset: "utf-8"
        }
      },
      Subject: {
        Data: "Switched",
        Charset: "utf-8"
      }
    },
    Source: "donotreply@thelabrador.co.uk"
  };

  await ses.sendEmail(emailParams, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      callback(err, { status: false });
    } else {
      console.log("SES successful");
    }
  });
  } catch (e) {
    callback(e, { status: false });
    console.log(e);
  }

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify({ status: "OK" })
  };

  callback(null, response);

}