/**
 * Created by Turner on 5/25/2015.
 */

/**
 * MASTER FUNCTION
 *
 * This is generally the only function actually called in usage. Using a case-break it organizes the incoming object
 * into one of 4 data types before further categorizing or parsing the data.
 *
 * @param object - Data to be encoded for transmission
 * @returns bundle - Encoded data packet for transmission. (Presently a string, will be int8Array when finished)
 */
function encodeToSONOFA(object, delayArrayIntegration) {
    //console.log("#starting to encode an object");
    var bundle = "";
    var objectType = typeof object;
    switch (objectType) {
        case "string" :
            //console.log("#object is a string");
            bundle = "000";
            bundle = encodeString(object, bundle);
            break;
        case "number" :                         //tested : WORKS
            //console.log("#object is a number");
            bundle = "001";
            if (object % 1 === 0) {
                bundle += "0";
                bundle = encodeInt(object, bundle);
            } else {
                bundle += "1";
                bundle = encodeDec(object, bundle);
            }
            break;
        case "object" :
            if (object === null) {               //tested : WORKS
                //console.log("#object is null");
                //fill in with 1's until the last slot is a 0
                bundle += "11111110";
            } else {
                //console.log("#object is an object");
                bundle = "01";
                if (object instanceof Array) {  //Arrays return typeof as an object, so we further classify them here
                    bundle += "1";
                } else {
                    bundle += "0";
                }
                bundle = encodeObject(object, bundle);
                for (var prop in object) {
                    bundle += encodeToSONOFA(object[prop], true);
                }
            }
            break;
        case "boolean" :            //tested : WORKS
            //console.log("#object is a boolean");
            bundle = "111";
            if (object) {
                //fill in with all 1's
                bundle += "11111";
            } else {
                //fill in with 1's until the last slot is a 0
                bundle += "11110";
            }
           break;
        default :
            //console.log("#!!#The data entered is a " + object);
    }
    logBundle(bundle);
    if (delayArrayIntegration) {
        return bundle;
    } else {
        return toInt8Array(bundle);
    }
}

/**
 * Used to encode integer numeric values.
 *
 * @param obj - Integer being encoded
 * @param bundle - Data packet started in master function, data is appended here
 * @returns bundle - Returns complete data packet
 */
//tested : WORKS
function encodeInt(obj, bundle) {
    //insert buffer
    var stream = prependNumericBuffer(obj, bundle);
    bundle = appendSize(stream, bundle);
    //console.log("#first byte finished");
    bundle = appendBody(stream, bundle);
    bundle = appendTail(stream, bundle);
    return bundle;
}

/**
 * Used to encode decimal numeric values.
 *
 * @param obj - Decimal being encoded
 * @param bundle - Data packet started in master function, data is appended here
 * @returns bundle - Returns complete data packet
 */
function encodeDec(obj, bundle) {
    //find exponent required to eliminate all decimals
    var exp = 0;
    do {
        var newObj= obj * Math.pow(10, exp);
        exp++;
    } while (newObj % 1 != 0);
    exp--;
    obj = newObj;
    //console.log("Exponent is " + exp);
    //insert buffer
    var stream = prependNumericBuffer(obj, bundle);
    bundle = appendSize(stream, bundle);
    //console.log("#first byte finished");
    bundle = exponentByte(exp, bundle);
    bundle = appendBody(stream, bundle);
    bundle = appendTail(stream, bundle);
    return bundle;
}

/**
 * Used to encode objects. Recursively encodes all properties within the object as well.
 *
 * @param obj - Object being encoded
 * @param bundle - Data packet started in master function, data is appended here
 * @returns bundle - Returns complete data packet. For this, packet contains object encoding, followed by
 * all properties within, encoded properly and appended to be returned as one large block
 */
function encodeObject(obj, bundle) {
    //find out how many elements there are in the object or array
    var elementCount = objSize(obj);
    var binNum = elementCount.toString(2);
    //insert buffer
    var stream = prependDataBuffer(binNum);
    bundle = appendSize(stream, bundle);
    //console.log("#first byte finished")
    bundle = appendBody(stream, bundle);
    bundle = appendTail(stream, bundle);
    return bundle;
}

/**
 * Used to encode strings.
 *
 * @param obj - String to be encoded
 * @param bundle - Data packet started in master function, data is appended here
 * @returns bundle - Returns complete data packet. For this, packet contains string declaration and sizing in the
 * primary byte(s), followed by one character of the string per byte.
 */
function encodeString(obj, bundle) {
    var stream = serializeString(obj);
    //encode size into the first byte
    bundle = appendSize(stream, bundle);
    //append stream
    bundle = appendBody(stream, bundle);
    bundle = appendTail(stream, bundle);
    logBundle(bundle);
    return bundle;
}

