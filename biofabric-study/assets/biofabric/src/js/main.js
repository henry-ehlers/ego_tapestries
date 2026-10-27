//import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
// loaded from local file in index.html
import { Graph } from './graph.js';
import { BioFabric } from './biofabric.js';
import { BioFabricRenderer } from './biofabricrenderer.js';

const state = {
    width: 100,
    height: 50,
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

async function loadGraph(dataPath = state.dataPath) {
    state.dataPath = dataPath;
    const data = await d3.json(state.dataPath);
    state.graph = new Graph(data);
}

async function init(options = {}) {
    if (options.width != null) state.width = options.width;
    if (options.height != null) state.height = options.height;
    if (options.dataPath != null) state.dataPath = options.dataPath;

    await loadGraph(state.dataPath);
    render();
}

export {
    init,
    render,
    loadGraph,
};
