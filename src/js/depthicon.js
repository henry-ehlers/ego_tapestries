"use strict";
class DepthIcon {
    constructor() {
        //
        this.minX = Infinity;
        this.x = Infinity;
        this.maxX = Infinity;
        //
        this.minY = Infinity;
        this.y = Infinity;
        this.maxY = Infinity;
        //
        this.depth = Infinity;
        this.state = State.Empty;
    }
    get_x() {
        return this.x;
    }
    get_y() {
        return this.y;
    }
    get_min_y() {
        return this.minY;
    }
    get_max_y() {
        return this.maxY;
    }
    get_min_x() {
        return this.minX;
    }
    set_max_y(y) {
        this.maxY = y;
    }
    set_min_y(y) {
        this.minY = y;
    }
    get_max_x() {
        return this.maxX;
    }
    set_max_x(x) {
        this.maxX = x;
    }
    set_min_x(x) {
        this.minX = x;
    }
    set_x(x) {
        this.x = x;
    }
    set_y(y) {
        this.y = y;
    }
    get_state() {
        return this.state;
    }
    set_state(state) {
        this.state = state;
    }
    set_depth(depth) {
        this.depth = depth;
    }
    get_depth() {
        return this.depth;
    }
}
