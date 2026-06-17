
// copied and adapted from https://github.com/d3/d3-force/blob/main/src/radial.js
// documented at https://d3js.org/d3-force/position#forceRadial

function constant(x) {
    return function () {
        return x;
    };
}

export default function (radius, x, y, node_depth) {
    var nodes,
        strength = constant(0.1),
        strengths,
        radiuses;

    if (typeof radius !== "function") radius = constant(+radius);
    if (x == null) x = 0;
    if (y == null) y = 0;
    if (node_depth == null) node_depth = null; // null means apply to all nodes

    function force(alpha) {
        for (var i = 0, n = nodes.length; i < n; ++i) {
            var node = nodes[i];

            // Skip nodes that don't match the specified depth
            if (node_depth !== null && node.depth !== node_depth) continue;

            var dx = node.x - x || 1e-6,
                dy = node.y - y || 1e-6,
                r = Math.sqrt(dx * dx + dy * dy),
                k = (radiuses[i] - r) * strengths[i] * alpha / r;
            node.vx += dx * k;
            node.vy += dy * k;
        }
    }

    function initialize() {
        if (!nodes) return;
        var i, n = nodes.length;
        strengths = new Array(n);
        radiuses = new Array(n);
        for (i = 0; i < n; ++i) {
            radiuses[i] = +radius(nodes[i], i, nodes);
            strengths[i] = isNaN(radiuses[i]) ? 0 : +strength(nodes[i], i, nodes);
        }
    }

    force.initialize = function (_) {
        nodes = _, initialize();
    };

    force.strength = function (_) {
        return arguments.length ? (strength = typeof _ === "function" ? _ : constant(+_), initialize(), force) : strength;
    };

    force.radius = function (_) {
        return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), initialize(), force) : radius;
    };

    force.x = function (_) {
        return arguments.length ? (x = +_, force) : x;
    };

    force.y = function (_) {
        return arguments.length ? (y = +_, force) : y;
    };

    force.depth = function (_) {
        return arguments.length ? (node_depth = _ === null ? null : +_, force) : node_depth;
    };

    return force;
}
