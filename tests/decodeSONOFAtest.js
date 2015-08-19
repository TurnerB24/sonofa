/**
 * TESTING SECTION
 * ===============
 *
 * Tests are divided by data type. Results are printed to console log, seen in browser.
 *
 * The array values being passed to the tests are direct from the results of encoding tests
 *
 * To run a test, comment out the block-commenting markers with //
 * To not run a test, delete the // before the block-commenting markers
 *
 * Results will appear in the console as a string. The string will contain a (typically large) binary number. The
 * number is set to fit evenly into octets, though no parser yet exists for automatically interpreting the data
 * returned by the tests, so this must be done by hand.
 *
 * Verifying results can be difficult. I find it easiest to copy the results into a text-editor and start at the end
 * of the file. Then, count backwards 7 bits using your arrow keys and erase the next bit, replacing it with something
 * to mark the end of a byte, like  | , * or a space. Values then may be converted in the appropriate manner.
 *
 * For converting from binary to decimal values, I use this website
 * http://www.mathsisfun.com/binary-decimal-hexadecimal-converter.html
 * It can handle large numbers in both binary and decimal, and can be formatted in several set-ups, such as signed and
 * unsigned.
 *
 * If you encounter any issues or have any questions not answered here, please reach me at turner@3lex.co
 */

// INTEGER TESTING : WORKS
///**
console.info("Integer Testing");
var int0 = new Int8Array(2);
int0 = [33, 1];
console.log(decodeFromSONOFA(int0));
var int1 = new Int8Array(2);
int1 = [33, 5];
console.log(decodeFromSONOFA(int1));
var int2 = new Int8Array(2);
int2 = [33, 123];
console.log(decodeFromSONOFA(int2));
var int3 = new Int8Array(2);
int3 = [33, 15];
console.log(decodeFromSONOFA(int3));
var int4 = new Int8Array(3);
int4 = [34, -128, 127];
console.log(decodeFromSONOFA(int4));
var int5 = new Int8Array(3);
int5 = [34, -1, 0];
console.log(decodeFromSONOFA(int5));
var int6 = new Int8Array(3);
int6 = [34, -110, 41];
console.log(decodeFromSONOFA(int6));
var int7 = new Int8Array(6);
int7 = [37, -127, -104, -16, -8, 31];
console.log(decodeFromSONOFA(int7));
var int8 = new Int8Array(6);
int8 = [37, -121, -1, -1, -1, 127];
console.log(decodeFromSONOFA(int8));
var int9 = new Int8Array(6);
int9 = [37, -8, -128, -128, -128, 0];
console.log(decodeFromSONOFA(int9));
//**/

// DECIMAL TESTING : WORKS
///**
console.info("Decimal Testing");
var dec0 = new Int8Array(3);
dec0 = [50, -127, 15];
console.log(decodeFromSONOFA(dec0));
var negDec0 = new Int8Array(3);
negDec0 = [50, -127, 113];
console.log(decodeFromSONOFA(negDec0));
var dec1 = new Int8Array(4);
dec1 = [51, -126, -126, 58];
console.log(decodeFromSONOFA(dec1));
var negDec1 = new Int8Array(4);
negDec1 = [51, -126, -3, 70];
console.log(decodeFromSONOFA(negDec1));
var dec2 = new Int8Array(7);
dec2 = [54, -118, -121, -1, -1, -1, 127];
console.log(decodeFromSONOFA(dec2));
var negDec2 = new Int8Array(7);
negDec2 = [54, -118, -8, -128, -128, -128, 0];
console.log(decodeFromSONOFA(negDec2));
//**/

// STRING TESTING : WORKS
///**
console.info("String Testing");
var string0 = new Int8Array(2);
string0 = [1, 97];
console.log(decodeFromSONOFA(string0));
var string1 = new Int8Array(4);
string1 = [3, -31, -30, 99];
console.log(decodeFromSONOFA(string1));
var string2 = new Int8Array(12);
string2 = [11, -12, -27, -13, -12, -96, -13, -12, -14, -23, -18, 103];
console.log(decodeFromSONOFA(string2));
var string3 = new Int8Array(72);
string3 = [16, 70, -56, -17, -9, -96, -28, -17, -27, -13, -96, -12, -24
    , -27, -96, -31, -20, -25, -17, -14, -23, -12, -24, -19, -96, -24,
    -31, -18, -28, -20, -27, -96, -10, -27, -14, -7, -96, -20, -17, -18,
    -25, -96, -13, -12, -14, -23, -18, -25, -65, -96, -56, -17, -16, -27,
    -26, -11, -20, -20, -7, -96, -26, -31, -23, -14, -20, -7, -96, -9, -27,
    -20, -20, 33];
