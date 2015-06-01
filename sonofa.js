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
            logBundle(bundle);
            if (object % 1 === 0) {
                bundle += "0";
            } else {
                bundle += "1";
            }
            logBundle(bundle);
            return encodeNumber(object, bundle);
        case "object" :
            if (object === null) {               //tested : WORKS
                console.log("#object is null");
                //fill in with 1's until the last slot is a 0
                bundle += "11111110";
                break;
            } else {
                console.log("#object is an object");
                bundle = "01";
                logBundle(bundle);
                if (object instanceof Array) {  //Arrays return typeof as an object, so we further classify them here
                    bundle += "1";
                } else {
                    bundle += "0";
                }
                logBundle(bundle);
                bundle = encodeObject(object, bundle);
            }
            return bundle;
        case "boolean" :            //tested : WORKS
            console.log("#object is a boolean");
            bundle = "111";
            logBundle(bundle);
            if (object) {
                //fill in with all 1's
                bundle += "11111";
            } else {
                //fill in with 1's until the last slot is a 0
                bundle += "11110";
            }
            logBundle(bundle);
            return bundle;
        default :
            console.log("#!!#The data entered is a " + object);
    }
}

//tested : WORKS
function encodeNumber(obj, bundle) {
    var binNum = obj.toString(2); //convert to binary stream
    var binSize = binNum.length;  //get the number of digits
    if (binSize > 3) {            //find out if we need more than the one byte
        bundle += "1";              //we do
    } else {
        bundle += "0";              //we do not
    }
    logBundle(bundle);
    //insert buffer
    var firstByteRemaining = 8 - bundle.length;
    var stream = prependBuffer(binNum,firstByteRemaining);

    console.log("## THE FOLLOWING IS STREAM, NOT BUNDLE");
    logBundle(stream);
    bundle = firstByte(stream, bundle);
    console.log("#first byte finished");
    logBundle(bundle);
    bundle = appendBody(stream, bundle, firstByteRemaining);
    bundle = appendTail(stream, bundle);
    return bundle;
}

function encodeObject(obj, bundle) {
    //find out how many elements there are in the object or array
    var elementCount = objSize(obj);
    var binNum = elementCount.toString(2);
    var size = binNum.length;
    if (size > 4) {            //find out if we need more than the one byte
        bundle += "1";              //we do
    } else {
        bundle += "0";              //we do not
    }
    logBundle(bundle);
    //insert buffer
    var firstByteRemaining = 8 - bundle.length;
    var stream = prependBuffer(binNum,firstByteRemaining);

    console.log("## THE FOLLOWING IS STREAM, NOT BUNDLE");
    logBundle(stream);
    bundle = firstByte(stream, bundle);
    console.log("#first byte finished");
    logBundle(bundle);
    bundle = appendBody(stream, bundle, firstByteRemaining);
    bundle = appendTail(stream, bundle);
    return bundle;

}

function encodeString(obj, bundle) {

}

//adds the buffer to the start of the data to be sent
//tested : WORKS
function prependBuffer(data, spaces) {
    console.log("##enters prependBuffer function");
    return findNumBuffer(data.length, spaces) + data;
}

function firstByte(stream, bundle) {
    //finish off the first byte
    var remaining = 8 - bundle.length;
    for (var i = 0; i < remaining; i++) {
        bundle += stream[i];
    }
    return bundle;
}

//creates and adds the body of the bundle
//tested : WORKS
//stream - full data stream (buffer included) to be transmitted
//bundle - the packet we are writing to
//written - the number of bits that are included in the first bit
function appendBody(stream, bundle, written) {
    //create new bytes of data
    var bytes = (stream.length - 3) / 7;  //find how many bytes we need
    //Fill all but the last new bytes
    //If there is only one byte to be filled/finished, this will exit doing nothing
    if (bytes > 1) {
        console.log("appending body bytes");
        for (var byte = 0; byte < (bytes - 1); byte++) {
            bundle += "|1";              //Continuation bits for all but the last byte
            for (var place = 0; place < 7; place++) {
                var spot = ((byte * 7) + (place + (written)));
                bundle += stream[spot];
            }
        }
    } else {
        console.log("#packet not long enough to warrant appendBody function");
    }
    logBundle(bundle);
    return bundle;
}

//creates the last byte for hte bundle
//tested : WORKS
function appendTail(stream, bundle) {
    var bytes = int(stream.length / 7);
    if (bytes > 0) {
        bundle += "|0";                //Continuation bit set to false, this is last byte
        //Finish off the last bits of numerical data
        for (var bit = 1; bit < 8; bit++) {
            var spot = (((bytes - 1) * 8) + (3 - bytes)) + bit;
            bundle += stream[spot];
        }
    } else {
        console.log("#packet not long enough to warrant appendTail function");
    }
    logBundle(bundle);
    return bundle;
}

//returns only the integer of num, always rounding toward 0
//works with negatives too
//tested : WORKS
function int(num) {
    return num | 0;
}

//find how many spaces we need before meaningful data to
//tested : WORKS
function findNumBuffer(dataSize, spaces) {
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
    console.log("The bundle so far is " + bundle);
}

/**
 * NUMBER TESTING
var actual0 = 0;
console.log("0 edge case results in " + encodeToSONOFA(actual0));
var number0 = 5;
console.log("Value 5 results in " + encodeToSONOFA(number0));
var number1 = 15;
console.log("value 15 results in " + encodeToSONOFA(number1));
var number3 = 2345;
console.log("Medium numbers result in " + encodeToSONOFA(number3));
var number2 = 320617503; 
console.log("Large numbers result in  " + encodeToSONOFA(number2));
 **/

var object = {
    prop1 : 5,
    prop2 : 15,
    prop3 : 256
}
console.log("Object encodes to " + encodeToSONOFA(object));

var bool = true;
console.log("True encodes to " + encodeToSONOFA(bool));
bool = false;
console.log("False encodes to " + encodeToSONOFA(bool));
bool = null;
console.log("Null encodes to " + encodeToSONOFA(bool));
