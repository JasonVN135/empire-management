import json
import os

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

data : dict = read_json_file("data/user_submissions.json")

performance_results : dict = {}

for submission in data:
    name : str = submission["name"]
    for entry in submission["performances"]:
        if entry["id"] not in performance_results:
            performance_results[entry["id"]] = {
                "Free": [],
                "Maybe": [],
                "Busy": []
            }
        
        performance_results[entry["id"]][entry["availability"]].append(name)

with open("data/formatted_results.json", "w") as f:
    json.dump(performance_results, f, indent=4, ensure_ascii=False)