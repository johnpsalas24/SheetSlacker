const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
const dayjs = require('dayjs');
const sheetData = require('./sheetData.json');
const fs = require('fs');

const credentials = JSON.parse(fs.readFileSync('../servicekey.json', 'utf8'));

async function createSpreadsheetWithSheets(title, month, year, sampleSheetId) {
  const auth = new GoogleAuth({
    keyFile: '/Users/clearmd/Documents/ClearMD/SheetSlacker/src/servicekey.json',
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  });

  const sheets = google.sheets({ version: 'v4', auth }); // google sheets API
  const drive = google.drive({ version: 'v3', auth }); // google drive API
  const sheetId = sheetData['$']


  try {
    // Create a new spreadsheet
    const resource = {
      properties: {
        title,
      },
    };
    const spreadsheet = await sheets.spreadsheets.create({
      resource,
      fields: 'spreadsheetId',
    });
    console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetId}`);
    const spreadsheetId = spreadsheet.data.spreadsheetId;

    // Move the new spreadsheet into the specified folder
    const folderId = '1Er-wmWTGrrE_2jwQvMZDvPlV3URw2zqn';
    await drive.files.update({
      fileId: spreadsheetId,
      addParents: folderId,
      removeParents: 'root',
      fields: 'id, parents',
    });
    console.log('Spreadsheet has been moved to Google Drive folder.');

    // Create sheets for each day of the month
    const numberOfDays = dayjs(`${year}-${month}-01`).endOf('month').date();
    const requests = [];

    for (let day = 1; day <= numberOfDays; day++) {
      const sheetTitle = dayjs(`${year}-${month}-${day}`).format('MMM D');
      console.log(`Creating sheets: ${sheetTitle}`);

      requests.push({
        addSheet: {
          properties: {
            title: sheetTitle,
          },
        },
      });
    }

    // Batch update to create the sheets
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests,
      },
    });

    // If sampleSheetId is provided, copy data from the sample sheet to each new sheet
    if (sampleSheetId) {
      const sourceSpreadsheetId = sampleSheetId;
      const sourceSheetsResponse = await sheets.spreadsheets.get({
        spreadsheetId: sourceSpreadsheetId,
        fields: 'sheets(properties.sheetId,properties.title)',
      });
      const sourceSheets = sourceSheetsResponse.data.sheets;
      for (const sourceSheet of sourceSheets) {
        const copyRequest = {
          spreadsheetId: sourceSpreadsheetId,
          sheetId: sourceSheet.properties.sheetId,
          resource: {
            destinationSpreadsheetId: spreadsheetId,
          },
        };
        console.log(`Cloning google sheet: ${sourceSheet.properties.title}`);

        try {
          await sheets.spreadsheets.sheets.copyTo(copyRequest);
          console.log(`Cloned to ${sourceSheet.properties.title}`);
        } catch (error) {
          console.error('Error cloning sheet:', error.message);
        }
      }
    }

    console.log('Google Sheets created and cloned successfully.');
    return spreadsheetId;
  } catch (err) {
    console.error('Error creating spreadsheet:', err.message);
    throw err;
  }
}

async function createSpreadsheetForLastDayOfMonth() {
  const currentDate = dayjs().endOf('month');
  const isLastDayOfMonth = currentDate.isSame(currentDate.endOf('month'), 'day');

  if (isLastDayOfMonth) {
    const nextMonth = currentDate.add(1, 'month');
    const title = `Noho Patient Log ${nextMonth.format('MMMM YYYY')}`;
    const sampleSheetId = '12hyRx1F-DunYRbG6FWgANSR_Up5eouIVZVWeMi8ZoB8'; // SAMPLE SHEET ID WITH EMPTY FIELDS (CLONING)

    try {
      const spreadsheetId = await createSpreadsheetWithSheets(
        title,
        nextMonth.format('MM'),
        nextMonth.format('YYYY'),
        sampleSheetId
      );
      console.log(`Spreadsheet created for ${nextMonth.format('MMMM YYYY')} with ID: ${spreadsheetId}`);
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      throw error;
    }
  } else {
    console.log('Today is not the last day of the month. No spreadsheet will be created.');
  }
}

// Call the function to create the spreadsheet for the last day of the month
createSpreadsheetForLastDayOfMonth();
