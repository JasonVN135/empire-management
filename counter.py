import json

ARCHIVE_PATH : str = "data/archive.json"
LINEUPS_PATH : str = "data/lineups.json"

def get_performance_count(archive_path=ARCHIVE_PATH, lineup_path=LINEUPS_PATH) -> dict:
    
    performance_count : dict[str, int] = {}

    with open(archive_path, "r") as f:
        output = json.load(f)
        
        for performance in output:
            for performers in performance["performers"].values():
                for performer in performers:
                    if performer not in performance_count:
                        performance_count[performer] = 0
                    performance_count[performer] += 1

    with open(lineup_path, "r") as f:
        output = json.load(f)
        
        for performance in output:
            for performers in performance["performers"].values():
                for performer in performers:
                    if performer not in performance_count:
                        performance_count[performer] = 0
                    performance_count[performer] += 1

    performance_count = dict(sorted(performance_count.items(), key=lambda item: item[1], reverse=True))
    return performance_count
    
if __name__ == "__main__":
    print(get_performance_count())