class Node {

    constructor (id, label, depth = undefined, x = null) {
        this.id = id;
        this.label = label;
        this.depth = depth;
        this.x = x
        this.incidence = []
        this.neighbors = []
    }

    get_id () {
        return this.id
    }

    get_label () {
        return this.label
    }

}