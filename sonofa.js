/**
 * Created by Turner on 5/25/2015.
 */


function encodeToSONOFA(object) {
    console.log("#starting to encode an object");
    var bundle = "";
    var objectType = typeof object;
    switch (objectType) {
        case "string" :
            console.log("#object is a string");
            bundle = "000";
            return encodeString(object, bundle);
        case "number" :                         //tested : WORKS
            console.log("#object is a number");
            bundle = "001";
            if (object % 1 === 0) {
                bundle += "0";
                return encodeInt(object, bundle);
            } else {
                bundle += "1";
                return encodeDec(object, bundle);
            }
        case "object" :
            if (object === null) {               //tested : WORKS
                console.log("#object is null");
                //fill in with 1's until the last slot is a 0
                bundle += "11111110";
            } else {
                console.log("#object is an object");
                bundle = "01";
                if (object instanceof Array) {  //Arrays return typeof as an object, so we further classify them here
                    bundle += "1";
                } else {
                    bundle += "0";
                }
                bundle = encodeObject(object, bundle);
                for (var prop in object) {
                    bundle += "|" + encodeToSONOFA(object[prop]);
                }
            }
            return bundle;
        case "boolean" :            //tested : WORKS
            console.log("#object is a boolean");
            bundle = "111";
            if (object) {
                //fill in with all 1's
                bundle += "11111";
            } else {
                //fill in with 1's until the last slot is a 0
                bundle += "11110";
            }
            return bundle;
        default :
            console.log("#!!#The data entered is a " + object);
    }
}

//tested : WORKS
function encodeInt(obj, bundle) {
    //insert buffer
    var stream = prependNumericBuffer(obj, bundle);
    bundle = appendSize(stream, bundle);
    console.log("#first byte finished");
    bundle = appendBody(stream, bundle);
    bundle = appendTail(stream, bundle);
    return bundle;
}

function encodeDec(obj, bundle) {
    var exp = 0;
    while (obj % 1 != 0) {
        obj *= 10;
        exp++;
    }
    //insert buffer
    var stream = prependNumericBuffer(obj, bundle);
    bundle = appendSize(stream, bundle);
    console.log("#first byte finished");
    bundle = exponentByte(exp, bundle);
    bundle = appendBody(stream, bundle);
    bundle = appendTail(stream, bundle);
    return bundle;
}

function encodeObject(obj, bundle) {
    //find out how many elements there are in the object or array
    var elementCount = objSize(obj);
    var binNum = elementCount.toString(2);
    //insert buffer
    var stream = prependDataBuffer(binNum, bundle);
    bundle = appendSize(stream, bundle);
    console.log("#first byte finished")
    bundle = appendBody(stream, bundle);
    bundle = appendTail(stream, bundle);
    return bundle;

}

function encodeString(obj, bundle) {
    var stream = serializeString(obj);
    //encode size into the first byte
    bundle = appendSize(stream, bundle);
    //append stream
    bundle = appendBody(stream, bundle);
    bundle = appendTail(stream, bundle);
    return bundle;
}

function serializeString(string) {
    var numArray = toUTF8Array(string);
    var binArray = "";
    for (var i = 0; i < numArray.length; i++) {
        binArray += coerceLength((numArray[i].toString(2)), 7);
    }
    return binArray;
}

function coerceLength(str, length) {
    while(str.length < length) {
        str = "0" + str;
    }
    return str;
}

//adds the buffer to the start of the data to be sent
//tested : WORKS
function prependSizeBuffer(data, bundle) {
        console.log("so we're headed to the size part");
        return findSizeBuffer(data.length, bundle) + data;
}

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

//find how many spaces we need before meaningful data to
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

function findDataBuffer(dataSize) {
    console.log("Prepending data buff. Data size is " + dataSize);
    var spaces = 7;
    while (dataSize > spaces) {
        spaces += 7;        //7 because the first bit in every byte is a continuation bit
    }
    console.log(spaces + " spaces needed.");
    var bufferCount = spaces - dataSize;
    var buffer = "";
    for (var i = 0; i < bufferCount; i++) {
        buffer += "0";
    }
    console.log("Buffer of size " + buffer.length);
    return buffer;
}

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
    var spot = firstByteSpaces;
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

function exponentByte(exp, bundle) {
    var binExp = exp.toString(2);
    binExp = prependDataBuffer(binExp, bundle);
    bundle += "1" + binExp;
    return bundle;
}

