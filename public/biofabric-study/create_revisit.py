import os

import revisitpy as rvt

REVISIT_PY_BASE_DATA_PATH = "assets/biofabric/data"

REVISIT_REACTIVE_RESPONSE_ID = "graphVis"

ROME_GRAPH_FILES_LARGE = [
    x
    for x in os.listdir(f"{REVISIT_PY_BASE_DATA_PATH}/selected-rome-data/large")
    if x.endswith(".json")
]
ROME_GRAPH_FILES_LARGE.sort()


ROME_GRAPH_FILES_SMALL = [
    x
    for x in os.listdir(f"{REVISIT_PY_BASE_DATA_PATH}/selected-rome-data/small")
    if x.endswith(".json")
]
ROME_GRAPH_FILES_SMALL.sort()

# TASK 1: Select all adjacent nodes of a given node.

TASK_1_SOLUTIONS = [  # in order of the graph files in ROME_GRAPH_FILES_LARGE
    # 4286
    {"given": "Amelia", "adjacent": ["Adrian"]},
    # 4481
    {"given": "Olivia", "adjacent": ["Amelia", "Ethan"]},
    # 4672
    {
        "given": "Ethan",
        "adjacent": [
            "Noah",
            "Olivia",
            "Ava",
            "Sophia",
            "Sebastian",
            "Hannah",
            "Victoria",
        ],
    },
    # 7907
    {"given": "Liam", "adjacent": ["Amelia", "Ethan", "Leah", "Gabriel"]},
    # 8127
    {
        "given": "Caleb",
        "adjacent": ["Mason", "Mia", "James", "Henry", "Scarlett", "Layla", "Dylan"],
    },
    # 8142
    {"given": "Layla", "adjacent": ["Nora", "Anthony", "Ellie"]},
    # 8961
    {"given": "Gabriel", "adjacent": ["Henry", "Matthew", "Aria"]},
    # 9163
    {"given": "Julian", "adjacent": ["Noah", "Lucas", "Mia", "Matthew", "Wyatt"]},
    # 9691
    {"given": "Naomi", "adjacent": ["Luke", "Nathan", "Connor"]},
]

# TASK 2: Identify the shortest path between two nodes.

# TASK 3: Estimate the number of edges in the graph.


biofabric_website_base = rvt.component(
    component_name__="website_base",
    type="website",
    path="biofabric-study/assets/biofabric/index.html",
    instructionLocation="aboveStimulus",
)

task1_response_base = rvt.response(
    type="reactive",
    id=REVISIT_REACTIVE_RESPONSE_ID,
    prompt="Your selected nodes:",
    required=True,
    location="belowStimulus",
)


task1_base = rvt.component(
    component_name__="task1_base",
    base__=biofabric_website_base,
    response=[task1_response_base],
    # description=
    # instruction=
)


def generate_task1_component(graph_file: str, solution: dict, path_prefix: str = "./"):
    return rvt.component(
        component_name__=f"task1_component_{graph_file}",
        base__=task1_base,
        description=f"Locate and select all adjacent nodes of node {solution['given']}.",
        instruction=f"# Task 1\nLocate and select all adjacent nodes of node {solution['given']}.\n## How to answer\n Click on the nodes to select them. Submit your answer once you select all the adjacent nodes.",
        parameters={
            "graphDataPath": f"{path_prefix}/{graph_file}",
            "givenNode": solution["given"],
        },
        provideFeedback=False,
        correctAnswer=[
            rvt.answer(id=REVISIT_REACTIVE_RESPONSE_ID, answer=solution["adjacent"])
        ],
    )


task1_components = [
    generate_task1_component(
        graph_file, solution, path_prefix="./data/selected-rome-data/large/"
    )
    for graph_file, solution in zip(ROME_GRAPH_FILES_LARGE, TASK_1_SOLUTIONS)
]


task1_sequence = rvt.sequence(order="random", numSamples=3, components=task1_components)

# TASK 3: Estimate the number of edges in the graph.

task3_response_base = rvt.response(
    type="numerical",
    id="task3-numerical",
    prompt="Your numerical estimate of the number of edges:",
    required=True,
    location="belowStimulus",
)

task3_base = rvt.component(
    component_name__="task3_base",
    base__=biofabric_website_base,
    response=[task3_response_base],
)


def generate_task3_component(graph_file: str, path_prefix: str = "./"):
    return rvt.component(
        component_name__=f"task3_component_{graph_file}",
        base__=task3_base,
        description="Estimate the number of edges in the graph.",
        instruction="# Task 3\nEstimate the number of edges in the graph.\n## How to answer\n Enter the number of your estimate in the field below and submit.",
        parameters={
            "graphDataPath": f"{path_prefix}/{graph_file}",
        },
        provideFeedback=False,
    )


task3_components = [
    generate_task3_component(graph_file, path_prefix="./data/selected-rome-data/large/")
    for graph_file in ROME_GRAPH_FILES_LARGE
]

task3_sequence = rvt.sequence(order="random", numSamples=3, components=task3_components)


intro_introduction = rvt.component(
    component_name__="intro_introduction",
    type="markdown",
    path="biofabric-study/assets/introduction.md",
)

intro_tutorial = rvt.component(
    component_name__="intro_tutorial",
    type="markdown",
    path="biofabric-study/assets/tutorial.md",
)

intro_graph_terminology_biofabric = rvt.component(
    component_name__="intro_graph_terminology_biofabric",
    type="markdown",
    path="biofabric-study/assets/graph_terminology_biofabric.md",
)


study_metadata = rvt.studyMetadata(
    title="BioFabric Study",
    version="pilot",
    authors=[
        "Sara Di Bartolomeo",
        "Daniel Pahr",
        "Velitchko Filipov",
        "Henry Ehlers",
        "Johann Sebastian Schicho",
    ],
    date="2026-02-23",
    description="Working with collapsible BioFabric",
    organizations=["TU Wien"],
)

ui_config = rvt.uiConfig(
    helpTextPath="biofabric-study/assets/help.md",
    logoPath="revisitAssets/revisitLogoSquare.svg",
    contactEmail="your@email.com",
    withProgressBar=True,
    showNavigationButtons=True,
    showComponentTitles=True,
    withSidebar=False,
)


def main() -> None:
    study = rvt.studyConfig(
        schema="https://raw.githubusercontent.com/revisit-studies/study/main/src/parser/StudyConfigSchema.json",
        uiConfig=ui_config,
        studyMetadata=study_metadata,
        sequence=rvt.sequence(
            order="fixed",
            components=[
                intro_introduction,
                intro_tutorial,
                intro_graph_terminology_biofabric,
            ],
        )
        + task1_sequence
        + task3_sequence,
        importedLibraries=["nasa-tlx"],
    )

    print(study)


if __name__ == "__main__":
    main()
