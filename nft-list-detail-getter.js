var https = require("https");
var fs = require("fs");
var querystring = require("querystring");
const { Console } = require("console");

var pageBuffer = 5;

// change this or run "node nft-list-detail-getter.js 350"
var pageDefault = 8000;
var pageSize = 1;
var blockchainExplorerPages = parseInt(process.argv.slice(0)[2]) || pageDefault;

var pages = blockchainExplorerPages + pageBuffer;
console.log("Pulling " + pages + " pages (added a buffer of 5) of nfts...");

var totalItems = pages * pageSize;

var nfts = [];

function decimalToHex(d, padding = 2) {
  var hex = Number(d).toString(16);
  while (hex.length < padding && hex.length <= 3) {
    hex = "0" + hex;
  }

  return hex;
}

function formatParams(numberr) {
  const numString = decimalToHex(numberr, 2);
  var options = {
    hostname: "api.elrond.com",
    path: "/nfts/MANY-39af2c-" + numString,
    method: "GET",
  };
  return options;
}
// wrap a request in an promise
function fetchNFT(currentNumber) {
  const options = formatParams(currentNumber);
  console.log(options.path);
  return;
  // return new Promise((resolve, reject) => {
  //   https
  //     .get(options, (resp) => {
  //       console.log("fetcing " + JSON.stringify(options));
  //       let data = "";

  //       // A chunk of data has been received.
  //       resp.on("data", (chunk) => {
  //         data += chunk;
  //       });

  //       // The whole response has been received. Print out the result.
  //       resp.on("end", () => {
  //         try {
  //           nfts.push(JSON.parse(data));
  //         } catch {}
  //         resolve();
  //       });
  //     })
  //     .on("error", (err) => {
  //       reject(err);
  //       console.log("Error: " + err.message);
  //     });
  // });
}

// now to program the "usual" way
// all you need to do is use async functions and await
// for functions returning promises
async function myBackEndLogic() {
  try {
    for (let index = 1; index <= totalItems; index++) {
      await fetchNFT(index);

      console.log("fetching more: " + index);
    }
  } catch (error) {
    console.error("ERROR:");
    console.error(error);
  }

  // write to

  var jsonContent = JSON.stringify(nfts);

  fs.writeFile(
    "./output-nft-list-detail" + Date.now() + ".json",
    jsonContent,
    "utf8",
    function (err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }

      console.log("JSON file has been saved.");
    }
  );

  console.log("Ended up with " + nfts.length + " nfts");
}

// run your async function
myBackEndLogic();
