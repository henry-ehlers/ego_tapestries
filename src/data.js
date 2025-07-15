async function init () {
    let data = await d3.csv("./data/bio-grid-mouse.edges")
    for (datum of data) {
        datum.weight = 1
    }
    console.log(data)
}

init();
