import itertools
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
#
# only an estimate answer, so no solution


biofabric_website_base = rvt.component(
    component_name__="website_base",
    type="website",
    path="biofabric-study/assets/biofabric/index.html",
    instructionLocation="aboveStimulus",
)

# TASK 1: Select all adjacent nodes of a given node.

task1_response_base = rvt.response(
    type="reactive",
    id=REVISIT_REACTIVE_RESPONSE_ID,
    prompt="### How to answer\n Click on the nodes to select them. Submit your answer once you select all the adjacent nodes. Your selected nodes:",
    required=True,
    location="belowStimulus",
)


task1_base = rvt.component(
    component_name__="task1_base",
    base__=biofabric_website_base,
    response=[task1_response_base],
    # description= (details filled in by generate_task1_component)
    # instruction= (details filled in by generate_task1_component)
)


def generate_task1_component(graph_file: str, solution: dict, path_prefix: str = "./"):
    return rvt.component(
        component_name__=f"task1_component_{graph_file}",
        base__=task1_base,
        description=f"Locate and select all adjacent nodes of node {solution['given']}.",
        instruction=f"### Task 1\nLocate and select all adjacent nodes of node {solution['given']}.",
        parameters={
            "graphDataPath": f"{path_prefix}/{graph_file}",
            "givenNode": solution["given"],
        },
        provideFeedback=False,
        correctAnswer=[
            rvt.answer(id=REVISIT_REACTIVE_RESPONSE_ID, answer=solution["adjacent"])
        ],
    )


# TASK 2: Identify the shortest path between two nodes.

task2_response_base = rvt.response(
    type="reactive",
    id=REVISIT_REACTIVE_RESPONSE_ID,
    prompt="### How to answer\n Click on the nodes to select them. Submit your answer once you select the entire path.",
    required=True,
    location="belowStimulus",
)

task2_base = rvt.component(
    component_name__="task2_base",
    base__=biofabric_website_base,
    response=[task2_response_base],
    # description= (details filled in by generate_task1_component)
    # instruction= (details filled in by generate_task1_component)
)


def generate_task2_component(graph_file: str, path_prefix: str = "./"):
    # todo: this is currently a dummy implementation
    return rvt.component(
        component_name__=f"task2_component_{graph_file}",
        base__=task2_base,
        description="Identify the shortest path between two nodes.",
        instruction="### Task 2\nIdentify the shortest path between two nodes.",
        parameters={
            "graphDataPath": f"{path_prefix}/{graph_file}",
            "givenNode": "Amelia",  # todo: change to random node
            "targetNode": "Ethan",  # todo: change to random node
        },
        provideFeedback=False,
    )


# TASK 3: Estimate the number of edges in the graph.

task3_response_base = rvt.response(
    type="numerical",
    id="task3-numerical",
    prompt="### How to answer\n Enter the number of your estimate in the field below and submit. Your numerical estimate of the number of edges:",
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
        instruction="### Task 3\nEstimate the number of edges in the graph.",
        parameters={
            "graphDataPath": f"{path_prefix}/{graph_file}",
        },
        provideFeedback=False,
    )


def generate_intro_sequence():

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

    return rvt.sequence(
        order="fixed",
        components=[
            intro_introduction,
            intro_tutorial,
            intro_graph_terminology_biofabric,
        ],
    )


def get_graph_perumtations():
    """
    Returns a list of all possible permutations of the task variations.
    """

    ROME_GRAPH_FILES_THIRD_1 = ROME_GRAPH_FILES_LARGE[:3]
    ROME_GRAPH_FILES_THIRD_2 = ROME_GRAPH_FILES_LARGE[3:6]
    ROME_GRAPH_FILES_THIRD_3 = ROME_GRAPH_FILES_LARGE[6:9]

    TASK_1_SOLUTIONS_THIRD_1 = TASK_1_SOLUTIONS[:3]
    TASK_1_SOLUTIONS_THIRD_2 = TASK_1_SOLUTIONS[3:6]
    TASK_1_SOLUTIONS_THIRD_3 = TASK_1_SOLUTIONS[6:9]

    perms = list(
        itertools.permutations(
            [
                {
                    "graph_files": ROME_GRAPH_FILES_THIRD_1,
                    "solutions": TASK_1_SOLUTIONS_THIRD_1,
                },
                {
                    "graph_files": ROME_GRAPH_FILES_THIRD_2,
                    "solutions": TASK_1_SOLUTIONS_THIRD_2,
                },
                {
                    "graph_files": ROME_GRAPH_FILES_THIRD_3,
                    "solutions": TASK_1_SOLUTIONS_THIRD_3,
                },
            ]
        )
    )
    return perms


