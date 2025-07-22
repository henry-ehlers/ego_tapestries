async function init () {

    let width = 1000;
    let height = 2000;

    let data = await d3.json("./data/miserables.edges.json")
    let graph = new Graph(data);

    console.log(graph.nodes)
    console.log(graph.edges)

    let biofabric = new BioFabric(graph);
    let biofabricrenderer = new BioFabricRenderer(biofabric, width, height);
    console.log(biofabric);

    let svg = d3
        .select("body")
        .append("svg")
        .attr("id", "something")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("width", "100%")
    
    biofabricrenderer.render(svg);
    
}

init();