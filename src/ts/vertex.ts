class Vertex {

    readonly id: string;
    readonly label: string;

    depth: number = Infinity;
    state: State = State.Uncompressed;
    index: number = Infinity;
    distance: number = Infinity;
    incidence: Array<Edge> = [];
    adjacency: Array<Vertex> = [];

    // Geometry
    x: number = Infinity;
    y: number = Infinity;

    constructor (id: string, label: string) {
        this.id = id;
        this.label = label;
    } 

    get_y () : number {
        return this.y;
    }

    set_y (y: number) : void {
        this.y = y;
    }

    get_x () : number {
        return this.x;
    }

    set_x (x: number) : void {
        this.x = x;
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

    get_state () : State {
        return this.state;
    }

    get_depth () : number {
        return this.depth;
    }

    get_distance () : number {
        return this.distance;
    }

    // Get the Node's non-unique Label
    get_label () : string {
        return this.label;
    }

    // Reset the Node (to before the construction of an ego network)
    reset () : void {
        this.depth = Infinity;
        this.state = State.Uncompressed;
        this.index = Infinity;
        this.distance = Infinity;
        this.incidence = [];
        this.adjacency = [];
    }

}