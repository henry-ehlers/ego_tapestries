"use strict";
var State;
(function (State) {
    State[State["Singleton"] = 0] = "Singleton";
    State[State["Uncompressed"] = 1] = "Uncompressed";
    State[State["Partially Compressed"] = 2] = "Partially Compressed";
    State[State["Fully Compressed"] = 3] = "Fully Compressed";
})(State || (State = {}));
