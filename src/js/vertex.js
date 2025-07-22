"use strict";
class Vertex {
    // x: number;
    constructor(id, label) {
        this.depth = Infinity;
        this.state = State.Uncompressed;
        this.distance = Infinity;
        this.incidence = [];
        this.adjacency = [];
        this.id = id;
        this.label = label;
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
