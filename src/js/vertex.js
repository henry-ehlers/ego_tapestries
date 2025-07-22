"use strict";
class Vertex {
    constructor(id, label) {
        this.depth = Infinity;
        this.state = State.Uncompressed;
        this.index = Infinity;
        this.distance = Infinity;
        this.incidence = [];
        this.adjacency = [];
        // Geometry
        this.x = Infinity;
        this.y = Infinity;
        this.id = id;
        this.label = label;
    }
    get_y() {
        console.log(this.y);
        return this.y;
    }
    set_y(y) {
        this.y = y;
    }
    get_x() {
        return this.x;
    }
    set_x(x) {
        this.x = x;
    }
    set_incidence(incidence) {
        this.incidence = incidence;
    }
    set_adjacency(adjacency) {
        this.adjacency = adjacency;
    }
    set_state(state) {
        this.state = state;
    }
    set_depth(depth) {
        this.depth = depth;
    }
    set_distance(distance) {
        this.distance = distance;
    }
    // Get the Node's Unique ID
    get_id() {
        return this.id;
    }
    get_depth() {
        return this.depth;
    }
    get_distance() {
        return this.distance;
    }
    // Get the Node's non-unique Label
    get_label() {
        return this.label;
    }
    // Reset the Node (to before the construction of an ego network)
    reset() {
        this.depth = Infinity;
        this.state = State.Uncompressed;
        this.incidence = [];
    }
}
