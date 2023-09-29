const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
const dayjs = require('dayjs');
const sheetData = require('./sheetData.json');
const fs = require('fs');
///const cloneSheetWithData = require('./cloneSheets.js');


const credentials = JSON.parse(fs.readFileSync('../servicekey.json', 'utf8'));


async function createSpreadsheetWithSheets(title, month, year, sampleSheetId) {
  const auth = new GoogleAuth({
    keyFile: '/Users/clearmd/Documents/ClearMD/SheetSlacker/src/servicekey.json',
    scopes: [ 
        'https://www.googleapis.com/auth/spreadsheets', 
        'https://www.googleapis.com/auth/drive'
    ],
  });

  const sheets = google.sheets({ version: 'v4', auth }); // google sheets API
  const drive = google.drive({ version: 'v3' , auth});   // google drive API
  const sheetId = sheetData['$']
  const resource = {
    properties: {
      title,
    },
  };

  try {
    const spreadsheet = await sheets.spreadsheets.create({
      resource,
      fields: 'spreadsheetId',
    });

    console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetId}`);
    const spreadsheetId = spreadsheet.data.spreadsheetId;



    //move spreadsheet into specified folder 
    const folderId = '1Er-wmWTGrrE_2jwQvMZDvPlV3URw2zqn';
    await drive.files.update({
        fileId: spreadsheetId,
        addParents: folderId,
        removeParents: 'root',
        fields: 'id, parents',
    });
    console.log('Spreadsheet has been moved to google drive folder.');

    const numberOfDays = dayjs(`${year}-${month}-01`).endOf('month').date();
    const requests = [];

    for (let day = 0; day < numberOfDays; day++) {
      const sheetTitle = dayjs(`${year}-${month}-${day+1}`).format('MMM D');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
      requests.push({
        addSheet: {
          properties: {
            title: sheetTitle,
          },
        },
      });
    }

    /*
       // If sampleSheetId is provided, copy data from the sample sheet
       if (sampleSheetId) {
        const sourceSpreadsheetId = sampleSheetId;
        const sourceSheetsResponse = await sheets.spreadsheets.get({
          spreadsheetId: sourceSpreadsheetId,
          fields: 'sheets.properties',
        });
        const sourceSheets = sourceSheetsResponse.data.sheets;
  
        for (const sourceSheet of sourceSheets) {
          requests.push({
            copySheet: {
              sourceSheetId: sourceSheet.properties.sheetId,
              destinationIndex: requests.length, // clone the sheet as the last sheet in the new spreadsheet
            },
          });
        }
      }
  
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests,
        },
      });
      */
        // If sampleSheetId is provided, copy data from the sample sheet
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
    // Delete the default Sheet1
    const deleteRequest = {
      deleteSheet: {
        sheetId: 0, // 0 refers to Sheet1
      },
    };
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [deleteRequest],
      },
    });


console.log('Sheets created successfully.');
return spreadsheetId;
} catch (err) {
console.error('Error creating spreadsheet:', err.message);
throw err;
}
}

    /*
      const copyRequest = {
      

      spreadsheetId: sourceSpreadsheetId,
      sheetId: sourceSheet.properties.sheetId,
      resource: {
        destinationSpreadsheetId: spreadsheetId,
      },
    };
    await sheets.spreadsheets.sheets.copyTo(copyRequest);
  }
}

      
      console.log('Sheets created successfully.');
      return spreadsheetId;
      } catch (err) {
      throw err;
  }
}
*/
async function createSpreadsheetForLastDayOfMonth() {
    const currentDate = dayjs();
    const isLastDayOfMonth = currentDate.isSame(currentDate.endOf('month'), 'day');
  //  true; // Set isLastDayOfMonth to true
  
    if (isLastDayOfMonth) {
      const nextMonth = currentDate.add(1, 'month');
      const title = `Noho Patient Log ${nextMonth.format('MMMM YYYY')}`;
      //this is new logic for sample sheet clone
      const sampleSheetId = '12hyRx1F-DunYRbG6FWgANSR_Up5eouIVZVWeMi8ZoB8';  //sheet id for the clone template
  
      try {
        const spreadsheetId = await createSpreadsheetWithSheets(title, nextMonth.format('MM'), nextMonth.format('YYYY'), sampleSheetId);
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
  
/*
async function createSpreadsheetForLastDayOfMonth() {
  const currentDate = dayjs();
  const isLastDayOfMonth = currentDate.isSame(currentDate.endOf('month'), 'day');

  if (isLastDayOfMonth) {
    const nextMonth = currentDate.add(1, 'month');
    const title = `Noho Patient Log ${nextMonth.format('MMMM YYYY')}`;

    try {
      const spreadsheetId = await createSpreadsheetWithSheets(title, nextMonth.format('MM'), nextMonth.format('YYYY'));
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
*/