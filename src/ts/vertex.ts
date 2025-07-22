class Vertex {

    readonly id: string;
    readonly label: string;
    
    // depth: number;
    // x: number;
    // incidence: string[];
    // neighbors: string[];

    constructor (id: string, label: string) {
        this.id = id;
        this.label = label;
    } 

    get_id () : string {
        return this.id;
    }

    get_label () : string {
        return this.label;
    }

}