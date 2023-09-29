

// Define the desired time for the script to run daily (24-hour format)
const desiredHour = 7; // 7 AM
const desiredMinute = 0; // 0 minutes

// Calculate the milliseconds until the desired time
const now = new Date();
const desiredTime = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate(),
  desiredHour,
  desiredMinute,
  0,
  0
);
let timeUntilDesiredTime = desiredTime.getTime() - now.getTime();
if (timeUntilDesiredTime < 0) {
  // If the desired time has already passed today, schedule it for tomorrow
  timeUntilDesiredTime += 24 * 60 * 60 * 1000; // 24 hours in milliseconds
}

// Function to execute the script
function executeScript() {
  // Call the function that checks the field and sends notifications
  checkFieldAndSendNotification();

  // Schedule the script to run again tomorrow at the desired time
  setTimeout(executeScript, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
}

// Schedule the initial execution of the script
setTimeout(executeScript, timeUntilDesiredTime);
