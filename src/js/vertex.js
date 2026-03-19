"use strict";
import { State } from './state.js';

export class Vertex {

    constructor(id, label, attrs = {}) {
        if (typeof attrs !== 'object' || attrs === null) {
            throw new Error('attrs must be an object');
        }

        this.depth = Infinity;
        this.state = State.Uncompressed;
        this.isHighlighted = false;
        this.index = Infinity;
        this.distance = Infinity;
        this.incidence = [];
        this.adjacency = [];
        // Geometry
        this.x = Infinity;
        this.y = Infinity;
        this.id = id;
        this.label = label;
        this.attrs = attrs;
    }

    get_y() {
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

    get_adjacency() {
        return this.adjacency;
    }

    set_state(state) {
        this.state = state;
    }

    set_depth(depth) {
        this.depth = depth;
    }

    set_highlighted(isHighlighted) {
        this.isHighlighted = isHighlighted;
    }

    set_distance(distance) {
        this.distance = distance;
    }

    get_id() {
        return this.id;
    }

    get_state() {
        return this.state;
    }

    get_highlighted() {
        return this.isHighlighted;
    }

    get_depth() {
        return this.depth;
    }

    get_distance() {
        return this.distance;
    }

    get_label() {
        return this.label;
    }

    // Reset the Node (to before the construction of an ego network)
    reset() {
        this.depth = Infinity;
        this.state = State.Uncompressed;
        this.index = Infinity;
        this.distance = Infinity;
        this.incidence = [];
        this.adjacency = [];
        this.isHighlighted = false;
    }
}
