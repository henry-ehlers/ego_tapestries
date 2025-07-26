"use strict";
var State;
(function (State) {
    State[State["Empty"] = 0] = "Empty";
    State[State["Singleton"] = 1] = "Singleton";
    State[State["Uncompressed"] = 2] = "Uncompressed";
    State[State["Partially Compressed"] = 3] = "Partially Compressed";
    State[State["Fully Compressed"] = 4] = "Fully Compressed";
})(State || (State = {}));
