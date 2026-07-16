import revisitpy as rvt

GRAPH_EDGE_LIST_FILES = [f"graph_{i:02}_edge_list.json" for i in range(1, 21)]

selected_answer_response = rvt.response(
    type="reactive",
    id="graphVis",
    prompt="Your selected answer:",
    required=True,
    location="belowStimulus",
)

website_base = rvt.component(
    component_name__="website_base",
    type="website",
    path="graph-vis-study/assets/ego_tapes/revisit.html",
    instructionLocation="aboveStimulus",
)

task1_base = rvt.component(
    component_name__="task1_base",
    base__=website_base,
    response=[selected_answer_response],
    description="Locate the node, which is not the ego, with the largest number of neighbors.",
    instruction="# Task 1\nLocate the node, which is not the ego, with the largest number of neighbors.\n## How to answer\n Click on the alter to select the answer.",
)

task2_base = rvt.component(
    component_name__="task2_base",
    base__=website_base,
    response=[
        rvt.response(
            id="task2",
            prompt="Identify the shortest path between two nodes",
            type="numerical",
        )
    ],
    description="Identify the shortest path between two nodes",
    instruction="# Task 2\nIdentify the shortest path between two nodes\n## How to answer\n Enter the number of edges of the path between those two nodes below.",
)

# decided against task3

task4_base = rvt.component(
    component_name__="task4_base",
    base__=website_base,
    response=[
        rvt.response(
            id="task4",
            prompt="Estimate/Count the number of nodes in alter level 2.",
            type="numerical",
        )
    ],
    description="Estimate/Count the number of nodes in alter level 2.",
    instruction="# Task 4\nEstimate/Count the number of nodes in alter level 2.\n## How to answer\n Enter the number of nodes below.",
)

task5_base = rvt.component(
    component_name__="task5_base",
    base__=website_base,
    response=[
        rvt.response(
            id="task5",
            prompt="Estimate the number of edges between all nodes of alter level 2.",
            type="numerical",
        )
    ],
    description="Estimate the number of edges between all nodes of alter level 2.",
    instruction="# Task 5\nEstimate the number of edges between all nodes of alter level 2.\n## How to answer\n Enter the number of edges below.",
)

task6_base = rvt.component(
    component_name__="task6_base",
    base__=website_base,
    response=[selected_answer_response],
    description="Given two nodes, identify their common neighbors.",
    instruction="# Task 6\nGiven two nodes, identify their common neighbors.\n## How to answer\n Click on the nodes to select them",
)

task7_base = rvt.component(
    component_name__="task7_base",
    base__=website_base,
    response=[
        rvt.response(
            id="task7",
            prompt="Which alter level is the largest?",
            type="numerical",
        )
    ],
    description="Which alter level is the largest?",
    instruction="# Task 7\nWhich alter level is the largest?\n## How to answer\n Enter the number below.",
)

task8_base = rvt.component(
    component_name__="task8_base",
    base__=website_base,
    response=[selected_answer_response],
    description="Follow the path p from node v to node u.",
    instruction="# Task 8\nFollow the path p from node v to node u.\n## How to answer\n Click on all nodes on the path",
)


tutorial_biofabric_task1 = rvt.component(
    component_name__="tutorial_biofabric_task1",
    base__=task1_base,
    parameters={
        "graphDataPath": "./data/star_wars_4_adapted.edges.json",
        "visualizationStyle": "biofabric",
    },
    provideFeedback=True,
    correctAnswer=[rvt.answer(id="graphVis", answer=[3])],
)


def main() -> None:
    print(tutorial_biofabric_task1)
    print(task2_base)
    print(task6_base)
    print(task7_base)
    print(task8_base)


if __name__ == "__main__":
    main()
