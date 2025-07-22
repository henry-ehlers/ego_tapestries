class Graph {

    edges: Array<Edge> = [];
    nodes: Array<Vertex> = [];
    depth: number = 2;
    ego: Vertex;

    // Constructor
    constructor (data: any) {
        this.load_data(data);
        this.ego = this.nodes[0];
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

    // Breadth First Search
    breadth_first_search () {

        // Initialize Queue, Visited, Results, and Shortest Paths
        let queue: Array<Vertex> = [this.ego];
        let visited: Set<Vertex> = new Set();
        let result: Array<Vertex> = [];
        let shortestPaths: {[id: string] : number} = {};
        
        // Initialize the shortest path for the ego
        shortestPaths[this.ego.get_id()] = 0;

        // While vertices exist in the Queue
        while (queue.length) {

            // Get Next Vertex in Queue
            let vertex = queue.shift();
            if (vertex == undefined) {
                throw new Error("BFS: vertex in queue is undefined!")
            }
            
            // If the Vertex Has not Yet been visited
            if (!visited.has(vertex)) {

                // Add Current Node to visited and results
                visited.add(vertex);
                result.push(vertex);
                
                // Get Vertex Incidence and Neighbors
                vertex.set_incidence(this.edges.filter(edge => edge.has_node_id(vertex.id)))
                let neighborIDs: Array<string> = vertex.incidence.map(edge => edge.get_endpoints()).flat(1).filter(nodeID => vertex.id != nodeID);
                let adjacency: Array<Vertex> = neighborIDs.map(nodeID => this.nodes.find(node => node.id == nodeID)).filter(node => {if (!node) {throw new Error("Node is Undefined!")}; return node != undefined;});
                vertex.set_adjacency(adjacency);

                // Iterate over node in Adjacency
                for (let neighbor of adjacency) {
                    
                    // Set Depth of Neighbor
                    neighbor.set_depth(neighbor.depth < vertex.depth + 1 ? neighbor.depth : vertex.depth + 1)
                    
                    // Get weight of neighbor node
                    let neighborWeight: number | undefined = this.edges.find(edge => edge.has_node_id(neighbor.get_id()) && edge.has_node_id(vertex.get_id()))?.weight
                    if (!neighborWeight) {
                        throw new Error("Weight is undefined!")
                    }

                    // Calculcate Shortest Paths
                    if (neighbor.depth == vertex.depth - 1) {
                        if (shortestPaths[vertex.get_id()] == undefined) {
                            shortestPaths[vertex.get_id()] = shortestPaths[neighbor.get_id()] + neighborWeight
                        }
                        if (shortestPaths[vertex.get_id()] < shortestPaths[neighbor.get_id()] + neighborWeight)
                            shortestPaths[vertex.get_id()] = shortestPaths[neighbor.get_id()] + neighborWeight
                        
                    }
                    
                    // Add neighbor to Queue
                    queue.push(neighbor);

                }
            }
        }

        // FIX THIS LATER
        for (let node of this.nodes) {
            node.set_distance(shortestPaths[node.get_id()]);
        }
    }

    // Construct the Ego Network for the Given Selected Root Node
    construct_ego_network () {

        // Reset the Ego Network
        this.nodes.map(node => node.reset());
        this.edges.map(edge => edge.reset());
        this.ego.depth = 0;

        // Traverse the Network for newly selected ego
        this.breadth_first_search();

        // Iterate over Edges and Set Edge Depth
        for (let edge of this.edges) {

            // Get Source and Target from Node List
            let source: Vertex | undefined = this.nodes.find(n => n.id == [...edge.endpoints][0])
            let target: Vertex | undefined = this.nodes.find(n => n.id == [...edge.endpoints][1])
            if (!source || !target) {
                throw new Error("Source or Target undefined!")
            }

            // Set Edge Depth as Function of its Incident Nodes' Depths
            edge.depth = (source.depth == target.depth) ? source.depth : ((source.depth + target.depth) / 2 )

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