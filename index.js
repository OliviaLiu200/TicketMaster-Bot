const puppeteer = require('puppeteer');
const $ = require('cheerio');
const nodemailer = require('nodemailer');
const CronJob = require('cron').CronJob;

const url = 'https://www.ticketmaster.ca/dpr-regime-world-tour-2022-toronto-ontario-09-25-2022/event/10005C86E8DE4F0F';

//configuring browser and make new page to go to
async function browserConfig() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    return page;
}

//email you when the price is low
async function sendNotification(price) {

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'olivialiu200@gmail.com',
      pass: 'DPRWEGANGGANG'
    }
  });

  let info = await transporter.sendMail({
    from: '"Price Tracker" <olivialiu200@gmail.com>',
    to: "olivialiu200@gmail.com",
    subject: 'The price of your DPR tickets dropped to ' + price, 
    text: 'The price is now ' + price + '! Time to spend some money.',
    html: `<a href=\"${url}\">Link</a>`
  });

  console.log("Message sent: %s", info.messageId);
}

//function that will check the price of the ticket
async function findPrice(page) {
    await page.reload();
    let html = await page.evaluate(() => document.body.innerHTML);

    $('#sc-fFeiMQ bCvzDL text text--dark text--primary sc-ywFzA czvjRM', html).each(function() {
        let priceWithDollarSign = $(this).text();
        // console.log(dollarPrice);
        let curPrice = Number(priceWithDollarSign.replace(/[^0-9.-]+/g,""));

        if (curPrice < 250) {
            console.log("Low Price! " + curPrice);
            sendNotification(curPrice);
        }
    });
}

async function startTracking() {
    const page = await browserConfig();

    //runs every 30 minutes in this version
    let job = new CronJob('* */30 * * * *', function() { 
      findPrice(page);
    }, null, true, null, null, true);
    job.start();
}

startTracking();