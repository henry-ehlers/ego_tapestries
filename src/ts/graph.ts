class Graph {

    edges: Array<Edge> = [];
    nodes: Array<Vertex> = [];
    root: string;
    depth: number;

    constructor (data: any, root: string, depth: number) {
        this.load_data(data);
        this.root = root;
        this.depth = depth;
    }

    // Populate Edges and Nodes from Dataset
    load_data (data: any) : void {

        // Initialize IDs of edges and nodes
        let nodeCounter: number = 0;
        let edgeCounter: number = 0;

        // Iterate over Entries in Dataset
        for (let entry of data) {

            // If Edge Source Node Doesn't Exist -> Add
            if (!this.nodes.find(n => n.label == entry.source)) {
                let nodeID: number = nodeCounter++
                this.nodes.push(new Vertex(nodeID.toString(), entry.source))
            }
            
            // If Edge Target Node Doesn't Exist -> Add
            if (!this.nodes.find(n => n.label == entry.target)) {
                let nodeID: number = nodeCounter++
                this.nodes.push(new Vertex(nodeID.toString(), entry.target))
            }
            
            // Get Source and Target ID's from Node List
            let sourceID = this.nodes.find(n => n.label == entry.source)?.get_id();
            let targetID = this.nodes.find(n => n.label == entry.target)?.get_id();

            // Check that Source and Target ID's exist in node list
            if (sourceID == undefined || targetID == undefined) {
                throw new Error("SourceID or TargetID not found in node list!")
            }

            // Check if Edge already exists in Edge list
            if (!this.edges.find(e => e.has_node_id(sourceID) && e.has_node_id(targetID))) {

                // Create new Edge and Add to Edge list
                let edgeID = edgeCounter++;
                let newEdge = new Edge(edgeID.toString(), sourceID, targetID, entry.weight)
                this.edges.push(newEdge)

            }
        }
    }

    // Get a Node from the Node list using its unique ID
    get_node_from_id (nodeID: string) : Vertex {
        let node = this.nodes.find(n => n.id == nodeID);
        if (node == undefined) {
            throw new Error ("Node ID not found")
        } else {
            return node;
        }
    }

}