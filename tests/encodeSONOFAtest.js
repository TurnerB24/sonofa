/**
 * TESTING SECTION
 * ===============
 *
 * Tests are divided by data type. Results are printed to console log, seen in browser.
 *
 * To run a test, comment out the block-commenting markers with //
 * To not run a test, delete the // before the block-commenting markers
 *
 * Results will appear in the console as a string. The string will contain a (typically large) binary number. The
 * number is set to fit evenly into octets, though no parser yet exists for automatically interpreting the data
 * returned by the tests, so this must be done by hand.
 *
 * Verifying results can be difficult. I find it easiest to copy the results into a text-editor and start at the end
 * of the string. Then, count backwards 7 bits using your arrow keys and erase the next bit, replacing it with something
 * to mark the end of a byte, like  | , * or a space. Values then may be converted in the appropriate manner.
 *
 * For converting from binary to decimal values, I use this website
 * http://www.mathsisfun.com/binary-decimal-hexadecimal-converter.html
 * It can handle large numbers in both binary and decimal, and can be formatted in several set-ups, such as signed and
 * unsigned.
 *
 * If you encounter any issues or have any questions not answered here, please reach me at turner@3lex.co
 */

// TEST METHOD
function encodeAndCompareSONOFA(obj) {
    var sonofa = encodeToSONOFA(obj);
    var sonofaLen = sonofa.length;
    var jsonLen = JSON.stringify(obj).length;
    if(sonofaLen <= jsonLen)
        console.info('SONOFA: '+sonofaLen+' vs. JSON: '+jsonLen);
    else 
        console.warn('SONOFA: '+sonofaLen+' vs. JSON: '+jsonLen);
    return sonofa;
}

// INTEGER TESTING : WORKS
console.info(">>Integer Testing");
var actual0 = 0;
console.log("0 edge case results in ");
console.log(encodeAndCompareSONOFA(actual0));
var number0 = 5;
console.log("Value 5 results in ");
console.log(encodeAndCompareSONOFA(number0));
var number1 = -5;
console.log("Value -5 results in ");
var number2 = 15;
console.log("value 15 results in ");
console.log(encodeAndCompareSONOFA(number2));
var number3 = 127;
console.log("value 127 results in ");
console.log(encodeAndCompareSONOFA(number3));
var number4 = -128;
console.log("value -128 results in ");
console.log(encodeAndCompareSONOFA(number4));
var number5 = 2345;
console.log("value 2345 results in ");
console.log(encodeAndCompareSONOFA(number5));
var number6 = 320617503;
console.log("value 320617503 results in  ");
console.log(encodeAndCompareSONOFA(number6));
var number7 = 2147483647;
console.log("value 2147483647 (max value) results in ");
console.log(encodeAndCompareSONOFA(number7));
var number8 = -2147483648;
console.log("value -2147483648 (min value) results in ");
console.log(encodeAndCompareSONOFA(number8));
//**/

// DECIMAL TESTING : WORKS
//**
console.info(">>Decimal Testing");
var dec1 = 1.5;
console.log("value 1.5 results in ");
console.log(encodeAndCompareSONOFA(dec1));
var negDec1 = -1.5;
console.log("value -1.5 results in ");
console.log(encodeAndCompareSONOFA(negDec1));
var dec2 = 3.14;
console.log("value 3.14 results in ");
console.log(encodeAndCompareSONOFA(dec2));
var negDec2 = -3.14;
console.log("value -3.14 results in ");
console.log(encodeAndCompareSONOFA(negDec2));
var dec3 = .2147483647;
console.log("value .2147483647 results in ");
console.log(encodeAndCompareSONOFA(dec3));
var negDec3 = -.2147483648;
console.log("value -.2147483648 results in ");
console.log(encodeAndCompareSONOFA(negDec3));
//**/

