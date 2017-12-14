import json
import os

filepath = "../games/"
#filepath = "J:/Isaac/School/2017/Classes/CMPM290A/mobygames/dataset/"
filepath = "C:/Users/Isaac/Isaac/School/2017/CMPM290A/mobygames/dataset/all"
directory = 'dos_games'
directory = 'all'

with open('./' + directory + '_game_stream.tsv', 'w+', encoding='utf8') as tsv:
    for file in os.listdir(filepath + directory):
        print(file)
        if ".swp" in file:
            continue
        else:
            with open(filepath + directory + '/' + file, 'rt', encoding='utf8') as json_data:
                ugly_data = json.load(json_data)
                for game in ugly_data:
                    platforms = game['platforms']
                    game_id = 'G' + str(10000000 + game['game_id'])
                    title = game['title'].replace('\t', '').replace('\r\n', '')
                    for platform in platforms:
                        credits = platform['credits']
                        release_date = platform['releases'][0]['release_date']
                        platform_name = str(platform['platform_name'])
                        platform_id = str(platform['platform_id'])
                        for credits_entry in credits:
                            role = credits_entry['role']
                            role_type = str(credits_entry['role_type']).replace('\t', '').replace('\r\n', '')
                            role_type_id = str(credits_entry['role_type_id'])
                            if role_type_id is None:
                                continue
                            role_type_id = 'R' + str(role_type_id)
                            for credit in credits_entry['credits']:
                                dev_id = credit['developer_id']
                                if dev_id is None:
                                    continue
                                dev_id = 'D' + str(100000000 + dev_id)
                                dev_name = credit['name'].replace('\r\n', '')
                                tsv_line = game_id + '\t' + dev_id + '\t' + role_type_id + '\t' + release_date + '\t' + platform_id + '\t' + platform_name + '\t' + title + '\t' + dev_name + '\t' + role_type
                                print(tsv_line)
                                tsv.write(tsv_line + '\n')
