class Vertex {

    readonly id: string;
    readonly label: string;
    depth: number = Infinity;
    state: State = State.Uncompressed;
    distance: number = Infinity;
    incidence: Array<Edge> = [];
    adjacency: Array<Vertex> = [];

    // x: number;

    constructor (id: string, label: string) {
        this.id = id;
        this.label = label;
    } 

    set_incidence (incidence: Array<Edge>): void {
        this.incidence = incidence;
    }

    set_adjacency (adjacency: Array<Vertex>): void {
        this.adjacency = adjacency;
    }

    set_state (state: State): void {
        this.state = state;
    }

    set_depth (depth: number): void {
        this.depth = depth;
    }

    set_distance (distance: number) : void {
        this.distance = distance;
    }
    
    // Get the Node's Unique ID
    get_id () : string {
        return this.id;
    }

    // Get the Node's non-unique Label
    get_label () : string {
        return this.label;
    }

    // Reset the Node (to before the construction of an ego network)
    reset () : void {
        this.depth = Infinity;
        this.state = State.Uncompressed;
        this.incidence = [];
    }

}