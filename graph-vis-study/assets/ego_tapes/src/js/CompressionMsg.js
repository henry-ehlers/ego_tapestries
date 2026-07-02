"use strict";

export class CompressionMsg {
    // BioFabric Renderer sends messages of edgeDepth or nodeDepthIcon.
    // These objects have a get_state() or get_depth() method which return values used for the compression.
    // The other renderers just send the node ID as a message.
    //
    // Hence we need to type check the message to determine how to handle it.
    // e.g. the non-biofabric renderers only care about full compression/decompression of biofabric and not the individual steps.
    constructor(msg, isFullCompression = false, nodeOrEdge = "") {
        if (nodeOrEdge !== "node" && nodeOrEdge !== "edge" && nodeOrEdge !== "") {
            throw new Error("nodeOrEdge must be either 'node', 'edge' or ''");
        }

        this.msg = msg;
        this.type = typeof msg;
        this.fullcompression = isFullCompression;
        this.nodeOrEdge = nodeOrEdge;
    }
}