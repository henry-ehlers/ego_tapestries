import { State } from './state.js';

export class Matrix {
    constructor(graph) {
        this.graph = graph;
        this.sort_nodes_by_depth();
        this.set_virtual_x_coordinates();
    }

    sort_nodes_by_depth() {
        this.graph.nodes.sort((nodeA, nodeB) => {
            if (nodeA.get_depth() > nodeB.get_depth()) {
                return 1;
            }
            else if (nodeA.get_depth() < nodeB.get_depth()) {
                return -1;
            }
            else {
                return 0;
            }
        });
    }

    change_ego(node) {
        this.graph.change_ego_and_reconstruct(node);
        this.sort_nodes_by_depth();
        this.set_virtual_x_coordinates();
    }

    // creates a virtual x coordinate for each node.
    // It's zero based for the leftmost node, and increases by 1 for each node to the right.
    // Is a depth compressed, the x-coordinates of all nodes are the same as the leftmost node of that depth.
    set_virtual_x_coordinates() {
        let current_x = -1;
        let current_depth = this.graph.nodes[0].get_depth();
        let current_state = this.graph.nodes[0].get_state();
        this.graph.nodes.forEach(node => {
            if (!(node.get_depth() === current_depth && node.get_state() == State["Fully Compressed"])) {
                current_x += 1;
            }
            current_depth = node.get_depth();
            current_state = node.get_state();
            node.set_x(current_x);
        });
    }

    compress_unc_nodes_by_depth(node) {
        const depth = node.get_depth();
        const state = node.get_state();
        if (state === State.Uncompressed) {
            const nodes = this.graph.nodes.filter(node => node.get_depth() === depth);
            nodes.forEach(node => {
                node.set_state(State["Fully Compressed"]);
            });
        } else if (state == State["Fully Compressed"]) {
            const nodes = this.graph.nodes.filter(node => node.get_depth() === depth);
            nodes.forEach(node => {
                node.set_state(State.Uncompressed);
            });
        }
    }

    effective_node_count() {
        let count = 0;
        let current_depth = this.graph.nodes[0].get_depth();
        let current_state = this.graph.nodes[0].get_state();
        this.graph.nodes.forEach(node => {
            if (!(node.get_depth() === current_depth && node.get_state() == State["Fully Compressed"])) {
                count += 1;
            }
            current_depth = node.get_depth();
            current_state = node.get_state();
        });
        return count;
    }

}
