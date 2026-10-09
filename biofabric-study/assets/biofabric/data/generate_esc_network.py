import json
import pathlib


ROOT = pathlib.Path(__file__).parent

PERFORMER_CODES = [
    "AT",
    "IL",
    "EE",
    "SE",
    "IT",
    "GR",
    "FR",
    "AL",
    "UA",
    "CH",
    "FI",
    "NL",
    "LV",
    "PL",
    "DE",
    "LT",
    "MT",
    "NO",
    "GB",
    "AM",
    "PT",
    "LU",
    "DK",
    "ES",
    "IS",
    "SM",
    "CY",
    "AU",
    "HR",
    "CZ",
    "IE",
    "RS",
    "GE",
    "SI",
    "BE",
    "ME",
    "AZ",
]

WEST_EUROPE_CODES = {"FR", "GB", "IE", "IS", "MT", "PT", "ES"}
CENTRAL_EUROPE_CODES = {"AT", "CH", "CZ", "DE", "IT", "SI", "SM", "LU", "NL", "BE"}
EAST_EUROPE_CODES = {"AL", "EE", "GR", "LT", "LV", "ME", "PL", "RS", "HR", "UA"}
SCANDINAVIA_CODES = {"DK", "FI", "NO", "SE"}
ASIA_CODES = {"AM", "AZ", "CY", "GE", "IL"}
OCEANIA_CODES = {"AU"}


def group_for(code):
    if code in WEST_EUROPE_CODES:
        return "west europe"
    if code in CENTRAL_EUROPE_CODES:
        return "central europe"
    if code in EAST_EUROPE_CODES:
        return "east europe"
    if code in SCANDINAVIA_CODES:
        return "scandinavia"
    if code in ASIA_CODES:
        return "asia"
    if code in OCEANIA_CODES:
        return "oceania"
    raise ValueError(f"No geographic group configured for {code}")


def main():
    countries = json.loads((ROOT / "esc-countries.json").read_text())
    results = json.loads((ROOT / "esc-final.json").read_text())["performances"]
    country_by_contestant = dict(enumerate(PERFORMER_CODES))
    participating_codes = {
        country
        for performance in results
        for score in performance["scores"]
        if score["name"] == "total"
        for country in score["votes"]
        if country in countries
    }
    participating_codes.update(country_by_contestant.values())

    graph = {
        "nodes": [
            {"id": code, "label": name, "group": group_for(code), "level": 1}
            for code, name in countries.items()
            if code in participating_codes
        ],
        "links": [],
    }

    for performance in results:
        target = country_by_contestant[performance["contestantId"]]
        total = next(
            score for score in performance["scores"] if score["name"] == "total"
        )
        for source, weight in total["votes"].items():
            if source in participating_codes and weight:
                source_group = group_for(source)
                target_group = group_for(target)
                graph["links"].append(
                    {
                        "source": source,
                        "target": target,
                        "group": (
                            f"{source_group} group"
                        ),
                        "weight": weight,
                        "label": f"{countries[source]} to {countries[target]}",
                    }
                )

    (ROOT / "esc-network.json").write_text(json.dumps(graph, indent=2) + "\n")


if __name__ == "__main__":
    main()