console.log(decodeFromSONOFA(string3));
var string4 = new Int8Array(44);
string4 = [16, 42, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21,
    -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6,
    -63, -62, -61, -60, -59, -58, -57, -56, -55, -54, -53, -52, -51, -50, -49, 80];
console.log(decodeFromSONOFA(string4));
var string5 = new Int8Array(129);
string5 = [16, 126, -8, -44, -38, -41, -7, -21, -6, -80, -12, -18, -52, -19, -30, -56,
    -61, -27, -9, -26, -80, -18, -38, -80, -27, -29, -31, -26, -72, -11, -7, -9, -10,
    -41, -45, -21, -75, -75, -43, -48, -72, -13, -40, -60, -40, -50, -43, -49, -40, -8,
    -49, -75, -59, -61, -6, -43, -80, -74, -51, -7, -79, -13, -76, -58, -30, -49, -58,
    -44, -71, -29, -46, -20, -30, -48, -39, -6, -54, -60, -8, -51, -28, -73, -49, -25,
    -75, -16, -58, -39, -23, -31, -76, -72, -74, -63, -72, -14, -8, -76, -40, -57, -13,
    -14, -10, -11, -29, -20, -25, -75, -10, -9, -24, -17, -80, -21, -8, -57, -8, -60,
    -38, -76, -7, -26, -38, -62, -59, -53, -49, 100];
console.log(decodeFromSONOFA(string5));
console.log(decodeFromSONOFA(string5) == "xTZWykz0tnLmbHCewf0nZ0ecaf8uywvWSk55UP8sXDXNU\
OXxO5ECzU06My1s4FbOFT9cRlbPYzJDxMd7Og5pFYia486A8rx4XGsrvuclg5vwho0kxGxDZ4yfZBEKOd");
//**/

// BOOLEAN TESTING : WORKS
///**
console.info("Boolean Testing");
var bool0 = new Int8Array(1);
bool0 = [-1];
console.log(decodeFromSONOFA(bool0));
var bool1 = new Int8Array(1);
bool1 = [-2];
console.log(decodeFromSONOFA(bool1));
//**/

// ARRAY TESTING : WORKS
///**
console.info("Array Testing");
var array0 = new Int8Array(6);
array0 = [97, 2, 33, 1, 33, 2];
console.log(decodeFromSONOFA(array0));
var array1 = new Int8Array(17);
array1 = [97, 5, 1, 97, 3, -31, -30, 99, 6, -13, -12, -14, -23, -18, 103, -1, -2];
console.log(decodeFromSONOFA(array1));
//**/

// OBJECT TESTING : IN PROGRESS
///**
console.info("Object Testing");
var obj0 = new Int8Array();
obj0 = [65, 5, 5, -16, -14, -17, -16, 49, 33, 5, 5, -16, -14, -17, -16, 50, 7, -31,
    -30, -29, -28, -27, -26, 103, 5, -16, -14, -17, -16, 51, 4, -83, -79, -78, 56, 5,
    -16, -14, -17, -16, 52, 34, -1, 0, 5, -16, -14, -17, -16, 53, 97, 3, 1, 48, 33, 1,
    1, 49, 33, 2, 1, 50, 33, 5];
console.log(decodeFromSONOFA(obj0));
var obj1 = new Int8Array();
obj1 = [65, 5, 5, -16, -14, -17, -16, 49, 33, 5, 5, -16, -14, -17, -16, 50, 50, -127,
 15, 5, -16, -14, -17, -16, 51,34, -126, 0, 5, -16, -14, -17, -16, 52, 51, -125, -126,
 58, 5, -16, -14, -17, -16, 53, 8, -12, -27, -13, -12, -79, -78, -77, 52];
console.log(decodeFromSONOFA(obj1));
//**/