import json
import os

with open('./dos_games.tsv', 'w+') as tsv:
    for file in os.listdir('./dos_games'):
        with open('./dos_games/' + file) as json_data:
            ugly_data = json.load(json_data)
            for game in ugly_data:
                game_id = 'G' + str(game['game_id'])
                title = game['title'].replace('\t', '')
                release_date = game['platforms'][0]['releases'][0]['release_date']
                tsv_line = game_id + '\t' + title + '\t' + release_date
                print(tsv_line)
                tsv.write(tsv_line + '\n')
