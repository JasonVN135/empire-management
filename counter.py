import json


performance_count : dict[str, int] = {}


with open("data/archive.json", "r") as f:
    output = json.load(f)
    
    for performance in output:
        for performers in performance["performers"].values():
            for performer in performers:
                if performer not in performance_count:
                    performance_count[performer] = 0
                performance_count[performer] += 1

with open("data/lineups.json", "r") as f:
    output = json.load(f)
    
    for performance in output:
        for performers in performance["performers"].values():
            for performer in performers:
                if performer not in performance_count:
                    performance_count[performer] = 0
                performance_count[performer] += 1

performance_count = dict(sorted(performance_count.items(), key=lambda item: item[1], reverse=True))
print(performance_count)