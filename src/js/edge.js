"use strict";
class Edge {
    // Constructor
    constructor(id, source, target, weight) {
        // 
        this.depth = Infinity;
        this.state = State.Uncompressed;
        this.index = Infinity;
        //
        this.x = Infinity;
        this.y = Infinity;
        this.id = id;
        this.endpoints = [source, target];
        this.weight = weight;
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
    // Get the Edge's Unique ID
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
    get_endpoints() {
        return this.endpoints;
    }
    get_endpoint_ids() {
        return this.endpoints.map(node => node.id);
    }
    // Check if Given Node ID maps to Edge's Endpoints
    has_node_id(nodeID) {
        return (this.get_source().get_id() == nodeID || this.get_target().get_id() == nodeID);
    }
    // Get SourceID
    get_source() {
        return this.endpoints[0];
    }
    // Get TargetID
    get_target() {
        return this.endpoints[1];
    }
    // Reset the Edge (to before the construction of an ego network)
    reset() {
        this.depth = Infinity;
        this.state = State.Uncompressed;
    }
}
