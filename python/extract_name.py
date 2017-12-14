import json
import os

filepath = "../games/"
filepath = "J:/Isaac/School/2017/Classes/CMPM290A/mobygames/dataset/"
directory = 'dos_games'
directory = 'all'

with open('./all_game_dev_names.tsv', 'w+', encoding='utf8') as tsv:
    for file in os.listdir(filepath + directory):
        print(file)
        if ".swp" in file:
            continue
        with open(filepath + directory + '/' + file, 'rt', encoding='utf8') as json_data:
            ugly_data = json.load(json_data)
            for game in ugly_data:
                platforms = game['platforms']
                for platform in platforms:
                    credits = platform['credits']
                    for credits_entry in credits:
                        for credit in credits_entry['credits']:
                            dev_id = credit['developer_id']
                            if dev_id is None:
                                continue
                            dev_id = 'D' + str(dev_id)
                            tsv_line = credit['name']
                            print(tsv_line)
                            tsv.write(tsv_line + '\n')
