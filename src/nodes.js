class Nodes {
    
    constructor (nodes = []) {
        this.nodes = nodes;
    }

    add_node (node) {
        this.nodes.push(node)
    }

    get_node_from_id (id) {
        return this.nodes.find(n => n.id == id);
    }

    get_node_from_label (label) {
         return this.nodes.find(n => n.label == label);
    }

    has_id (id) {
        return this.get_node_from_id(id) != undefined
    }

    has_label(label) {
        return this.get_node_from_label(label) != undefined
    }

}