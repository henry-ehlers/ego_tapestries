"use strict";
import { State } from './state.js';

export class DepthIcon {
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

        this.group_label = null;
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
    set_group_label(name) {
        this.group_label = name;
    }
    get_group_label() {
        return this.group_label;
    }
}