//creates and adds the body of the bundle
//tested : WORKS
//stream - full data stream (buffer included) to be transmitted
//bundle - the packet we are writing to
function appendBody(stream, bundle) {
    //create new bytes of data
    var bytes = int(stream.length) / 7;  //find how many bytes we need
    //Fill all but the last new bytes
    //If there is only one byte to be filled/finished, this will exit doing nothing
    if (bytes > 1) {
        console.log("#appending body bytes");
        for (var byte = 0; byte < (bytes - 1); byte++) {
            bundle += "1";              //Continuation bits for all but the last byte
            for (var place = 0; place < 7; place++) {
                var spot = ((byte * 7) + place);
                bundle += stream[spot];
            }
        }
    } else {
        console.log("#packet not long enough to warrant appendBody function");
    }
    return bundle;
}

//creates the last byte for hte bundle
//tested : WORKS
function appendTail(stream, bundle) {
    var bytes = int(stream.length / 7);
    if (bytes > 0) {
        bundle += "0";                //Continuation bit set to false, this is last byte
        //Finish off the last bits of numerical data
        console.log("#appending tail byte");
        for (var bit = 1; bit < 8; bit++) {
            var spot = (((bytes - 1) * 8) - bytes) + bit;
            bundle += stream[spot];
        }
    } else {
        bundle += "0";
        console.log("#appending tail byte");
        for (var i = 0; i < 7; i++) {
            bundle += stream[i];
        }
    }
    return bundle;
}

//returns only the integer of num, always rounding toward 0
//works with negatives too
//tested : WORKS
function int(num) {
    return num | 0;
}

//Finds the number of elements in an object or array
//tested : WORKS
function objSize(obj) {
    var size = 0;
    for (var prop in obj) {
        size++;
    }
    console.log("#object has " + size + " elements");
    return size;
}

//useful only for debugging
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

// created by Joni, implied permission given as posted publicly : http://stackoverflow.com/a/18729931
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

function encodeWithSign (nMask) {
    // nMask must be between -2147483648 and 2147483647
    for (var nFlag = 0, nShifted = nMask, sMask = ""; nFlag < 32;
         nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
    return sMask;
}

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


// INT TESTING : WORKS
/**
var actual0 = 0;
console.log("0 edge case results in " + encodeToSONOFA(actual0));
var number0 = 5;
console.log("Value 5 results in " + encodeToSONOFA(number0));
var number1 = -5;
console.log("Value -5 results in " + encodeToSONOFA(number1));
var number2 = 15;
console.log("value 15 results in " + encodeToSONOFA(number1));
var number3 = 2345;
console.log("Medium numbers result in " + encodeToSONOFA(number3));
var number4 = 320617503;
console.log("Large numbers result in  " + encodeToSONOFA(number2));
**/

// DECIMAL TESTING : WORKS
///**
var dec1 = 1.5;
console.log("1.5 results in " + encodeToSONOFA(dec1));
var negDec1 = -1.5;
console.log("-1.5 results in " + encodeToSONOFA(negDec1));
var dec2 = 3.14;
console.log("3.14 results in " + encodeToSONOFA(dec2));
var negDec2 = -3.14;
console.log("-2.14 results in " + encodeToSONOFA(negDec2));
var dec3 = .8838928375;
console.log(".8838928375 results in " + encodeToSONOFA(dec3));
//**/

// OBJECT TESTING : WORKS
///**
var object = {
    prop1 : 5,
    prop2 : 1.5,
    prop3 : 256,
    prop4 : .314,
    prop5 : "test1234"
};
console.log("Object encodes to " + encodeToSONOFA(object));
//**/

//BOOLEAN TESTING : WORKS
/**
var bool = true;
console.log("True encodes to " + encodeToSONOFA(bool));
bool = false;
console.log("False encodes to " + encodeToSONOFA(bool));
bool = null;
console.log("Null encodes to " + encodeToSONOFA(bool))
**/

//STRING TESTING : IN PROGRESS
/**
var string1 = "a";
var string2 = "abc";
var string3 = "test string";
var string4 = "How does the algorithm handle very long string? Hopefully fairly well!";
var string5 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP"; //42 chars
var string6 = "xTZWykz0tnLmbHCewf0nZ0ecaf8uywvWSk55UP8sXDXNUOXxO5ECzU06My1s4FbOFT9cRlbPYzJDxMd7Og5pFYia486A8rx4XGsrvuclg5vwho0kxGxDZ4yfZBEKOd"; // 126 chars
console.log("string1: " + string1 + " encodes to: " + encodeToSONOFA(string1));
console.log("string2: " + string2 + " encodes to: " + encodeToSONOFA(string2));
console.log("string3: " + string3 + " encodes to: " + encodeToSONOFA(string3));
console.log("string4: " + string4 + " encodes to: " + encodeToSONOFA(string4));
console.log("string5: " + string5 + " encodes to: " + encodeToSONOFA(string5));
console.log("string6: " + string6 + " encodes to: " + encodeToSONOFA(string6));
//**/