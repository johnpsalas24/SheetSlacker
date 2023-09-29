const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function listMajors(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    range: 'Class Jun 19!AE:3',
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  console.log('Name, Major:');
  rows.forEach((row) => {
    // Print columns A and E, which correspond to indices 0 and 4.
    console.log(`${row[0]}, ${row[4]}`);
  });
}

authorize().then(listMajors).catch(console.error);

/*
const { findSeries } = require('async');
const { google } = require('googleapis');
const IncomingWebhook  = require('slack-webhook');
//const fs = require('fs')
// Google Sheets API configuration
//const credentials = require('./credentials.json'); // Path to your Google Sheets API credentials
const sheetId = '1ywU77YiJATjoDm7ghHtnnEYhgqrnwCONDx4_S3-psuM'; // Replace with your Google Sheet ID
const range = 'Jun 19!AE:AE'; // Replace with the desired sheet name and range

// Slack webhook configuration2
const slackWebhookUrl = 'https://hooks.slack.com/services/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'; // Replace with your Slack webhook URL

//const credentials = JSON.parse(fs.readFileSync('./credentials.json')).installed
const credentials = require('/Users/clearmd/Documents/ClearMD/SheetSlacker/credentials.json');
//console.log(credentials)

// Create a new Google Sheets API client
const client = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);
console.log(client)
// Create a new Slack webhook client
const slack = new IncomingWebhook(slackWebhookUrl);

async function checkFieldAndSendNotification() {
  try {
    // Authorize the Google Sheets API client
    await client.authorize();

    // Access the Google Sheets API
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Get the values from the specified range
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range,
    });

    const rows = response.data.values;

    // Process each row
    rows.forEach(row => {
      const field = row[0];
      const otherField = row[1];
      const checkedOff = row[2] === 'TRUE'; // Modify if your checkbox value is different

      // Check your condition here
      if (!checkedOff && otherField === 'EXPECTED_VALUE') {
        sendSlackNotification(field);
      }
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

function sendSlackNotification(field) {
  try {
    const message = `Field '${field}' is not checked off as expected.`;

    // Send the notification to Slack
    slack.send(message);
  } catch (err) {
    console.error('Error sending Slack notification:', err);
  }
}

// Run the check and notification function
checkFieldAndSendNotification();
*/

// version 2