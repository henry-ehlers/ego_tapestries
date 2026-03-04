export class Matrix {
    constructor(graph) {
        this.graph = graph;
        this.sort_nodes_by_depth();
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
    }
}
