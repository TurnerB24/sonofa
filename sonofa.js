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
            encodeString(object, bundle);
            break;
        case "number" :
            console.log("#object is a number");
            bundle = "001";
            if (object % 1 === 0) {
                bundle += "0";
            } else {
                bundle += "1";
            }
            bundle = encodeNumber(object, bundle);
            break;
        case "object" :
            console.log("#object is an object");
            bundle = "01";
            if (object instanceof Array) {  //Arrays return typeof as an object, so we further classify them here
                bundle += "1";
            } else {
                bundle += "0";
            }
            bundle = encodeObject(object, bundle);
            break;
        case "boolean" :
            console.log("#object is a boolean");
            bundle = "111";
            if (object) {
                //fill in with all 1's
                bundle += "1111";
            } else {
                //fill in with 1's until the last slot is a 0
                bundle += "1110";
            }
            break;
        case "null" :
            console.log("#object is null");
            //fill in with 1's until the last slot is a 0
            bundle += "1111110";
            break;
        default :
            console.log("#!!#The data entered is a " + object);
    }
    return bundle;
}

function encodeNumber(obj, bundle) {
    var binNum = obj.toString(2); //convert to binary stream
    var binSize = binNum.length;  //get the number of digits
    if (binSize > 3) {            //find out if we need more than the one byte
        bundle += "1";              //we do
    } else {
        bundle += "0";              //we do not
    }
    //insert buffer
    var stream = prependBuffer(binNum);
    //finish off the first byte
    for (var i = 0; i < 3; i++) {
        bundle += stream[i];
    }
    appendBody(stream, bundle);
    appendTail(stream, bundle);
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
    //insert buffer
    var stream = prependBuffer(binNum);
    //finish off the first byte
    for (var i = 0; i < 4; i++) {
        bundle += stream[i];
    }
    appendBody(stream, bundle);
    appendTail(stream, bundle);
    return bundle;

}

function encodeString(obj, bundle) {

}

//creates and adds the body of the bundle
function appendBody(stream, bundle) {
    //create new bytes of data
    var bytes = int(stream / 8);  //find how many bytes we need

    //Fill all but the last new bytes
    //If there is only one byte to be filled/finished, this will exit doing nothing
    for (var byte = 0; byte < (bytes - 1); byte++) {
        bundle += "1";              //Continuation bits for all but the last byte
        for (var place = 1; place < 8; place++) {
            var spot = (byte * 8) + place;
            bundle += stream[spot];
        }
    }
}

//creates the last byte for hte bundle
function appendTail(stream, bundle) {
    var bytes = int(stream / 8);

    bundle += "0";                //Continuation bit set to false, this is last byte
                                  //Finish off the last bits of numerical data
    for (var bit = 1; bit < 8; bit++) {
        var spot = (bytes * 8) + bit;
        bundle += stream[spot];
    }
}

//returns only the integer of num, always rounding toward 0
//works with negatives too
//tested : WORKS
function int(num) {
    return num | 0;
}

//find how many spaces we need before meaningful data to
//tested : WORKS
function findNumBuffer(dataSize) {
    var spaces = 3;         //we have 3 bits left to fill in the first byte
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

//adds the buffer to the start of the data to be sent
//tested : WORKS
function prependBuffer(data) {
    var buffer = findNumBuffer(data.length);
    return buffer + data;
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

var number = 5;
console.log(encodeToSONOFA(number));
var number2 = 12;
console.log(encodeToSONOFA(number2));
