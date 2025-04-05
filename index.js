'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require('request');
const puppeteer = require('puppeteer'); 
const cron = require('node-cron');

const logo = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeooXoK68HmcOpgl27nT8ctfnqBZoPyXTrmoOq3ObqZWT73EAyxQpTMh4Sps8OQ5hAW9I&usqp=CAU";
const fromEmail = "orim.ouf@gmail.com";
const toEmail = "orim.ouf@gmail.com";//"Luxels.co@gmail.com";
const pageUrl = "https://www.hermes.com/fr/fr/category/femme/sacs-et-petite-maroquinerie/sacs-et-pochettes/#|";//'https://www.google.com/';
const hermesData = '';
const msgSendArray = [];

app.set('port', (process.env.PORT || 8000));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Home
app.get('/', function (req, res) {
	res.send('Hello world!');
});
// Start the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'));
});

async function getDataFromSite(page) {
    console.log("page open ...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Geting Data ...");
    const newUrlsProductArray = await page.evaluate(() => {

        hermesData = JSON.parse(document.querySelector('script[id="hermes-state"]').innerHTML)
        const productsData = hermesData[524967196].b
        const quantity = productsData.total
        const productsArray = productsData.products.items
        const urlsArray = []
        
        console.log(quantity)
        console.log(productsArray)

        const searchArray = ["24/24", "Constance to go", "Constance to go cavale", "Evelyne 16", "Herbag 20", "Herbag 31"
            , "Kelly to go", "Lindy", "Medor", "Medor 23", "Picotin 18", "Picotin pocket"];//, "Étrivière" "horseback", 
          
          productsArray.map((product, index) => {
            const paragraph = product.title.toLowerCase();
            searchArray.map( word => {
              const found = paragraph.match(word.toLowerCase());

              if (found !== null ) {
                
                const completUrl = "https://www.hermes.com/fr/fr"+ product.url;
                urlsArray.push(completUrl);

                console.log("data is here");
                
                } else {
                    console.log("Not found");
                }
          
            })
          })

        return urlsArray
    })
    
    console.log(newUrlsProductArray);

    const sendWhatsappMsg = (url) => {
         
            // Download the helper library from https://www.twilio.com/docs/node/install
        const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";

        // Find your Account SID and Auth Token at twilio.com/console
        // and set the environment variables. See http://twil.io/secure
        const accountSid = process.env.ACCOUNT_SID;
        const authToken = process.env.AUTH_TOKEN;
        const client = twilio(accountSid, authToken);

        async function createMessage() {
        const message = await client.messages.create({
            body: url,
            from: "whatsapp:+14155238886",
            to: "whatsapp:+213791602498",
        })

        console.log(message.body);
        }

        createMessage(); 
    }

    var Match = false
    newUrlsProductArray.map(urlMatch => {
        const found = msgSendArray.find(ele => ele === urlMatch);
console.log(found);

        if (found === undefined) {
            Match = false;
        } else {
            Match = true;
        }
    })
    

    if (Match) {
        console.log("msg already send!");
    } else if(newUrlsProductArray.lenght !== 0) {
        newUrlsProductArray.map(url => {
            msgSendArray.push(url)
            sendWhatsappMsg(url); 
        })
    } else {
        console.log("No New Product Found!");
    }

    // wait 15s to reload
    // await new Promise(resolve => setTimeout(resolve, 15000));
    // checkout();
      
} 

async function checkout() { 
     // Initiate the browser 
     const browser = await puppeteer.launch({headless: true});//{headless: false}
    try {
        // Create a new page with the default browser context 
        const page = await browser.newPage(); 
        // Go to the target website 
        await page.goto(pageUrl); 
	    // const page = await initBrowser(); 
	    await getDataFromSite(page, msgSendArray);
    } catch (e) {
        console.log("catch Error");
        console.log(e);
        // await new Promise(resolve => setTimeout(resolve, 3000));
        logMessage()
    } 
    finally {
        await browser.close();
    }
} 

const quantity = "15"
const imageUrl = "https://www.hermes.com/fr/fr/category/femme/sacs-et-petite-maroquinerie/sacs-et-pochettes/#|";//"https:" + product.assets[0].url;
  const productObject = {
    image_url: imageUrl,
    name: "Product Name",//product.title,
    price: "Product Price",//product.price,
    url: "Product Url"//completUrl
}

function sendEmail(toEmail, fromEmail, logo, productsQuantity, newProduct) {
console.log("sending Email check ...");

    request.post(
        'https://api.emailjs.com/api/v1.0/email/send',
        { json : {
            service_id: "service_bukaqyq",
            user_id: "Eow6_b5X8Og5saFTt",
            template_id: "template_81w8pyi",
            template_params: {
              to_name: toEmail,
              email: fromEmail,
              logo: logo,
              orders: newProduct,
              productsQuantity: productsQuantity
            }
          } },
        function (error, response, body) {
            console.log("Email Send : " + response.statusCode);
            
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        }
    );
}

function logMessage() {
    console.log('Cron job executed at:', new Date().toLocaleString());
    checkout();
   }

   // Schedule the cron job to run every minute
   cron.schedule('*/10 * * * * *', () => {
    logMessage();
   });

   // Schedule the cron job 30 Min to run every minute
   cron.schedule('*/30 * * * *', () => {
    console.log('Cron job 30 min executed at:', new Date().toLocaleString());
    // sending Email to EmailJS
    sendEmail(toEmail, fromEmail, logo, quantity, productObject)
   });
    // console.log(titles ); 
	// await browser.close(); 

