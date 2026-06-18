import argparse
import json
from pathlib import Path


def convert_edges(input_path: Path, output_path: Path | None = None) -> int:
    """Rewrite edge list JSON to nest weight under an attrs object.

    The input JSON is expected to be a list of objects containing
    at least "source", "target", and "weight" keys.
    """
    input_path = Path(input_path)
    output_path = Path(output_path) if output_path else input_path

    raw = json.loads(input_path.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        raise ValueError("Input JSON must be a list of edge objects")

    converted: list[dict] = []
    for idx, edge in enumerate(raw, start=1):
        if not isinstance(edge, dict):
            raise ValueError(f"Edge at index {idx} is not an object")
        if "weight" not in edge:
            raise ValueError(f"Edge at index {idx} missing 'weight'")

        weight = edge["weight"]
        # Preserve other fields but swap weight for attrs.
        new_edge = {k: v for k, v in edge.items() if k != "weight"}
        new_edge["attrs"] = {"weight": weight}
        converted.append(new_edge)

    output_path.write_text(json.dumps(converted, indent=2), encoding="utf-8")
    return len(converted)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Convert edge JSON so that each edge has an 'attrs' object "
            "containing the original weight."
        )
    )
    parser.add_argument("input", type=Path, help="Path to input edges JSON file")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        help="Optional output file (defaults to overwriting the input)",
    )
    args = parser.parse_args()

    count = convert_edges(args.input, args.output)
    print(f"Converted {count} edges -> {args.output or args.input}")


if __name__ == "__main__":
    main()