//STRING TESTING : WORKS
//**
console.info(">>String Testing");
var string1 = "a";
var string2 = "abc";
var string3 = "test string";
var string4 = "How does the algorithm handle very long string? Hopefully fairly well!";
var string5 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP"; //42 chars
var string6 = "xTZWykz0tnLmbHCewf0nZ0ecaf8uywvWSk55UP8sXDXNUOXxO5ECzU06My1s4FbOFT9cRlbPYzJDxMd7Og5pFYia486A8rx4XGsrvuclg5vwho0kxGxDZ4yfZBEKOd"; // 126 chars
var string7 = "xTZWykz0tnLmbHCewf0nZ0ecaf8uywvWSk55UP8sXDXNUOXxO5ECzU06My1s4FbOFT9cRlbPYzJDxMd7Og5pFYia486A8rx4XGsrvuclg5vwho0kxGxDZ4yfZBEKOdog"; //128 chars
console.log("string1: \'" + string1 + "\' is " + string1.length + " characters long and encodes to: ");
console.log(encodeAndCompareSONOFA(string1));
console.log("string2: \'" + string2 + "\' is " + string2.length + " characters long and encodes to: ");
console.log(encodeAndCompareSONOFA(string2));
console.log("string3: \'" + string3 + "\' is " + string3.length + " characters long and encodes to: ");
console.log(encodeAndCompareSONOFA(string3));
console.log("string4: \'" + string4 + "\' is " + string4.length + " characters long and encodes to: ");
console.log(encodeAndCompareSONOFA(string4));
console.log("string5: \'" + string5 + "\' is " + string5.length + " characters long and encodes to: ");
console.log(encodeAndCompareSONOFA(string5));
console.log("string6: \'" + string6 + "\' is " + string6.length + " characters long and encodes to: ");
console.log(encodeAndCompareSONOFA(string6));
console.log("string7: \'" + string7 + "\' is " + string7.length + " characters long and encodes to: ");
console.log(encodeAndCompareSONOFA(string7));
console.log("NOW ENCODING AND SENDING THE SAME STRINGS TO TEST DICTIONARY");
console.log("string1: \'" + string1 + "\' is " + string1.length + " characters long and encodes to: ");
console.log(encodeAndCompareSONOFA(string1));
console.log("string2: \'" + string2 + "\' is " + string2.length + " characters long and encodes to: ");
console.log(encodeAndCompareSONOFA(string2));
console.log("string3: \'" + string3 + "\' is " + string3.length + " characters long and encodes to: ");
console.log(encodeAndCompareSONOFA(string3));
console.log("string4: \'" + string4 + "\' is " + string4.length + " characters long and encodes to: ");
console.log(encodeAndCompareSONOFA(string4));
console.log("string5: \'" + string5 + "\' is " + string5.length + " characters long and encodes to: ");
console.log(encodeAndCompareSONOFA(string5));
console.log("string6: \'" + string6 + "\' is " + string6.length + " characters long and encodes to: ");
console.log(encodeAndCompareSONOFA(string6));
console.log("string7: \'" + string7 + "\' is " + string7.length + " characters long and encodes to: ");
console.log(encodeAndCompareSONOFA(string7));
//**/

//BOOLEAN TESTING : WORKS
//**
console.info(">>Boolean Testing");
var bool = true;
console.log("True encodes to ");
console.log(encodeAndCompareSONOFA(bool));
bool = false;
console.log("False encodes to ");
console.log(encodeAndCompareSONOFA(bool));
bool = null;
console.log("Null encodes to ");
console.log(encodeAndCompareSONOFA(bool));
//**/

// ARRAY TESTING
//**
console.info(">>Array Testing");
var array0 = Array;
array0 = [1, 2,];
console.log(encodeAndCompareSONOFA(array0));
var array1 = Array;
array1 = ['a', 'abc', 'string', true, false];
console.log(encodeAndCompareSONOFA(array1));
//**/

// OBJECT TESTING : WORKS
///**
console.info(">>Object Testing");
var object0 = {
    prop1 : 5,
    prop2 : 'abcdefg',
    prop3 : "-128",
    prop4 : -128,
    prop5 : [1, 2, 5]
};
console.log(object0);
console.log("object0 encodes to ");
console.log(encodeAndCompareSONOFA(object0));
var object1 = {
    prop1 : 5,
    prop2 : 1.5,
    prop3 : 256,
    prop4 : .314,
    prop5 : "test1234"
};
console.log(object1);
console.log("object1 encodes to ");
console.log(encodeAndCompareSONOFA(object1));
//**/