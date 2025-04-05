'use strict';
const request = require('request');
const puppeteer = require('puppeteer'); 

const pageUrl = "https://www.hermes.com/fr/fr/category/femme/sacs-et-petite-maroquinerie/sacs-et-pochettes/#|";//'https://www.google.com/';
const hermesData = '';

async function getDataFromSite(page) {
    console.log("page open ...");
    await new Promise(resolve => setTimeout(resolve, 10000));
    console.log("Geting Data ...");
    const newUrlsProductArray = await page.evaluate(() => {

        hermesData = JSON.parse(document.querySelector('script[id="hermes-state"]').innerHTML)
        const productsData = hermesData[524967196].b
        const quantity = productsData.total
        const productsArray = productsData.products.items
        const urlsArray = []
        console.log(quantity)
        console.log(productsArray)

        const searchArray = ["Arçon", "24/24", "Constance to go", "Constance to go cavale", "Evelyne 16", "Herbag 20", "Herbag 31"
            , "Kelly to go", "Lindy", "Medor", "Medor 23", "Picotin 18", "Picotin pocket"];//, "Étrivière"
          
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
        });

        console.log(message.body);
        }

        createMessage();
    }

    newUrlsProductArray.map(url => {
        sendWhatsappMsg(url); 
    })

    // wait 15s to reload
    await new Promise(resolve => setTimeout(resolve, 15000));
    checkout();
      
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
	    await getDataFromSite(page);
    } catch (e) {
        console.log("catch Error");
        console.log(e);
        await new Promise(resolve => setTimeout(resolve, 3000));
        checkout()
    } 
    finally {
        await browser.close();
    }
} 
checkout();
    // console.log(titles ); 
	// await browser.close(); 

