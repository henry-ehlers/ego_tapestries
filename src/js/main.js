async function init () {

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
        .attr("viewBox", "0 0 " + width + " " + height)

    // let biofabric = new BioFabric(graph);
    // let biofabricrenderer = new BioFabricRenderer(biofabric, width, height);
    // biofabricrenderer.render(svg);

    let linear = new Linear(graph);
    let linearrenderer = new LinearRenderer(linear, width, height);
    linearrenderer.render(svg)
    
}

init();