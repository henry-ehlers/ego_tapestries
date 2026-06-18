// copied and adapted from https://github.com/d3/d3-force/blob/main/src/y.js
// documented at https://d3js.org/d3-force/position#forceY

function constant(x) {
  return function () {
    return x;
  };
}

export default function (y, node_depth) {
  var strength = constant(0.1),
    nodes,
    strengths,
    yz;

  if (typeof y !== "function") y = constant(y == null ? 0 : +y);
  if (node_depth == null) node_depth = null; // null means apply to all nodes

  function force(alpha) {
    for (var i = 0, n = nodes.length, node; i < n; ++i) {
      var node = nodes[i];

      // Skip nodes that don't match the specified depth
      if (node_depth !== null && node.depth !== node_depth) continue;

      node.vy += (yz[i] - node.y) * strengths[i] * alpha;
    }
  }

  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length;
    strengths = new Array(n);
    yz = new Array(n);
    for (i = 0; i < n; ++i) {
      strengths[i] = isNaN(yz[i] = +y(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes);
    }
  }

  force.initialize = function (_) {
    nodes = _;
    initialize();
  };

  force.strength = function (_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant(+_), initialize(), force) : strength;
  };

  force.y = function (_) {
    return arguments.length ? (y = typeof _ === "function" ? _ : constant(+_), initialize(), force) : y;
  };

  return force;
}
