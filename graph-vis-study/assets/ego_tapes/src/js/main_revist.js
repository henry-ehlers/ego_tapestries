import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { Graph } from './graph.js';
import { BioFabric } from './biofabric.js';
import { BioFabricRenderer } from './biofabricrenderer.js';
import { NodeLink } from './nodelink.js';
import { NodeLinkRenderer } from './nodelinkrender.js';
import { Matrix } from './matrix.js';
import { MatrixRenderer } from './matrixrenderer.js';
import { CompressionMsg } from "./CompressionMsg.js";
import { State } from './state.js';


const state = {
    width: 100,
    height: 50,
    rendererType: "biofabric", // "biofabric", "nodelink" or "matrix"
    layoutType: "layered",    // "force", "radial" or "layered"
    dataPath: "./data/star_wars_4_adapted.edges.json",
    graph: null,
    svg: null,
};

function getOrCreateSvg() {
    let svg = d3.select("#something");
    if (svg.empty()) {
        svg = d3
            .select("body")
            .append("svg")
            .attr("id", "something")
            .attr("width", "100%")
            .attr("height", "100%");
    }

    svg.attr("viewBox", `0 0 ${state.width} ${state.height}`);
    return svg;
}

function render(options = {}) {
    if (!state.graph) return;

    state.svg = getOrCreateSvg();
    state.svg.selectAll("*").remove();

    if (state.rendererType === "biofabric") {
        // dispatcher defined here, so we can send compressions from revisit parameters.
        const dispatcher = d3.dispatch("highlight", "hover-in", "hover-out", "compression");

        const biofabric = new BioFabric(state.graph);
        const renderer = new BioFabricRenderer(biofabric, state.width, state.height, dispatcher);
        renderer.render(state.svg);

        // send compression messages for any node or edge depths that are specified in the options.
        // this breaks separation of concerns, but i'm unsure how else to do it without major refactoring.
        for (const nodeDepth of options.nodeAlterCompressions) {
            const nodeDepthIcon = biofabric.nodeDepths.find(nodeDepthObj => nodeDepthObj.get_depth() == nodeDepth);
            const edgePendant = biofabric.edgeDepths.find(edgeDepth => edgeDepth.get_depth() == nodeDepth);
            const isFullCompression = (nodeDepthIcon.get_state() == State["Uncompressed"] && edgePendant.get_state() == State["Fully Compressed"]) || (nodeDepthIcon.get_state() == State["Fully Compressed"] && edgePendant.get_state() == State["Fully Compressed"]);
            dispatcher.call("compression", this, new CompressionMsg(nodeDepthIcon, isFullCompression, "node"));
        }

        for (const edgeDepth of options.edgeAlterCompressions) {
            const edgeDepthIcon = biofabric.edgeDepths.find(edgeDepthObj => edgeDepthObj.get_depth() == edgeDepth);
            let isFullCompression = false;
            if (edgeDepthIcon.get_depth() % 1 == 0) {
                const nodePendant = biofabric.nodeDepths.find(nodeDepth => nodeDepth.get_depth() == edgeDepthIcon.get_depth());
                isFullCompression = (edgeDepthIcon.get_state() == State["Partially Compressed"] && nodePendant.get_state() == State["Fully Compressed"]) || (edgeDepthIcon.get_state() == State["Fully Compressed"] && nodePendant.get_state() == State["Fully Compressed"]);
            }
            dispatcher.call("compression", this, new CompressionMsg(edgeDepthIcon, isFullCompression, "edge"));
        }

    } else if (state.rendererType === "matrix") {
        const matrix = new Matrix(state.graph);
        const renderer = new MatrixRenderer(matrix, state.width, state.height);
        renderer.render(state.svg);
    } else if (state.rendererType === "nodelink") {
        const nodelink = new NodeLink(state.graph);
        nodelink.setLayoutType(state.layoutType);
        const renderer = new NodeLinkRenderer(nodelink, state.width, state.height);
        renderer.render(state.svg);
    } else {
        throw new Error(`Unknown rendererType: ${state.rendererType}`);
    }
}

async function setRenderType(type) {
    await loadGraph(); // Reload graph to reset any renderer-specific state

    const allowed = ["biofabric", "nodelink", "matrix"];
    if (!allowed.includes(type)) {
        throw new Error(`Invalid rendererType "${type}". Allowed: ${allowed.join(", ")}`);
    }
    state.rendererType = type;
    render();
}

async function setLayoutType(type) {
    const allowed = ["force", "radial", "layered"];
    if (!allowed.includes(type)) {
        throw new Error(`Invalid layoutType "${type}". Allowed: ${allowed.join(", ")}`);
    }
    state.layoutType = type;
    if (state.rendererType === "nodelink") {
        render();
    }
}

async function loadGraph(dataPath = state.dataPath) {
    state.dataPath = dataPath;
    const data = await d3.json(state.dataPath);
    state.graph = new Graph(data);

    console.log(state.graph.nodes);
    console.log(state.graph.edges);
}

async function ego_init(options = {}) {
    if (options.width != null) state.width = options.width;
    if (options.height != null) state.height = options.height;
    if (options.rendererType != null) state.rendererType = options.rendererType;
    if (options.layoutType != null) state.layoutType = options.layoutType;
    if (options.dataPath != null) state.dataPath = options.dataPath;

    await loadGraph(state.dataPath);
    render(options);
}

export {
    ego_init,
    render,
    setRenderType,
    setLayoutType,
    loadGraph,
};

// do not call ego_init() here - we want the caller to decide when to initialize, and with what options
// init();