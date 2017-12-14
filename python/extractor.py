import json

clean_data = {}
with open('games_001315.json') as json_data:
   ugly_data = json.load(json_data)
   for i in ugly_data:
      data_line = {}
      #data_line['game_id'] = i['game_id']
      #data_line['credits'] = i.get('credits')
      data_line['title'] = i.get('title') #i['title']
      #print i['credits'][0]
      for j in i.get('platforms'):
         credits = {}
         credits['role'] = j.get('credits')
         data_line['credits'] = credits
      #print i.get('platforms')[0]
      clean_data[i.get('game_id')] = data_line

with open('test.json', 'w') as outfile:
   json.dump(clean_data, outfile, sort_keys = True, indent = 3)
