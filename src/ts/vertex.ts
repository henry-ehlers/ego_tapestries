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

    // Get the Node's Unique ID
    get_id () : string {
        return this.id;
    }

    // Get the Node's non-unique Label
    get_label () : string {
        return this.label;
    }

}