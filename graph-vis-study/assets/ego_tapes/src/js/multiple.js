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
    dataPath: "./data/star_wars_4_adapted.edges.json",
    data: null,
    svg: null,
};

function render() {

    const global_dispatcher = d3.dispatch("highlight", "hover-in", "hover-out", "compression"); 

    const biofabric_svg = d3.select("#biofabric-svg");
    const biofabric = new BioFabric(new Graph(state.data));
    const renderer = new BioFabricRenderer(biofabric, state.width, state.height, global_dispatcher);
    renderer.render(biofabric_svg);

    const force_svg = d3.select("#force-svg");
    const nodelink = new NodeLink(new Graph(state.data));
    nodelink.setLayoutType("force");
    const force_renderer = new NodeLinkRenderer(nodelink, state.width, state.height, global_dispatcher);
    force_renderer.render(force_svg);

    const layered_svg = d3.select("#layered-svg");
    const nodelink_layered = new NodeLink(new Graph(state.data));
    nodelink_layered.setLayoutType("layered");
    const layered_renderer = new NodeLinkRenderer(nodelink_layered, state.width, state.height, global_dispatcher);
    layered_renderer.render(layered_svg);

    const matrix_svg = d3.select("#matrix-svg");
    const matrix = new Matrix(new Graph(state.data));
    const matrix_renderer = new MatrixRenderer(matrix, state.width, state.height, global_dispatcher);
    matrix_renderer.render(matrix_svg);
}


async function loadGraph(dataPath = state.dataPath) {
    state.dataPath = dataPath;
    const data = await d3.json(state.dataPath);
    state.data = data;
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
    loadGraph,
};

init();