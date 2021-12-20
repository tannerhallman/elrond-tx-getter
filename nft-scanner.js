var https = require("https");
var fs = require("fs");
var querystring = require("querystring");
const { Console } = require("console");

var pageBuffer = 5;

// change this or run "node elrond-scanner.js 350"
var pageDefault = 150;
var blockchainExplorerPages = parseInt(process.argv.slice(0)[2]) || pageDefault;

var pages = blockchainExplorerPages + pageBuffer;
console.log("Pulling " + pages + " pages (added a buffer of 5) of txs...");

var totalItems = pages * 25;

var txs = [];
const queue = [];

// wrap a request in an promise
function fetchWalletTx(page) {
  var params = {
    from: page,
    size: 25,
    collection: "MANY-39af2c",
    includeFlagged: true,
  };

  var options = {
    hostname: "api.elrond.com",
    path: "/nfts?" + querystring.stringify(params),
    method: "GET",
  };

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
            JSON.parse(data).forEach((item) => {
              queue.push(item);
              params.from += page;
            });
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
    for (let index = 0; index < totalItems; index = index + 25) {
      await fetchWalletTx(index);
      console.log("fetching more:");
    }
  } catch (error) {
    console.error("ERROR:");
    console.error(error);
  }

  queue.forEach((item) => {
    let found = false;

    txs.forEach((trans) => {
      if (item.txHash === trans.txHash) found = true;
    });

    if (!found) {
      txs.push(item);
    }
  });

  // write to

  var jsonContent = JSON.stringify(txs);

  fs.writeFile("./output.json", jsonContent, "utf8", function (err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }

    console.log("JSON file has been saved.");
  });

  console.log("Ended up with " + txs.length + " tx");
}

// run your async function
myBackEndLogic();
