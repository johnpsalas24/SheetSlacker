const dotenv = require('dotenv');
const {createNewSpreadSheet} = require('./createSheets.js');
dotenv.config();

//const credentials = JSON.parse(fs.readFileSync('../servicekey.json', 'utf8'));
//const sheetIds = JSON.parse(fs.readFileSync('./sheetData.json'));


async function run() {
  try {
    const requestedDate = '2023-06'; // Replace with your desired date

    const spreadsheetId = await createNewSpreadSheet(requestedDate);
    console.log(`New spreadsheet created with ID: ${spreadsheetId}`);
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
  }
}

run();




