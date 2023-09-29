const  {google} = require('googleapis');
const dotenv = require('dotenv');
const axios = require('axios');
const cron = require('cron'); //module scheduler
const fs = require('fs');
const { send } = require('process');
const sendSlackNotification = require('./slackTemplate.js')
dotenv.config();

const credentials = JSON.parse(fs.readFileSync('./servicekey.json', 'utf8'));


const sheetId = process.env.SPREADSHEET_ID; // Replace with your Google Sheet ID
//console.log(sheetId);
const range = 'Jun 26!Z2:AI'; // Replace with the desired sheet name and range

// Slack webhook configuration
const slackWebhookUrl = process.env.SLACK_WEBHOOK;  // Replace with your Slack webhook URL
console.log(slackWebhookUrl); 
// Create a new Google Sheets API client
const client = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key ,
  ['https://www.googleapis.com/auth/spreadsheets']
);

async function checkFieldAndSendNotification() {
  try {
    // Authorize the Google Sheets API client
    await client.authorize();
    //console.log(credentials.client_email)

    // Access the Google Sheets API
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Get the values from the specified range
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range,
    });
    let rows = findFilledRows(response)
    console.log(rows) //log how many patient rows exist on the current sheet
    // Process each row
    rows.forEach(row => {
      const lastName = row[0];
      const firstName = row[1];
      const dateOfBirth = row[2];
      const dateOfService = row[3];
      const tests = row[4];
      const preliminaryResult = row[5];
      const finalResult = row[6];
      const sentNoho = row[7];
      const sentLenco = row[8];
      const providerReview = row[9];
      
      

      // If the Patient's final result is not entered on the sheet then send a slack message to #spreadsheet-alerts.
      if(finalResult === 'FALSE'){
        sendSlackNotification(firstName, lastName, dateOfService, dateOfBirth ,'FINAL RESULT is MISSING.', 'https://google.com');
      } 
      // If the Patient's lenco is entered on the sheet and if provider review is not entered send a slack meesage to #spreadsheet-alerts.
      if(sentLenco === 'TRUE' && providerReview === 'FALSE'){
        sendSlackNotification(firstName, lastName, dateOfService, dateOfBirth ,'Needs Provider Review.', 'https://google.com');
      }
    
    });
  } catch (err) {
    console.error('Error:', err);
  }
}





function findFilledRows(response) { 
  const rows = response.data.values;

  // Take out the first row that just contains the name of the rows 
  rows.splice(0 , 1);

  // Return the index of the last row that we want to use. 
  const emptyRowIndex = rows.findIndex(
    column => column[0] === '' && column[1] === '' && column[2] === '' && column[3] === '');

  // Remove the all the data from the first empty row to the last elemement in the array
  rows.splice(emptyRowIndex , rows.length - emptyRowIndex);

  // When we remove all the rows we return the usable data
  return rows;
}


checkFieldAndSendNotification();
