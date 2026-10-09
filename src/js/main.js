import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { Graph } from './graph.js';
import { BioFabric } from './biofabric.js';
import { BioFabricRenderer } from './biofabricrenderer.js';

const state = {
    width: 100,
    height: 50,
    rendererType: "biofabric",
    layoutType: "layered",
    dataPath: "./data/company-network.json",
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

    const biofabric = new BioFabric(state.graph);
    const renderer = new BioFabricRenderer(biofabric, state.width, state.height);
    renderer.render(state.svg);
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
