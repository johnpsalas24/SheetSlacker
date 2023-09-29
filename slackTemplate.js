const axios = require('axios');
const dotenv = require('dotenv')
dotenv.config()
const slackWebhookUrl = process.env.SLACK_WEBHOOK;

function sendTemplateSlacker(firstName, lastName, dateOfService, dateOfBirth, errorMessage,sheetURL){
    console.log('Here I am')
    console.log(slackWebhookUrl)
    let templateString = { 

                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": errorMessage,
                            "emoji": true
                        }
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `*<${sheetURL} | ${firstName}, ${lastName}>*\nAPPT DATE : ${dateOfService}\nDATE OF BIRTH : ${dateOfBirth}\n`
                        },
                        "accessory": {
                            "type": "image",
                            "image_url": "https://cdn.dribbble.com/users/942040/screenshots/5389320/notification.gif",
                            "alt_text": "calendar thumbnail"
                        }
                    },
                    {
                        "type": "divider"
                    },
                    {
                        "type": "divider"
                    }
                ]
    }
    return templateString; 
    }

    async function sendSlackNotification(firstName, lastName, dateOfService, dateOfBirth, errorMessage,sheetURL) {
        const templateString = sendTemplateSlacker(firstName , lastName , dateOfService , dateOfBirth , errorMessage , sheetURL)
        try {
          // Send the notification to Slack using axios
          await axios.post(slackWebhookUrl, templateString);
        } catch (err) {
          console.error('Error sending Slack notification:', err);
        }
      }

      module.exports = sendSlackNotification;