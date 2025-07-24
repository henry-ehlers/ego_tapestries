class Edge {
    
    //
    readonly id: string;
    readonly endpoints: [Vertex, Vertex];
    readonly weight: number;

    // 
    depth: number = Infinity;
    state: State = State.Uncompressed;
    index: number = Infinity;

    //
    x: number = Infinity;
    y: number = Infinity;

    // Constructor
    constructor (id: string, source: Vertex, target: Vertex, weight: number) {
        this.id = id;
        this.endpoints = [source, target];
        this.weight = weight;
    }

    set_x (x: number) : void {
        this.x = x;
    }

    set_y (y: number) : void {
        this.y = y;
    }

    get_x () : number {
        return this.x;
    }

    get_y () : number {
        return this.y;
    }

    // Get the Edge's Unique ID
    get_id () : string {
        return this.id;
    }

    get_depth () : number {
        return this.depth;
    }

    set_depth (depth: number) {
        this.depth = depth;
    }

    get_state () : State {
        return this.state;
    }

    get_endpoints () : [Vertex, Vertex] {
        return this.endpoints;
    }

    get_endpoint_ids () : Array<string> {
        return this.endpoints.map(node => node.id);
    }

    // Check if Given Node ID maps to Edge's Endpoints
    has_node_id (nodeID: string): boolean {
        return (this.get_source().get_id() == nodeID || this.get_target().get_id() == nodeID)
    }

    // Get SourceID
    get_source () : Vertex {
        return this.endpoints[0];
    }

    // Get TargetID
    get_target () : Vertex {
        return this.endpoints[1];
    }

    // Reset the Edge (to before the construction of an ego network)
    reset () : void {
        this.depth = Infinity;
        this.state = State.Uncompressed;
    }

}