SONOFA
=======

Front-End engineering is an art as well as a science. JSON is fast, sure!
But it is very verbose and increases the size of the relevant message.

So, we are going to implement our own format:

"Smaller Object Notation Offering Frequent Advantages" aka SONOFA

VInt
----

VInt(n) -> Variable Integer of n Bits.

1. If n were 5, and we ready 5 bits in order from a stream, it would
   look like: YABCD
2. Y is called the extension bit. If Y == 0, the remaining bits ABCD
    form the number. 
3. But if Y == 1, read another byte: YEFGHIJK. If this new Y is zero, we stop.
   if not, we continue step 3. Let's assume it stopped, we now have a 11 or more
   bit number: ABCD EFGHIJK
4. If we know that the type is signed, just sign extend the number to get the
   final output. (fill the left side with A)

Values
------

Read a byte ABCDEFGH. The first three bits ABC tell us what type value is
following after this byte.

    String  - 000[YXXXX]
    Number  - 001[0/1][YXXX] 1 Signifies FP + Read VInt8 for Exponent
    Hash/Ob - 010[YXXXX]
    Array   - 011[YXXXX]
    
    Unused  - 100 
    Unused  - 101
    Unused  - 110
    
    Custom  - 111XXXXX (0..29) - User Defined Types
    Null/F  - 11111110
         T  - 11111111

String
------

if ABC is 000, then we have a String.

String  - 000[YXXXX]

YXXXX is VInt(5) but always unsigned and the length k
of the String in Characters that follows.

If the Length is k characters, we read k characters as UTF-8. 
Read http://en.wikipedia.org/wiki/UTF-8 on how to decode a UTF-8
stream.

We also maintain a global String dictionary during encode/decode.
As soon as we find a String, we place it into the dictionary, and give it 
an index, starting from 0.

So if we read "foo", "bar", "choco", "foo" in order, we refer to
their indexes as 0, 1, 2, 0.

If the Length k is zero, we read VInt(8) and read an integer x,
and the decoded string will be dictionary[x].

Number
------

If ABC is 001, then we have a Number. 

If D is 0, we are looking at a integral (short/int/long/BigInteger) type.
If D is 1, we are looking at a floating point (float/double/BigDecimal) type.

The remaining bits YXXX are VInt(4) which specify length of the
type. 
Then we read a signed number of the length above.
In case we read a floating point value, we read a VInt(8) signed value
of exponent.

Object/Hash
------------

If ABC is 010, then we have a Object/Hash.

YXXXX is VInt(5) but unsigned, the number of
elements of this Object to be read = k.

It's followed by reading k Key/Value pairs.

We read k, then we read v.

k can be either an Integer (refering to an old String in the global
Dictionary) or a String.

v is a value, could be any of the above.

Array
-----

If ABC is 011, then we have an Array.

YXXXX is VInt(5) but unsigned, the number of
elements in this array to be read = l.

It's followed by reading l Values.

Null/False
----------

If ABCDEFGH were to equal 11111110, we read a NULL type. During
serialization, it is perfectly okay to omit NULL values - but
sometimes it is required in code. So we fit that requirement here.

If it is impossible to deserialize a field, skip that field.

But if the field were a Boolean value, it would assume the
value false.

The field were an Integer or Numeric, it would assume
the value zero.

If it were a pointer, it would assume the value NULL.

True
----

If ABCDEFGH were 11111111, it is a True (Boolean) value.

If the field were a Boolean value, it would assume the
value true.

The field were an Integer or Numeric, it would assume
the value 1.

Custom
------

If ABC were 111, and DEFGH was between 0 and 29 inclusive, then
we use it to serialize/deserialize a user type. This is left to
the user's option, and we leave details for this.

Unused
------

If ABC were 100, 101 or 110 - they are treated as reserved extensions
to SONOFA that will be available in later version.

Your Mission
============

Should you choose to accept, implement this in JavaScript:

    function encodeToSONOFA(obj);

which returns an Int8Array()

    function decodeFromSONOFA(sonofaArray, obj);

which if obj is not null, sets it to the value decoded from sonofaArray, or
creates a new decoded object. Finally, the decoded object is returned.