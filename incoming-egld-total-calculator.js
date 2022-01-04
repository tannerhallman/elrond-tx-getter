const incomingtx1 = require("./all-incoming-tx");

const combined = [].concat(incomingtx1.txList);
// console.log(sorted[0]);

let valTotal = 0;
const filtered = [];
for (let index = 0; index < combined.length; index++) {
  const tx = combined[index];
  try {
    // removes trailing 0's
    const preChop = tx.value.substring(0, tx.value.length - 18);
    const val = parseInt(preChop);
    if (val >= 1 && val % 1 === 0 && tx.status === 'success') {
      filtered.push(tx);
      valTotal += val;
    }
  } catch (error) {}
}

console.log("total incoming tx count: " + combined.length);
console.log(
  "total incoming tx >= 1 egld && value % 1 === 0 && status === 'success': " + filtered.length
);
console.log("total incoming egld sum: " + valTotal);
// console.log(combined[]);
