import json
import os

role_type_ids = {}

for file in os.listdir('./dos_games'):
    with open('./dos_games/' + file) as json_data:
        ugly_data = json.load(json_data)
        for game in ugly_data:
            platforms = game['platforms']
            #game_id = 'G' + str(game['game_id'])
            for platform in platforms:
                credits = platform['credits']
                for credits_entry in credits:
                    role = credits_entry['role']
                    role_type = credits_entry['role_type']
                    if role_type is None:
                        continue
                    role_type_id = 'R' + str(credits_entry['role_type_id'])
                    role_type_ids[role_type_id] = role_type

with open('./dos_game_roles.tsv', 'w+') as tsv:
    for role_type_id, role_type in role_type_ids.iteritems():
        tsv_line = role_type_id + '\t' + role_type
        print(tsv_line)
        tsv.write(tsv_line + '\n')
