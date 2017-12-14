import json
import os

with open('./dos_game_devs.tsv', 'w+') as tsv:
    for file in os.listdir('./dos_games'):
        with open('./dos_games/' + file) as json_data:
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
                            tsv_line = dev_id + '\t' + credit['name']
                            print(tsv_line)
                            tsv.write(tsv_line + '\n')
