
const dayjs = require('dayjs')
const fs = require('fs')
const  {google} = require('googleapis');
const dotenv = require('dotenv');
const { request } = require('http');
const { composer } = require('googleapis/build/src/apis/composer');

dotenv.config();

const credentials = JSON.parse(fs.readFileSync('../servicekey.json', 'utf8'));
const sheetIds = JSON.parse(fs.readFileSync('./sheetData.json'))

function getSpreadSheetID(requestedDate){    
    return sheetIds[requestedDate].sheetID || null;
}

async function createNewSpreadSheet(requestedDate){ 
    const spreadsheetTitle = `Noho Patient Log ${dayjs(requestedDate).format('MMMM YYYY')}`;
    
    const requestedDate = '2023-07-01';
    createNewSpreadSheet(requestedDate)
      .then(spreadsheetId => {
        console.log(`New spreadsheet created with ID: ${spreadsheetId}`);
      })
      .catch(error => {
        console.error('Error creating spreadsheet:', error);
      });
    
    

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
        name : spreadsheetTitle,
        parents : ['1Er-wmWTGrrE_2jwQvMZDvPlV3URw2zqn']
    }
    const file = await sheets.files.create({
        resource , 
        fields : 'id'

    })
    console.log(file);

    // create 30 sheets within the spreadsheet 
    for (let i=0 ;i<30 ; ++i){
        const sheetDate = dayjs(requestedDate).endOf('month').subtract(i-1, 'day');
        const sheetTitle = sheetDate.format('MMM D');

        await sheets.spreadsheets.batchUpdate({
            resource: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: sheetTitle 
                         }
                    }
                }
            ]
         }
      });

      console.log(`Created Sheet: ${sheetTitle}`);
    }
    module.exports = getSpreadSheetID;

   // return getSpreadSheetID;
}







/*

    //fix: AFTER GETTING THE SPREADSHEET ID THEN UPDATE THE OBJECT THAT CONTAINS THE ID AND THEN WRITE IT BACK TO THE LOCAL FILE 

    let dateToWrite = dayjs(requestedDate).format('YYYY-MM');
    console.log(dateToWrite);
    let sheetData = JSON.parse(fs.readFileSync('./sheetData.json').toString());
    console.log(JSON.stringify(sheetData));
    sheetData[dateToWrite] = file.data.id;
    fs.writeFileSync('./sheetData.json', JSON.stringify(sheetData, null,2));
   // fs.writeFileSync(sheetData)
   
    return file.data.id;  
}


*/


