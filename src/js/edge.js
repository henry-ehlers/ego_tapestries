"use strict";
import { State } from './state.js';

export class Edge {

    constructor(id, source_vertex, target_vertex, attrs) {
        // if attrs is not an object throw error
        if (typeof attrs !== 'object' || attrs === null) {
            throw new Error('attrs must be an object');
        }

        this.depth = Infinity;
        this.state = State.Uncompressed;
        this.index = Infinity;

        this.x = Infinity;
        this.y = Infinity;

        this.id = id;

        // source ID as string
        this.source = source_vertex.get_id().toString();
        // target ID as string
        this.target = target_vertex.get_id().toString();
        // endpoint vertices objects
        this.endpoints = [source_vertex, target_vertex];

        this.attrs = attrs;
    }

    set_x(x) {
        this.x = x;
    }

    set_y(y) {
        this.y = y;
    }

    get_x() {
        return this.x;
    }

    get_y() {
        return this.y;
    }

    get_id() {
        return this.id;
    }

    get_depth() {
        return this.depth;
    }

    set_depth(depth) {
        this.depth = depth;
    }

    get_state() {
        return this.state;
    }

    set_state(state) {
        this.state = state;
    }

    get_endpoints() {
        return this.endpoints;
    }

    get_endpoint_ids() {
        return this.endpoints.map(node => node.id);
    }

    // Check if Given Node ID maps to Edge's Endpoints
    has_node_id(nodeID) {
        return (this.get_source_vertex().get_id() == nodeID || this.get_target_vertex().get_id() == nodeID);
    }

    get_source_vertex() {
        return this.endpoints[0];
    }

    get_target_vertex() {
        return this.endpoints[1];
    }

    // Reset the Edge (to before the construction of an ego network)
    reset() {
        this.depth = Infinity;
        this.state = State.Uncompressed;
    }
}
