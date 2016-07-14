var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: true })
var urlPart0 = "https://go.xero.com/AccountsReceivable/Search.aspx?invoiceStatus=INVOICESTATUS%2fAUTHORISED&";
var n = 65; // Row you want to start with 
var selector;


  
// LOGIN INTO XERO  

nightmare
.goto("https://login.xero.com")
.type('form[action*="/"] [name="userName"]', 'XXXXX') // THE "authentication" METHOD DIDNT WORK FOR ME SO IM USING THE TYPE METHOD
.type('form[action*="/"] [name="password"]', 'XXXXX')
  .click('form[action*="/"] [type=submit]')
  .wait('#Accounts') // WAIT FOR THE MAIN PAGE TO SHOW UP AND THEN IF SUCCESSFUL START CHECKING THE INVOICES    
.then(function(text) {
   console.log(text);
   checkInvoice();
  })
  .catch(function (error) {
    console.error('Search failed:', error);
  })

function checkInvoice()
{
    
    selector = "#row"+n+" td:nth-child(1) input"; // THIS IS THE SELECTOR THAT CONTAINS THE LINK TO THE INVOICES

  nightmare
  .goto(urlPart0+'graphSearch=False&dateWithin=any&unsentOnly=False&page=2&PageSize=200&orderBy=InvoiceDate&direction=DESC') // LINK TO SHOW PAGE 2 OF THE MAX NUMBER OF INVOICES 
  .wait('table.standard') // WAIT FOR THE TABLE THAT CONTAINS LINKS TO THE INVOICES TO LOAD
  .wait('#row'+n+' td:nth-child(1)') // WAIT UNTIL THE INVOICE LINK HAS LOADED
 .evaluate(function (selector) {
    return document.querySelector(selector).nodeName; // CHECK IF THIS IS THE INVOICE TYPE WE ARE LOOKING FOR. IT SHOULD HAVE IN THE FIRST COL AN RADIO BUTTON INSTEAD OF AN IMAGE
   }, selector)
  .then(function(text) {
   console.log("Voiding Row: " + n); // IF IT IS A RADIO BUTTON GO AHEAD AND START THE VOIDING PROCESS
   voidIt();
  })
  .catch(function (error) {
    console.log("Nothing to void on Row: " + n); 
    n++;
    checkInvoice(); // IF THERE IS AN IMAGE CHECK NEXT ROW
  })
}

  function voidIt(){
console.log("voiding..."); 

nightmare
.wait(selector) // MAKING SURE THAT THE ROW WITH THE INVOICE LINK IS STILL THERE
  .click('#row'+n+' td:nth-child(2)') // CLICK THE SECOND CELL
.wait("#ext-gen32 :nth-child(3) a") //  WAIT FOR THE DROP DOWN WITH THE VOID LINK TO LOAD, !!!WARNING!!! SOMETIMES THE VOID LINK IS THE SECOND CHILD INSTEAD OF THE 3RD OR IT'S NOT THERE AT ALL. -> TODO CHECK IF THE VOID LINK IS IN THE RIGHT POSITION 
  .click("#ext-gen32 :nth-child(3) a") // CLICK VOID LINK
  .wait("#ext-gen83") // CHECK THAT YES OR NO OVERLAY WINDOW HAS APPEARED
  .click("#ext-gen83") // CLICK THE YES BUTTON
  .wait("#ext-gen1037") // CHECK THAT THE INOVICE HAS BEEN VOIDED BY CHECKING THE VOID CONFIRMATION ON THE NEW PAGE
  .back() // GO BACK TO THE INVOICE
  .wait("#ext-gen21") // WAIT UNTIL THE VOIDED TAG IS PRESENT ON THE INVOICE PAGE
  .back() // GO BACK TO THE INVOICES LIST
  .wait('table.standard') // CHECK IF THE INVOICE LIST HAS LOADED 
  .wait('#row'+n+' td:nth-child(1)') // THE PREVIOUS INVOICE SHOULDN"T BE THERE ANYMORE WHICH MEANS THAT THE NEXT INVOICE SHOULD BE IN THE SAME ROW 
  .then(function(result) {
    console.log(result);
   console.log("Moving to next row");
   checkInvoice(); // CHECK NEXT ROW BEFORE VOIDING
  }) 
  .catch(function (error) {
    console.log("Issue enquntered while Voiding : " + n);
    console.error('Search failed:'+n, error); // IF IT CAN'T BE FOUND IT MEANS THAT THERE IS SOMETHING WRONG AND WE MOVE TO THE NEXT ROW
    n++;
    checkInvoice();
  })
  }