/**
 * Converts each character of the string to the binary encoding. Then forces each encoding to occupy 7 bits. This is
 * inherently safe and will not exclude data because we only use ASCII values, which occupy 7 or less significant bits.
 *
 * @param string - String to be serialized. Each character within the string is processed individually and appended
 * onto the running stream of bits
 * @returns binArray - Full stream of serialized, encoded charcters of the strings
 */
function serializeString(string) {
    var numArray = toUTF8Array(string);
    var binArray = "";
    for (var i = 0; i < numArray.length; i++) {
        binArray += coerceLength((numArray[i].toString(2)), 7);
    }
    //console.log(binArray);
    return binArray;
}

/**
 * Forces an encoded character ot occupy the required bits.
 *
 * @param char - character to be encoded
 * @param length - length required
 * @returns char - returns the same chunk of data from before, now left-filled with 0's
 */
function coerceLength(char, length) {
    while(char.length < length) {
        char = "0" + char;
    }
    return char;
}

/**
 * Adds the buffer to the encoded size of a data packet
 *
 * Example result : decimal number needs 16 bytes
 * 00111000 | 00010000
 *
 * @param data - number of bytes needed formatted in binary, passed in as a string (e.g 5 bytes comes in as "101")
 * @param bundle - Existing data packet to be transmitted. Used in the next function to see how many spaces exist for
 * inserting encoded size into
 * @returns {string} - returns the buffer followed by the size so that it evenly occupies bytes.
 */
//tested : WORKS
function prependSizeBuffer(data, bundle) {
        //console.log("so we're headed to the size part");
        return findSizeBuffer(data.length, bundle) + data;
}

/**
 * Adds the buffer to the encoded content of the data packet
 *
 * Example result : value is 15 (1111)
 * 00001111
 *
 * @param data - number of bytes needed formatted in binary, passed in as a string (e.g 5 bytes comes in as "101")
 * @returns {string} - returns the buffer followed by the size so that it evenly occupies bytes.
 */
function prependDataBuffer(data) {
    return findDataBuffer(data.length) + data;
}

function prependNumericBuffer(data) {
    var fullBinNum = encodeWithSign(data);
    if (data < 0) {
        data *= -1;
    }
    var shortBinNum = data.toString(2);
    var binNumlength = shortBinNum.length;
    var spaces = 7;
    while (binNumlength >= spaces) {
        spaces += 7;
    }
    var buffer = "";
    for (var i = 0; i < spaces - binNumlength; i++) {
        buffer += fullBinNum[0]; //left fill the sign in
    }
    var convertedData = "";
    for (var j = 32 - binNumlength; j < 32; j++) {
        convertedData += fullBinNum[j];
    }
    return buffer + convertedData;
}

/**
 * Finds how many bits we need to have before significant data so that the binary size evenly occupies bytes
 *
 * @param dataSize - The length of the binary number of bytes needed
 * @param bundle - The existing packet of data
 * @returns buffer - The string of 0's to be prepended to the binary size
 */
//tested : WORKS
function findSizeBuffer(dataSize, bundle) {
    var spaces = (8 - bundle.length) - 1;
    while (dataSize > spaces) {
        spaces += 7;        //7 because the first bit in every byte is a continuation bit
    }
    var bufferCount = spaces - dataSize;
    var buffer = "";
    for (var i = 0; i < bufferCount; i++) {
        buffer += "0";
    }
    return buffer;
}

/**
 * Finds how many bits we need to have before significant data so that the content evenly occupies bytes
 *
 * @param dataSize - The size of the fully encoded data
 * @returns buffer - The string of 0's to be prepended to the binary size
 */
function findDataBuffer(dataSize) {
    //console.log("Prepending data buff. Data size is " + dataSize);
    var spaces = 7;
    while (dataSize > spaces) {
        spaces += 7;        //7 because the first bit in every byte is a continuation bit
    }
    //console.log(spaces + " spaces needed.");
    var bufferCount = spaces - dataSize;
    var buffer = "";
    for (var i = 0; i < bufferCount; i++) {
        buffer += "0";
    }
    //console.log("Buffer of size " + buffer.length);
    return buffer;
}

/**
 * Finds and appends the size of the content to the existing data packet
 *
 * @param stream - the content to be appended later, here used for sizing
 * @param bundle - The existing data packet
 * @returns bundle - The existing data packet, now with content size appended
 */
