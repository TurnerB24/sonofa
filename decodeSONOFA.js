/**
 * Created by Turner on 6/22/2015.
 */

//global object
var usedBits = {value: 1};

function decodeFromSONOFA (sonofaArray, obj, recursive) {
    usedBits.value = 1;
    var target;
    var arrayStr;
    if (recursive == null || recursive == false) {
        arrayStr = toBinString(sonofaArray);
    } else {
        arrayStr = sonofaArray;

    }
    //console.log(arrayStr);
    var dataType = getDataType(arrayStr);
    var size = findSize(arrayStr, dataType.length);
    var usable = isolateChunk(arrayStr, usedBits.value , size * 8);
    //console.log("Size is: " + size);
    switch (dataType) {
        case "0010" :
            //things to do with integers
            target = decodeInteger(usable, size);
            //console.log("Decoded integer is: " + target);
            break;
        case "0011" :
            //things to do with decimals
            var exponent = findExponent(arrayStr, size);
            usable = usable.substring(8, usable.length);
            size--;
            target = decodeDecimal(usable, exponent, size);
            //console.log("Decoded value is: " + target);
            break;
        case "010" :
            //things to do with objects
            //This pretty much gets handled entirely differently
            target = decodeObject(arrayStr);
            break;
        case "011" :
            //things to do with arrays
            target = decodeArray(arrayStr);
            //console.log("Decoded array is: ");
            //console.log(target);
            break;
        case "111" :
            //things to do with booleans and null values
            target = (arrayStr[7] == "1");
            break;
        case "000" :
            //things to do with strings
            target = decodeString(usable, size);
            //console.log("Decoded string is: " + target);
            break;
        default :
            console.log("The incoming data is likely corrupted. If this error persists, please contact" +
                " the administrator of this system at:\nturner@3lex.co\nPlease included a detailed account" +
                " of your usage and data for better response time");
    }

    if (obj != null) {
        obj = target;
    } else {
        return target;
    }
}

/**
 * Converts the array of decimal values to a string of binary values.
 * i.e:
 * array = [5]
 * string output = "00000101"
 *
 * @param array - The array of which the values will be converted
 * @returns string - The string of converted values in binary
 */
function toBinString(array) {
    var string = "";
    for (var element = 0; element < array.length; element++) {
        var value = array[element];
        string += reduceToSize(encodeWithSign(value), 8);
    }
    return string;
}

/**
 * Returns the preceding bits that determine data type
 *
 * @param string - The stream of bits that is to be decoded
 * @returns {string} - A string with the type bits
 */
function getDataType(string) {
    var type = "";
    for (var i = 0; i < 3; i ++) {
        type += string[i];
    }
    //some types are further categorized
    if (type == "001") {
        type += string[3];
    }
    usedBits.value += type.length;
    return type;
}

/**
 * Finds and parses the size of the incoming packet
 *
 * @param stream - Incoming packet
 * @param consumedBits - Number of bits used to set data type
 * @returns (Number) - Size of the packet, in bytes. Decimal value.
 */
//tested : WORKS
function findSize(stream, consumedBits, sizeBits) {
    //console.log(stream);
    if (stream.substring(0, 3) == "111") {
        return 0;
    }
    //process the rest of the first byte
    if (sizeBits == undefined) {
        sizeBits = stream.substring(consumedBits + 1, 8);
    } else {
        sizeBits += stream.substring(consumedBits + 1, 8);
    }
    if (stream[consumedBits] == "1") {
        usedBits.value++;
        sizeBits = findSize(stream.substring(8,stream.length), 0, sizeBits)
    }
    if (consumedBits != 0) {
        usedBits.value += sizeBits.length;
        return parseInt(sizeBits, 2);
    } else {
        return sizeBits;
    }
}

function isolateChunk(stream, used, needed) {
    //console.log("Used: " + used + " \tNeeded: " + needed);
    //console.log("Full Stream: " + stream);
    var end = needed + used;
    return stream.substring(used, end);
}
/**
 * Converts integer numbers in base 10 to base 2 as a signed 32 bit integer.
 *
 * @param nMask - Base 10 integer to be encoded
 * @returns sMask - Base 2, 32 bit signed integer
 */
