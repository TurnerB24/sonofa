/**
 * Created by Turner on 6/18/2015.
 */
var array = new Uint8Array(2);
var bin = "01101010";
var num = parseInt(bin, 2);
console.log(num);
array[0] = num;
array[1] = 21;
console.log(array[0]);
console.log(array[1]);