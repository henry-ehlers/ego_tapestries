"""Find all shortest paths containing exactly three edges in a Rome graph.

Example:
    python shortestpath.py selected-rome-data/small/grafo1819.22.json
"""

import argparse
import json
from itertools import combinations, permutations
from pathlib import Path
from typing import Any

import networkx as nx


def load_graph(path: Path, directed: bool = False) -> nx.Graph:
    """Load a graph stored in the project's node-link JSON format."""
    with path.open(encoding="utf-8") as graph_file:
        data: dict[str, Any] = json.load(graph_file)

    graph: nx.Graph = nx.DiGraph() if directed else nx.Graph()
    graph.add_nodes_from(node["id"] for node in data.get("nodes", []))
    graph.add_edges_from(
        (link["source"], link["target"]) for link in data.get("links", [])
    )
    return graph


def shortest_paths_of_length(
    graph: nx.Graph, length: int = 3
) -> list[dict[str, Any]]:
    """Return every shortest path whose distance is exactly ``length``.

    For undirected graphs, each pair of endpoints is returned once. If several
    shortest paths connect the same pair, all of them are included.
    """
    if length < 0:
        raise ValueError("Path length must be non-negative")

    nodes = sorted(graph.nodes, key=str)
    endpoint_pairs = (
        permutations(nodes, 2) if graph.is_directed() else combinations(nodes, 2)
    )
    paths: list[dict[str, Any]] = []

    for source, target in endpoint_pairs:
        try:
            distance = nx.shortest_path_length(graph, source, target)
        except nx.NetworkXNoPath:
            continue

        if distance != length:
            continue

        paths.extend(
            {
                "source": source,
                "target": target,
                "path": path,
            }
            for path in nx.all_shortest_paths(graph, source, target)
        )

    return paths


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Find all shortest paths containing exactly three edges."
    )
    parser.add_argument("graph", type=Path, help="Path to a Rome graph JSON file")
    parser.add_argument(
        "--length",
        type=int,
        default=3,
        help="Required shortest-path length in edges (default: 3)",
    )
    parser.add_argument(
        "--directed",
        action="store_true",
        help="Treat links as directed instead of undirected",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        help="Write results to this JSON file instead of stdout",
    )
    args = parser.parse_args()

    graph = load_graph(args.graph, directed=args.directed)
    paths = shortest_paths_of_length(graph, length=args.length)
    result = {
        "graph": str(args.graph),
        "directed": args.directed,
        "length": args.length,
        "node_count": graph.number_of_nodes(),
        "edge_count": graph.number_of_edges(),
        "path_count": len(paths),
        "paths": paths,
    }
    output = json.dumps(result, indent=2) + "\n"

    if args.output:
        args.output.write_text(output, encoding="utf-8")
    else:
        print(output, end="")


if __name__ == "__main__":
    main()