import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { Graph } from './graph.js';
import { BioFabric } from './biofabric.js';
import { BioFabricRenderer } from './biofabricrenderer.js';
import { NodeLink } from './nodelink.js';
import { NodeLinkRenderer } from './nodelinkrender.js';
import { Matrix } from './matrix.js';
import { MatrixRenderer } from './matrixrenderer.js';

const state = {
    width: 100,
    height: 50,
    rendererType: "nodelink", // "biofabric", "nodelink" or "matrix"
    layoutType: "layered",    // "force", "radial" or "layered"
    dataPath: "./data/star_wars_4.edges.json",
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

function render() {
    if (!state.graph) return;

    state.svg = getOrCreateSvg();
    state.svg.selectAll("*").remove();

    if (state.rendererType === "biofabric") {
        const biofabric = new BioFabric(state.graph);
        const renderer = new BioFabricRenderer(biofabric, state.width, state.height);
        renderer.render(state.svg);
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

async function init(options = {}) {
    if (options.width != null) state.width = options.width;
    if (options.height != null) state.height = options.height;
    if (options.rendererType != null) state.rendererType = options.rendererType;
    if (options.layoutType != null) state.layoutType = options.layoutType;
    if (options.dataPath != null) state.dataPath = options.dataPath;

    await loadGraph(state.dataPath);
    render();
}

export {
    init,
    render,
    setRenderType,
    setLayoutType,
    loadGraph,
};

init();