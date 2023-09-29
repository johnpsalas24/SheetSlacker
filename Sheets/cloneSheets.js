const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
const dayjs = require('dayjs');
const sheetData = require('./sheetData.json');
const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');
const sheets = google.sheets('v4');

async function cloneSheetWithData(sourceSpreadsheetId, sourceSheetId, destinationSpreadsheetId) {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: sourceSpreadsheetId,
      ranges: [`${sourceSheetId}`],
      includeGridData: true,
    });

    const sourceSheetData = response.data.sheets[0].data[0];
    const sourceGridData = sourceSheetData.rowData;

    // Create the destination sheet in the destination spreadsheet
    const destinationSheetResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: destinationSpreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sourceSheetData.rowData[0].values[0].formattedValue, // Set the destination sheet title
              },
            },
          },
        ],
      },
    });

    const destinationSheetId = destinationSheetResponse.data.replies[0].addSheet.properties.sheetId;

    // Copy the data to the destination sheet
    const requests = [
      {
        pasteData: {
          coordinate: {
            sheetId: destinationSheetId,
            rowIndex: 0,
            columnIndex: 0,
          },
          data: sourceGridData,
          type: 'PASTE_NORMAL',
          delimiter: '\t',
        },
      },
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: destinationSpreadsheetId,
      requestBody: {
        requests,
      },
    });

    console.log('Sheet cloned with data successfully.');

    return destinationSheetId;
  } catch (err) {
    console.error('Error cloning sheet with data:', err);
    throw err;
  }
}

module.exports = cloneSheetWithData; 
