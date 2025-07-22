"use strict";
class Vertex {
    // depth: number;
    // x: number;
    // incidence: string[];
    // neighbors: string[];
    constructor(id, label) {
        this.id = id;
        this.label = label;
    }
    // Get the Node's Unique ID
    get_id() {
        return this.id;
    }
    // Get the Node's non-unique Label
    get_label() {
        return this.label;
    }
}
