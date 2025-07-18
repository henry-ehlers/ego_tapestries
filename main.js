async function init () {
    let data = await d3.json("./data/bio-grid-mouse.edges.json")
    let graph = new Graph(data);

    let svg = d3.select("body")
        .append("svg")
        .attr("viewBox", "0 0 400 500")
        .attr("width", "100%")
    
        
    graph.draw_biofabric(svg);
}

init();
