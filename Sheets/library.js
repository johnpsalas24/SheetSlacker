    const  {google } = require('googleapis');
    const dotenv = require('dotenv');
    dotenv.config();
    const axios = require('axios');
    const {send} = require('process');
    const cron = require('cron'); //module scheduler
    const fs = require('fs');
    const dayjs = require('dayjs');
    const calculateDates = require('../defs/getDates.js')
    const getSpreadSheetID = require('./getSheets.js');
    const sendSlackNotification = require('../slackTemplate.js');





    async function extractSheetData(){
        const sheets = await authenticateClient();
        const listOfDatesToGet = calculateDates();
        console.log(listOfDatesToGet)
        for (const dateString of listOfDatesToGet){ 
            const YearMonthFormattedDate = dayjs(dateString.longDate).format('YYYY-MM')
            const range = dateString.shortDate + '!Z2:AI';   
            const sheetID = getSpreadSheetID(YearMonthFormattedDate)
            const extractSheetData = await getSpreadsheetValues(sheets,sheetID,range)
            //console.log(extractSheetData)
            const filledRows = findFilledRows(extractSheetData)

            checkForMissingData(filledRows)
        
        }

    }

    async function authenticateClient(){
        const credentials = JSON.parse(fs.readFileSync('../servicekey.json', 'utf8'));
        const client = new google.auth.JWT(
            credentials.client_email,
            null,
            credentials.private_key ,
            ['https://www.googleapis.com/auth/spreadsheets']
        );
        try {
            await client.authorize();
            const sheets = google.sheets({version: 'v4' , auth: client });
            return sheets;

        }

        catch (error) {
            console.error('Error:', err);
        }
    }

    async function getSpreadsheetValues(sheets,sheetId,range){
        console.log(sheetId)
        console.log(range)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: range,

        })
        return response.data.values
    }

    function findFilledRows(allSheetData) { 
        const rows = allSheetData;
        //rows.sort((a,b) => new Date(a[3]) - new Date(b[3]));
    
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

    async function checkForMissingData(parsedSheetRows){
        const rows = parsedSheetRows
        //rows.sort((a,b) => new Date(a[3]) - new Date(b[3]));
        //console.log(rows) //log how many patient rows exist on the current sheet
        // Process each row
        for(const row of rows){ 
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
            await sendSlackNotification(firstName, lastName, dateOfService, dateOfBirth ,'FINAL RESULT is MISSING', 'https://google.com');
            } 
            // If the Patient's lenco is entered on the sheet and if provider review is not entered send a slack meesage to #spreadsheet-alerts.
            if(sentLenco === 'TRUE' && providerReview === 'FALSE'){
                await sendSlackNotification(firstName, lastName, dateOfService, dateOfBirth ,'PROVIDER REVIEW IS MISSING', 'https://google.com');
            }
        }   
    }

    extractSheetData()