//tested : WORKS
function appendSize(stream, bundle) {
    //finish off the first byte with the size and add any more bytes we need to contain bin size number
    var firstByteSpaces = 8 - bundle.length;
    //binary of the above, with a size that will fit when we insert it below
    var bytesNeeded = int(stream.length / 7);
    var binSize = prependSizeBuffer(bytesNeeded.toString(2), bundle);
    console.log("The size of the data is " + bytesNeeded + " bytes long.");
    console.log("That size, in binary, is the following: " + binSize);
    if (bytesNeeded > (Math.pow(2, firstByteSpaces) - 1)) {
        bundle += "1";
    } else {
        bundle += "0";
    }
    for (var i = 0; i < firstByteSpaces - 1; i++) {
        bundle += binSize[i];
    }
    var spot = firstByteSpaces - 1;
    while (spot < binSize.length - 7) {
        bundle +="1";
        for (var j = 0; j < 7; j++) {
            bundle += binSize[spot];
            spot++;
        }
    } if (spot < binSize.length) {
        bundle += "0";
        for (var k = spot; k < binSize.length; k++) {
            bundle += binSize[k];
        }
    }
    return bundle;
}

/**
 * Encodes the bytes containing exponent value into decimal number encoding
 *
 * @param exp - The value of the exponent in base 10
 * @param bundle - The existing data packet
 * @returns bundle - The data packet now with the exponent byte appended
 */
//tested : WORKS
function exponentByte(exp, bundle) {
    var binExp = exp.toString(2);
    binExp = prependDataBuffer(binExp);
    bundle += "1" + binExp;
    return bundle;
}
/**
 * Creates and adds the body of the bundle
 *
 * @param stream - Full data stream (buffer included) to be transmitted
 * @param bundle - The packet we are writing to
 * @returns {*}
 */
//tested : WORKS
function appendBody(stream, bundle) {
    //create new bytes of data
    var bytes = int(stream.length) / 7;  //find how many bytes we need
    //Fill all but the last new bytes
    //If there is only one byte to be filled/finished, this will exit doing nothing
    if (bytes > 1) {
        //console.log("#appending body bytes");
        for (var byte = 0; byte < (bytes - 1); byte++) {
            bundle += "1";              //Continuation bits for all but the last byte
            for (var place = 0; place < 7; place++) {
                var spot = ((byte * 7) + place);
                bundle += stream[spot];
            }
        }
    } else {
        //console.log("#packet not long enough to warrant appendBody function");
    }
    return bundle;
}

/**
 * Creates and appends the last byte of the data packet
 *
 * @param stream - The content to be appended
 * @param bundle - The existing data packet
 * @returns bundle - The existing data packet, now complete with the final byte
 */
//tested : WORKS
function appendTail(stream, bundle) {
    var bytes = int(stream.length / 7);
    if (bytes > 0) {
        bundle += "0";                //Continuation bit set to false, this is last byte
        //Finish off the last bits of numerical data
        //console.log("#appending tail byte");
        for (var bit = 1; bit < 8; bit++) {
            var spot = (((bytes - 1) * 8) - bytes) + bit;
            bundle += stream[spot];
        }
    } else {
        bundle += "0";
        //console.log("#appending tail byte");
        for (var i = 0; i < 7; i++) {
            bundle += stream[i];
        }
    }
    return bundle;
}

/**
 * Returns only the integer of num, always rounding toward 0. Works with negatives
 *
 * @param num - Number to be rounded-down
 * @returns {number} - The integer of the given number
 */
//tested : WORKS
function int(num) {
    return num | 0;
}

/**
 * Finds the number of elements in an object or array
 *
 * @param obj - Object we're finding the number of properties of
 * @returns size - The number of properties the given object contains
 */
//tested : WORKS
function objSize(obj) {
    var size = 0;
    for (var prop in obj) {
        size++;
    }
    //console.log("#object has " + size + " elements");
    return size;
}

/**
 * Logs the current data packet to the console. Useful only for debugging.
 *
 * @param bundle - Data to be logged
 */
//tested : WORKS
function logBundle(bundle) {
    var bitStream = "";
    for (var i = 0; i < bundle.length / 8; i++) {
        bitStream += "|";
        for (var j = 0; j < 8; j++) {
            bitStream += bundle[i*8 + j];
        }
    }
    console.log("The bundle so far is " + bitStream);
}
/**
 * Encodes a given string in UTF8 and stores the values in an array
 *
 * @param str - String to be encoded
 * @returns utf8 - Array of values of UTF8 encoded characters
 */
// created by Joni, implied permission given as posted publicly : http://stackoverflow.com/a/18729931
//tested : WORKS
function toUTF8Array(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12),
                0x80 | ((charcode>>6) & 0x3f),
                0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                | (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >>18),
                0x80 | ((charcode>>12) & 0x3f),
                0x80 | ((charcode>>6) & 0x3f),
                0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
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
 * Packages the bundle into a UInt8Array
 *
 * @param bundle - The data to be packaged
 * @returns array - The data, packaged in the UInt8Array
 */
