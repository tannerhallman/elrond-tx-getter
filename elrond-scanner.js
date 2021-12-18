var https = require("https");
var fs = require("fs");
var querystring = require("querystring");

var pageBuffer = 5;

// change this
var pages = 352 + pageBuffer;

var totalItems = pages * 25;

var txs = [];
const queue = [];

const expandedTxs = [];

// wrap a request in an promise
function fetchWalletTx(page) {
  var params = {
    from: page,
    size: 25,
    sender: "erd1c04typx388cmk72vz9c4g0yjefeuek5ygpk9k4tcryvaykdy9pmq4fp4nl",
    receiver: "erd1c04typx388cmk72vz9c4g0yjefeuek5ygpk9k4tcryvaykdy9pmq4fp4nl",
    condition: "should",
  };

  var options = {
    hostname: "api.elrond.com",
    path:
      "/transactions?" +
      querystring.stringify(params) +
      "&fields=nonce,txHash,receiver,receiverShard,sender,senderShard,status,timestamp,value,tokenValue,tokenIdentifier,status,operations",
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
          JSON.parse(data).forEach((item) => {
            queue.push(item);
            params.from += page;
          });
          resolve();
        });
      })
      .on("error", (err) => {
        reject(err);
        console.log("Error: " + err.message);
      });
  });
}
// wrap a request in an promise
function fetchTxThick(txHash) {
  var options = {
    hostname: "api.elrond.com",
    path: `/transactions/${txHash}`,
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
          JSON.parse(data).forEach((item) => {
            expandedTxs.push(item);
          });
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

  try {
    for (let index = 0; index < txs.length; index++) {
      const tranny = txs[index];
      await fetchTxThick(tranny.txHash);
      console.log("fetching a single tx");
    }
  } catch (error) {
    console.error("ERROR:");
    console.error(error);
  }

  // write to file

  var jsonContent = JSON.stringify(expandedTxs);

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
