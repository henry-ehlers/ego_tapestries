import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { Graph } from './graph.js';
import { BioFabric } from './biofabric.js';
import { BioFabricRenderer } from './biofabricrenderer.js';
import { NodeLink } from './nodelink.js';
import { NodeLinkRenderer } from './nodelinkrender.js';
import { Matrix } from './matrix.js';
import { MatrixRenderer } from './matrixrenderer.js';


async function init() {

    let width = 100;
    let height = 50;

    let data = await d3.json("./data/miserables.edges.json")
    let graph = new Graph(data);

    console.log(graph.nodes)
    console.log(graph.edges)

    let svg = d3
        .select("body")
        .append("svg")
        .attr("id", "something")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", "0 0 " + width + " " + height);

    const rendererType = "nodelink"; // "biofabric", "nodelink", or "matrix"

    if (rendererType === "biofabric") {
        let biofabric = new BioFabric(graph);
        let biofabricrenderer = new BioFabricRenderer(biofabric, width, height);
        biofabricrenderer.render(svg);
    } else if (rendererType === "matrix") {
        let matrix = new Matrix(graph);
        let matrixrenderer = new MatrixRenderer(matrix, width, height);
        matrixrenderer.render(svg);
    } else if (rendererType === "nodelink") {
        let nodelink = new NodeLink(graph);
        nodelink.setLayoutType("layered"); // "force", "radial", or "layered"
        let nodelinkrenderer = new NodeLinkRenderer(nodelink, width, height);
        nodelinkrenderer.render(svg);
    }
}

init();