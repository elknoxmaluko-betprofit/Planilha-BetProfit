let bank = 100;
let percent = 5.0;
for(let i=1; i<=22; i++) {
  let profit = bank * (percent/100);
  bank += profit;
  percent = percent * 0.975;
}
console.log("Compounded total:", bank);

let percent2 = 5.0;
let sum = 0;
for(let i=1; i<=22; i++) {
  sum += percent2;
  percent2 = percent2 * 0.975;
}
console.log("Linear total %:", sum);
