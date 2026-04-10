import json
import os
import copy
from counter import get_performance_count

PERFORMERS_PATH : str = "data/members.json"
INPUT_PATH : str = "data/formatted_results.json"

def read_json_file(file_path):
    """
    Reads a JSON file and returns its contents as a Python object.
    
    :param file_path: Path to the JSON file
    :return: Parsed JSON data (dict or list) or None if an error occurs
    """
    # Check if file exists
    if not os.path.isfile(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return None

    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)  # Parse JSON into Python object
            return data
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format in '{file_path}'. Details: {e}")
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
    
    return None

def simplify_results(l : list) -> list:
    unique_set  = {make_hashable(d) for d in results}
    unique_dicts = [make_dict(t) for t in unique_set]
    unique_dicts = [remove_counts(d) for d in unique_dicts]
    unique_dicts = [move_members(d) for d in unique_dicts]
    return unique_dicts

def make_hashable(d):
    return tuple(
        (k, tuple(
            (k2, tuple(sorted(v2)) if isinstance(v2, list) else v2)
            for k2, v2 in sorted(v.items())
        ))
        for k, v in sorted(d.items())
    )

def make_dict(t):
    return {
        k: {k2: list(v2) if isinstance(v2, tuple) else v2 for k2, v2 in v}
        for k, v in t
    }

def remove_counts(d):
    return {
        k: {k2: v2 for k2, v2 in v.items() if k2 != "count"}
        for k, v in d.items()
    }

def move_members(d):
    return {
        k: v["members"]
        for k, v, in d.items()
    }

def add_member(performer_ids : dict, remaining_performers : list, position_count : dict) -> dict:
    lineups : list = []
   
    # If there are no more remaining performers
    if len(remaining_performers) == 0:

        return [position_count]
    
    # If there are no more needed positions, return empty
    is_finished : bool = True
    for count in position_count.values():
        if count != 1:
            is_finished = False
    
    if is_finished:
        return [position_count]
    
    for performer in remaining_performers:
        for pid in performer_ids[performer]:
            if position_count[pid]["count"] != 0:
                
                _performers : list = copy.deepcopy(remaining_performers)
                _counts : dict = copy.deepcopy(position_count)
                
                _counts[pid]["members"].append(performer)
                _counts[pid]["count"] -= 1
                _performers.remove(performer)
                
                # Check if complete
                if is_complete_roster(_counts):
                    return [_counts]
                
                results : list = add_member(performer_ids, _performers, _counts)
                for result in results:
                    if is_complete_roster(result):
                        lineups.append(result)
                
    return lineups

def is_complete_roster(counts : dict) -> bool:
    
    for position, data in counts.items():
        if data["count"] != 0:
            return False
    return True

def score_lineups(lineups : list[dict]) -> list:
    
    results : list = []
    performance_count : dict = get_performance_count()
    for lineup in lineups:
        entry : dict = {"score": 0, "lineup": lineup}
        
        for members in lineup.values():
            for member in members:
                entry["score"] += performance_count.get(member, 0)
        results.append(entry)
    
    sorted_data = sorted(results, key=lambda x: x['score'])

    return sorted_data

if __name__ == "__main__":
    submission_data : dict = read_json_file(INPUT_PATH)
    performer_ids : dict = read_json_file(PERFORMERS_PATH)
    lion_count : int = int(input("How Many Lions: "))
    position_count : dict = {
        "drum": {
            "count": 1,
            "members": []
        },
        "cymbal": {
            "count": 1,
            "members": []
        },
        "head": {
            "count": lion_count,
            "members": []
        },
        "tail":  {
            "count": lion_count,
            "members": []
        }
    }
    
    lineups : dict = {}
    for performance_name, submission in submission_data.items():

        results : list = add_member(performer_ids, submission["Free"], position_count)
        lineups[performance_name] = simplify_results(results)
    
    for performance_name, lineup_options in lineups.items():
        rated_lineups = score_lineups(lineup_options)
        
        print(performance_name)
        for lineup in rated_lineups:
            print(lineup)
        