function toInt8Array (bundle) {
    var bytes = bundle.length / 8;
    var array = new Int8Array(bytes);
    for (var i = 0; i < bytes; i++) {
        var bin = "";
        for (var j = 0; j < 8; j++) {
            bin += bundle[(i * 8) + j];
        }
        array[i] = parseInt(bin, 2);
    }
    return array;
}

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

// INT TESTING : WORKS
/**
var actual0 = 0;
console.log("0 edge case results in ");
console.log(encodeToSONOFA(actual0));
var number0 = 5;
console.log("Value 5 results in ");
console.log(encodeToSONOFA(number0));
var number1 = -5;
console.log("Value -5 results in ");
console.log(encodeToSONOFA(number1));
var number2 = 15;
console.log("value 15 results in ");
console.log(encodeToSONOFA(number2));
var number3 = 127;
console.log("value 127 results in ");
console.log(encodeToSONOFA(number3));
var number4 = -128;
console.log("value -128 results in ");
console.log(encodeToSONOFA(number4));
var number5 = 2345;
console.log("2345 results in ");
console.log(encodeToSONOFA(number5));
var number6 = 320617503;
console.log("320617503 results in  ");
console.log(encodeToSONOFA(number6));
var number7 = 2147483647;
console.log("2147483647 (max value) results in ");
console.log(encodeToSONOFA(number7));
var number8 = -2147483648;
console.log("-2147483648 (min value) results in ");
console.log(encodeToSONOFA(number8));
**/

// DECIMAL TESTING : WORKS
///**
var dec1 = 1.5;
console.log("1.5 results in ");
console.log(encodeToSONOFA(dec1));
var negDec1 = -1.5;
console.log("-1.5 results in ");
console.log(encodeToSONOFA(negDec1));
var dec2 = 3.14;
console.log("3.14 results in ");
console.log(encodeToSONOFA(dec2));
var negDec2 = -3.14;
console.log("-3.14 results in ");
console.log(encodeToSONOFA(negDec2));
var dec3 = .2147483647;
console.log(".2147483647 results in ");
console.log(encodeToSONOFA(dec3));
var negDec3 = -.2147483648;
console.log("-.2147483648 results in ");
console.log(encodeToSONOFA(negDec3));
//**/

// OBJECT TESTING : WORKS
/**
var object = {
    prop1 : 5,
    prop2 : 1.5,
    prop3 : 256,
    prop4 : .314,
    prop5 : "test1234"
};
console.log("Object encodes to ");
console.log(encodeToSONOFA(object));
**/

// ARRAY TESTING
/**
var array0 = Array;
array0 = [1, 2,];
console.log(encodeToSONOFA(array0));
var array1 = Array;
array1 = ['a', 'abc', 'string', true, false];
console.log(encodeToSONOFA(array1));
**/

//BOOLEAN TESTING : WORKS
/**
var bool = true;
console.log("True encodes to ");
console.log(encodeToSONOFA(bool));
bool = false;
console.log("False encodes to ");
console.log(encodeToSONOFA(bool));
bool = null;
console.log("Null encodes to ");
console.log(encodeToSONOFA(bool));
**/

//STRING TESTING : IN PROGRESS
/**
var string1 = "a";
var string2 = "abc";
var string3 = "test string";
var string4 = "How does the algorithm handle very long string? Hopefully fairly well!";
var string5 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP"; //42 chars
var string6 = "xTZWykz0tnLmbHCewf0nZ0ecaf8uywvWSk55UP8sXDXNUOXxO5ECzU06My1s4FbOFT9cRlbPYzJDxMd7Og5pFYia486A8rx4XGsrvuclg5vwho0kxGxDZ4yfZBEKOd"; // 126 chars
console.log("string1: \'" + string1 + "\' is " + string1.length + " characters long and encodes to: ");
console.log(encodeToSONOFA(string1));
console.log("string2: \'" + string2 + "\' is " + string2.length + " characters long and encodes to: ");
console.log(encodeToSONOFA(string2));
console.log("string3: \'" + string3 + "\' is " + string3.length + " characters long and encodes to: ");
console.log(encodeToSONOFA(string3));
console.log("string4: \'" + string4 + "\' is " + string4.length + " characters long and encodes to: ");
console.log(encodeToSONOFA(string4));
console.log("string5: \'" + string5 + "\' is " + string5.length + " characters long and encodes to: ");
console.log(encodeToSONOFA(string5));
console.log("string6: \'" + string6 + "\' is " + string6.length + " characters long and encodes to: ");
console.log(encodeToSONOFA(string6));
**/