def generate_task1_sequence(graphs_subset):
    task1_random_sequence = rvt.sequence(
        order="random",
        components=[
            generate_task1_component(
                graph_file, solution, path_prefix="./data/selected-rome-data/large/"
            )
            for graph_file, solution in zip(
                graphs_subset["graph_files"], graphs_subset["solutions"]
            )
        ],
    )

    task1_outer_fixed = rvt.sequence(order="fixed", components=[])
    task1_outer_fixed += task1_random_sequence
    task1_outer_fixed += rvt.sequence(
        order="fixed", components=["$nasa-tlx.components.nasa-tlx"]
    )
    return task1_outer_fixed


def generate_task2_sequence(graph_perm):
    task2_random_sequence = rvt.sequence(
        order="random",
        components=[
            generate_task2_component(
                graph_file, path_prefix="./data/selected-rome-data/large/"
            )
            for graph_file in graph_perm["graph_files"]
        ],
    )

    task2_outer_fixed = rvt.sequence(order="fixed", components=[])
    task2_outer_fixed += task2_random_sequence
    task2_outer_fixed += rvt.sequence(
        order="fixed", components=["$nasa-tlx.components.nasa-tlx"]
    )
    return task2_outer_fixed


def create_task3_sequence(graph_perm):
    task3_random_sequence = rvt.sequence(
        order="random",
        components=[
            generate_task3_component(
                graph_file, path_prefix="./data/selected-rome-data/large/"
            )
            for graph_file in graph_perm["graph_files"]
        ],
    )

    task3_outer_fixed = rvt.sequence(order="fixed", components=[])
    task3_outer_fixed += task3_random_sequence
    task3_outer_fixed += rvt.sequence(
        order="fixed", components=["$nasa-tlx.components.nasa-tlx"]
    )
    return task3_outer_fixed


def generate_random_task_seqeuence():
    """
    Splits the 9 graphs such that no graphs are repeated for any tasks per participant,
    while making sure all graphs can appear in all tasks.

    This is done by splitting the 9 graphs into 3 groups of 3 graphs each,
    and then permuting the order of the groups for each task.
    The final sequence is a latin square of the 3 groups, with each group appearing in a different order for each task.
    """

    # the latin square sequence ensures that each variation of the tasks appears equally often across participants.
    latin_square_sequence = rvt.sequence(
        order="latinSquare", numSamples=1, components=[]
    )

    graph_permutations = get_graph_perumtations()

    for i, graph_permutation in enumerate(graph_permutations):
        task1_sequence = generate_task1_sequence(graph_permutation[0])
        task2_sequence = generate_task2_sequence(graph_permutation[1])
        task3_sequence = create_task3_sequence(graph_permutation[2])

        # the variations are wrapped in a random sequence
        # to ensure that the order of the tasks is random.
        random_sequence = rvt.sequence(
            id=f"random_sequence_permutation_{i}",
            order="random",
            components=[],
        )
        # these additions need to be separated, otherwise they will be attached
        # as children to each other, breaking the sequence structure.
        random_sequence += task1_sequence
        random_sequence += task2_sequence
        random_sequence += task3_sequence

        latin_square_sequence += random_sequence

    return latin_square_sequence


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
    description="Working with collapsible BioFabric",  # todo
    organizations=["TU Wien"],
)

ui_config = rvt.uiConfig(
    helpTextPath="biofabric-study/assets/help.md",
    logoPath="revisitAssets/revisitLogoSquare.svg",
    contactEmail="your@email.com",  # todo
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
        sequence=generate_intro_sequence() + generate_random_task_seqeuence(),
        importedLibraries=["nasa-tlx"],
    )

    print(study)


if __name__ == "__main__":
    main()
