import json
import random
import argparse


def load_json_file(file_path):
    with open(file_path, "r") as f:
        data = json.load(f)
    return data


def get_edge_list(data):
    edge_list = data.get("edges", [])
    return edge_list


def only_source_target(edge_list):
    for edge in edge_list:
        edge = {k: v for k, v in edge.items() if k in ["source", "target"]}
    return edge_list


def introduce_random_weight(edge_list):
    for edge in edge_list:
        edge["attrs"] = {"weight": random.randint(1, 10)}
    return edge_list


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Convert edge JSON to edge list with random weights."
    )
    parser.add_argument(
        "input", type=str, nargs="+", help="Path to input edges JSON file"
    )

    args = parser.parse_args()

    for input_file in args.input:
        output_file = input_file.replace(".json", "_edge_list.json")
        data = load_json_file(input_file)
        edge_list = get_edge_list(data)
        edge_list = only_source_target(edge_list)
        edge_list = introduce_random_weight(edge_list)

        with open(output_file, "w") as f:
            json.dump(edge_list, f, indent=2)
