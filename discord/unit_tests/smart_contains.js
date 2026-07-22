import { SmartContains } from "../smart_contains.js";

if (SmartContains.tokens_are_similar("cum", "come")) {
    throw "FAIL: 'cum' and 'come' are similar";
}

if (!SmartContains.tokens_are_similar("cum", "cummmm")) {
    throw "FAIL: 'cum' and 'cummmm' are not similar";
}

if (!SmartContains.tokens_are_similar("cum", "cum")) {
    throw "FAIL: exact matches do not work";
}

if (SmartContains.tokens_are_similar("come", "cum")) {
    throw "FAIL: 'come' and 'cum' are similar";
}

if (!SmartContains.contains("come and kill me", "kill")) {
    throw "FAIL: 'kill' not detected in 'come and kill me'";
}

if (!SmartContains.contains("wow screw you", "screw you")) {
    throw "FAIL: 'screw you' not detected in 'wow screw you'";
}

if (!SmartContains.contains("wow screw youu!", "screw you")) {
    throw "FAIL: 'screw you' not detected in 'wow screwww youu!'";
}

console.log("Smart Contains Unit Tests Passed!");