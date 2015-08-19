/**
 * Created by Turner on 6/22/2015.
 */

//global object
var usedBits = {};

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
 * @param sizeBits - The running string of numbers making the total value of the size
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