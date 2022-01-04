var https = require("https");
var fs = require("fs");
var querystring = require("querystring");
const { Console } = require("console");

// change this or run "node elrond-scanner.js 350"
var txCountDefault = 23000;
var txCount = parseInt(process.argv.slice(0)[2]) || txCountDefault;

console.log("Pulling " + txCount + " of txs...");

const wallet = "erd1c04typx388cmk72vz9c4g0yjefeuek5ygpk9k4tcryvaykdy9pmq4fp4nl";
var txs = [];
let queue = [];

const pageSize = 3000;
let beforeDate = null;

// wrap a request in an promise
function fetchWalletTx() {
  var params = {
    // from: itemIndex,
    size: pageSize,
    // status: "success",
    // withScResults: false,
    // withOperations: true,
    receiver: wallet,
  };
  if (beforeDate) {
    params.before = beforeDate;
  }

  var options = {
    hostname: "api.elrond.com",
    path:
      "/accounts/" + wallet + "/transactions?" + querystring.stringify(params),
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
            let set = JSON.parse(data);
            beforeDate = set[set.length - 1].timestamp;
            queue = queue.concat(set);
          } catch (err) {
            console.log("Error: " + err.message);
          }
          resolve();
        });
      })
      .on("error", (err) => {
        console.log("Error: " + err.message);
        reject(err);
      });
  });
}

// now to program the "usual" way
// all you need to do is use async functions and await
// for functions returning promises
async function myBackEndLogic() {
  try {
    for (let index = 0; index <= txCount; index = index + pageSize) {
      await fetchWalletTx();
      console.log("fetching " + pageSize + " more: " + index);
    }
  } catch (error) {
    console.error("ERROR:", error);
  }

  // elimiate duplicates
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

  fs.writeFile(
    "./output-wallet-tx-scanner-" + Date.now() + ".json",
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

  console.log("Ended up with " + txs.length + " tx");
}

// run your async function
myBackEndLogic();
