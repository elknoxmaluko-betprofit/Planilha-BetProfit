const b1 = 100;
const e1 = b1 * 2.3107; 
const b2 = 100;
const e2 = b2 * 2.3107; 
const b3 = 150;
const e3 = b3 * 2.3107; 

console.log("e3:", e3); // 346.6

// standard nettuno banks for 5 cycles:
// commonly: 100, 100, 150, 250, 450?
const banks = [100, 100, 150, 225, 337.5]; 
for(let i=0; i<5; i++){
  let e = banks[i] * 2.3107;
  console.log("cycle", i+1, "start:", banks[i], "end:", e);
}
