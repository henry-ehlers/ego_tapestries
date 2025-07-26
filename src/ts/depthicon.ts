class DepthIcon {

    //
    minX: number = Infinity;
    x: number = Infinity;
    maxX: number = Infinity;

    //
    minY: number = Infinity;
    y: number = Infinity;
    maxY: number = Infinity;
   
    //
    depth: number = Infinity;
    state: State = State.Empty;

    constructor () {
    } 

    get_x () : number {
        return this.x;
    }

    get_y () : number {
        return this.y;
    }

    get_min_y () : number {
        return this.minY;
    }

    get_max_y () : number {
        return this.maxY;
    }

    get_min_x () : number {
        return this.minX;
    }

    set_max_y (y: number) : void {
        this.maxY = y;
    }

    set_min_y (y: number) : void {
        this.minY = y;
    }

    get_max_x () : number {
        return this.maxX;
    }

    set_max_x (x: number) : void {
        this.maxX = x;
    }

    set_min_x (x: number) : void {
        this.minX = x;
    }

    set_x (x: number) : void {
        this.x = x
    }

    set_y (y: number) : void {
        this.y = y
    }

    get_state () : State {
        return this.state;
    }

    set_state (state: State) : void {
        this.state = state;
    }

    set_depth (depth: number) : void {
        this.depth = depth;
    }

    get_depth () : number {
        return this.depth
    }
}