//tested : WORKS
function encodeWithSign (nMask) {
    // nMask must be between -2147483648 and 2147483647
    for (var nFlag = 0, nShifted = nMask, sMask = ""; nFlag < 32;
         nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
    return sMask;
}

/**
 * Reduces a string to the specified size, counting from right to left
 *
 * @param number - Number to be reduced
 * @param size - Digits the number should occupy
 * @returns {string} - The reduced number
 */
function reduceToSize(number, size) {
    return number.substring(number.length - size, number.length);
}

function decodeInteger(stream, size) {
    //console.log("Stream: " + stream + "Size: " + size);
    var value;
    var content = "";
    for(var i = 0; i < size; i++) {
        content += stream.substring((i*8)+1, (i+1)*8);
    }
    //console.log("INTEGER CONTENT: " + content);
    if (content[0] == "1") {
        content = NOTBinString(content);
        value = -1 * (parseInt(content, 2) + 1);
    } else {
        value = parseInt(content, 2);
    }
    return value;
}

function decodeDecimal(stream, exp, size) {
    var int = decodeInteger(stream, size);
    //console.log("Integer: " + int + " Exponent: " + exp);
    return int / Math.pow(10, exp);
}

function decodeObject(fullStream) {
    obj = {};
    var size = parseInt((fullStream.substring(8, 16)), 2);
    //console.log("There are " +size + " elements");
    if (size < 0) {
        console.log("An error has occurred regrading scale of an array. Please contact the administrator of this" +
            " system at: turner@3lex.co");
        return -1;
    }
    var contained = fullStream.substring(16, fullStream.length);
    //console.log("contained = " + contained);
    for (var i = 0; i < size; i++) {
        var eleSize = findSize(contained, getDataType(contained).length);
        //console.log("This element consumes " + eleSize + " bytes");
        var curElement = contained.substring(0, eleSize * 8);
        //console.log("curElement = " + curElement);
        var propName = decodeFromSONOFA(contained, null, true);
        //console.log(propName);
        contained = contained.substring((eleSize + 1) * 8, contained.length);
        eleSize = findSize(contained, getDataType(contained).length);
        //console.log("This element consumes " + eleSize + " bytes");
        curElement = contained.substring(0, eleSize * 8);
        //console.log("curElement = " + curElement);
        var prop = decodeFromSONOFA(contained, null, true);
        //console.log(prop);
        contained = contained.substring((eleSize + 1) * 8, contained.length);
        obj[propName] = prop;
        //console.log(obj[propName]);
    }
    return obj;
}

function decodeArray(fullStream) {
    //console.log((fullStream.substring(8, 16)));
    var size = parseInt((fullStream.substring(8, 16)), 2);
    //console.log("There are " +size + " elements");
    if (size < 0) {
        console.log("An error has occurred regrading scale of an array. Please contact the administrator of this" +
            " system at: turner@3lex.co");
        return -1;
    }
    var contained = fullStream.substring(16, fullStream.length);
    //console.log("contained = " + contained);
    var content = [];
    for (var i = 0; i < size; i++) {
        var eleSize = findSize(contained, getDataType(contained).length);
        //console.log("This element consumes " + eleSize + " bytes");
        var curElement = contained.substring(0, eleSize * 8);
        //console.log("curElement = " + curElement);
        content[i] = decodeFromSONOFA(contained, null, true);
        //console.log(content[i]);
        contained = contained.substring((eleSize + 1) * 8, contained.length);
    }
    return content;
}

function decodeString(stream, size) {
    //console.log(stream);
    var usableArray = new Int8Array(size);
    for (var i = 0; i < size; i++) {
        var binStr = "";
        for (var j = 1; j < 8; j++) {
            binStr += stream[(i*8) + j];
        }
        usableArray[i] = parseInt(binStr, 2);
    }
    //console.log(usableArray);
    return Utf8ArrayToStr(usableArray);
}

function findExponent(arrayStr) {
   //console.log(arrayStr);
    var expStr = arrayStr.substring(usedBits.value + 1, usedBits.value + 8);
    //console.log(expStr);
    return parseInt(expStr, 2);
}

function NOTBinString(string) {
    var size = string.length;
    var reversed = "";
    for(var i = 0; i < size; i++) {
        if(string[i] == "1") {
            reversed += "0";
        } else {
            reversed += "1";
        }
    }
    return reversed;
}

/**
 * Converts an array of UTF8 encoded values back to characters to make up a string.
 *
 * @param array - The array of values containing UTF8 encoded characters
 * @returns out - The string made up of the decoded UTF8 values
 */
//created by Albert, general permission given http://stackoverflow.com/a/22373061
function Utf8ArrayToStr(array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while (i < len) {
        c = array[i++];
        switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
            case 12:
            case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }
    return out;
}

/**
 * Logs the current data packet to the console. Useful only for debugging.
 *
 * @param bundle - Data to be logged
 */
//tested : WORKS
function logBundle(bundle) {
    //console.log(bundle);
    var bitStream = "";
    for (var i = 0; i < bundle.length / 8; i++) {
        for (var j = 0; j < 8; j++) {
            bitStream += bundle[i*8 + j];
        }
        bitStream += "|";
    }
    //console.log("The bundle so far is " + bitStream);
}

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

// STRING TESTING : WORKS
///**
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
console.log(decodeFromSONOFA(string5) == "xTZWykz0tnLmbHCewf0nZ0ecaf8uywvWSk55UP8sXDXNU" +
    "OXxO5ECzU06My1s4FbOFT9cRlbPYzJDxMd7Og5pFYia486A8rx4XGsrvuclg5vwho0kxGxDZ4yfZBEKOd");
//**/

// DECIMAL TESTING : WORKS
///**
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

// BOOLEAN TESTING : WORKS
///**
var bool0 = new Int8Array(1);
bool0 = [-1];
console.log(decodeFromSONOFA(bool0));
var bool1 = new Int8Array(1);
bool1 = [-2];
console.log(decodeFromSONOFA(bool1));
//**/

// ARRAY TESTING : WORKS
///**
var array0 = new Int8Array(6);
array0 = [97, 2, 33, 1, 33, 2];
console.log(decodeFromSONOFA(array0));
var array1 = new Int8Array(17);
array1 = [97, 5, 1, 97, 3, -31, -30, 99, 6, -13, -12, -14, -23, -18, 103, -1, -2];
console.log(decodeFromSONOFA(array1));
//**/

// OBJECT TESTING : IN PROGRESS
///**
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