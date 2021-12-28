var https = require("https");
var fs = require("fs");
var querystring = require("querystring");
const { Console } = require("console");

var pageBuffer = 5;

// change this or run "node elrond-scanner.js 350"
var pageDefault = 8000;
var pageSize = 1;
var blockchainExplorerPages = parseInt(process.argv.slice(0)[2]) || pageDefault;

var pages = blockchainExplorerPages + pageBuffer;
console.log("Pulling " + pages + " pages (added a buffer of 5) of nfts...");

var totalItems = pages * pageSize;

var nfts = [];

function formatParams(numberr) {
  const numString =
    numberr.toString(16).length == 1 ? "0" + numberr.toString(16) : numberr;
  var options = {
    hostname: "api.elrond.com",
    path: "/nfts/MANY-39af2c-" + numString,
    method: "GET",
  };
  return options;
}
// wrap a request in an promise
function fetchWalletTx(currentNumber) {
  const options = formatParams(currentNumber);
  console.log(options.path);
  return new Promise((resolve, reject) => {
    https
      .get(options, (resp) => {
        console.log("fetcing " + JSON.stringify(options));
        let data = "";

        // A chunk of data has been received.
        resp.on("data", (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          try {
            nfts.push(JSON.parse(data));
          } catch {}
          resolve();
        });
      })
      .on("error", (err) => {
        reject(err);
        console.log("Error: " + err.message);
      });
  });
}

// now to program the "usual" way
// all you need to do is use async functions and await
// for functions returning promises
async function myBackEndLogic() {
  try {
    for (let index = 0; index < totalItems; index++) {
      await fetchWalletTx(index);

      console.log("fetching more:");
    }
  } catch (error) {
    console.error("ERROR:");
    console.error(error);
  }

  // write to

  var jsonContent = JSON.stringify(nfts);

  fs.writeFile("./nfts-list.json", jsonContent, "utf8", function (err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }

    console.log("JSON file has been saved.");
  });

  console.log("Ended up with " + nfts.length + " nfts");
}

// run your async function
myBackEndLogic();
