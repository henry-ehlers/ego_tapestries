"use strict";
var State;
(function (State) {
    State[State["Uncompressed"] = 0] = "Uncompressed";
    State[State["Partially Compressed"] = 1] = "Partially Compressed";
    State[State["Fully Compressed"] = 2] = "Fully Compressed";
})(State || (State = {}));
