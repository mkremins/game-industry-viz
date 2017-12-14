import json
import os

filepath = "../games/"

with open('./dos_game_stream.tsv', 'w+') as tsv:
    for file in os.listdir(filepath + 'dos_games'):
        with open(filepath + 'dos_games/' + file) as json_data:
            ugly_data = json.load(json_data)
            for game in ugly_data:
                platforms = game['platforms']
                game_id = 'G' + str(game['game_id'])
                for platform in platforms:
                    credits = platform['credits']
                    release_date = platform['releases'][0]['release_date']
                    platform_name = platform['platform_name']
                    platform_id = platform['platform_id']
                    for credits_entry in credits:
                        role_type_id = credits_entry['role_type_id']
                        if role_type_id is None:
                            continue
                        role_type_id = 'R' + str(role_type_id)
                        for credit in credits_entry['credits']:
                            dev_id = credit['developer_id']
                            if dev_id is None:
                                continue
                            dev_id = 'D' + str(dev_id)
                            tsv_line = game_id + '\t' + dev_id + '\t' + role_type_id + '\t' + release_date + '\t' + platform_id + '\t' + platform_name
                            print(tsv_line)
                            tsv.write(tsv_line + '\n')
