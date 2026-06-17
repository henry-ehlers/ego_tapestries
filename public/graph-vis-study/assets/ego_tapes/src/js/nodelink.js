"use strict";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export class NodeLink {
    constructor(graph) {
        this.graph = graph;
        this.layoutType = "force"; // "force", "radial", or "layered"

        // Initialize positions based on layout type
        this.initializeLayout();
    }

    initializeLayout() {
        switch (this.layoutType) {
            case "force":
                this.initializeForceLayout();
                break;
            case "radial":
                this.initializeRadialLayout();
                break;
            case "layered":
                this.initializeLayeredLayout();
                break;
            default:
                this.initializeForceLayout();
        }
    }

    initializeForceLayout() {

    }

    initializeRadialLayout() {

    }

    initializeLayeredLayout() {

    }

    setLayoutType(type) {
        this.layoutType = type;
        this.initializeLayout();
    }
}
