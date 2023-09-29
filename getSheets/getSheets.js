
const dayjs = require('dayjs')
const fs = require('fs')
const  {google} = require('googleapis');
const dotenv = require('dotenv');
const { request } = require('http');

dotenv.config();

const credentials = JSON.parse(fs.readFileSync('../servicekey.json', 'utf8'));
const sheetIds = JSON.parse(fs.readFileSync('./sheetData.json'))

function getSpreadSheetID(requestedDate){    
    return sheetIds[requestedDate].sheetID || null
}

async function createNewSpreadSheet(requestedDate){ 
    const spreadsheetTitle = `Noho Patient Log ${dayjs(requestedDate).format('MMMM YYYY')}`

    //console.log(sheetId);

    // Slack webhook configuration
    const slackWebhookUrl = process.env.SLACK_WEBHOOK;  // Replace with your Slack webhook URL
    console.log(slackWebhookUrl); 
    // Create a new Google Sheets API client
    const client = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key ,
    ['https://www.googleapis.com/auth/drive']
    );
    await client.authorize();
    //console.log(credentials.client_email)

    // Access the Google Sheets API
    const sheets = google.drive({ version: 'v3', auth: client });
    const resource = { 
        mimeType : "application/vnd.google-apps.spreadsheet",
        name : "Noho Patient Log",
        parents : ['1Er-wmWTGrrE_2jwQvMZDvPlV3URw2zqn']
    }
    const file = await sheets.files.create({
        resource , 
        fields : 'id'

    })
    console.log(file)

    //fix: AFTER GETTING THE SPREADSHEET ID THEN UPDATE THE OBJECT THAT CONTAINS THE ID AND THEN WRITE IT BACK TO THE LOCAL FILE 

    let dateToRight = dayjs(requestedDate).format('YYYY-MM')
    console.log(dateToRight)
    let sheetData = JSON.parse(fs.readFileSync('./sheetData.json').toString())
    console.log(JSON.stringify(sheetData))
    sheetData[dateToRight] = file.data.id
    fs.writeFileSync(sheetData)
    return file.data.id
}

module.exports = getSpreadSheetID