class Edge {
    
    readonly id: string;
    readonly endpoints: [string, string];
    readonly weight: number;
    depth: number = Infinity;
    state: State = State.Uncompressed;

    constructor (id: string, sourceID: string, targetID: string, weight: number) {
        this.id = id;
        this.endpoints = [sourceID, targetID];
        this.weight = weight;
    }

    // Get the Edge's Unique ID
    get_id () : string {
        return this.id;
    }

    get_endpoints () : [string, string] {
        return this.endpoints;
    }

    // Check if Given Node ID maps to Edge's Endpoints
    has_node_id (nodeID: string): boolean {
        return this.endpoints.includes(nodeID);
    }

    // Get SourceID
    get_source () : string {
        return this.endpoints[0];
    }

    // Get TargetID
    get_target () : string {
        return this.endpoints[1];
    }

    // Reset the Edge (to before the construction of an ego network)
    reset () : void {
        this.depth = Infinity;
        this.state = State.Uncompressed;
    }

}