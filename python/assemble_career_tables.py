# -*- coding: utf-8 -*-

import json
import csv
import os
import random

random.seed(47681)

dev_entries = []

def sortCareerTables():
    with open('./all_game_stream.tsv', 'rt', encoding='utf8') as source:
        tsvin = csv.reader(source, delimiter='\t')
        newtsv = sorted(tsvin, key=lambda entry:(entry[1], entry[3], entry[0]))
        #for entry in newtsv:
        #    print(entry)
        with open('./all_careers_sorted.tsv', 'w+', encoding='utf8', newline='') as target:
            writer = csv.writer(target, delimiter='\t')
            entry_count = 0
            last_entry_dev = False
            for entry in newtsv:
                #if 2 == int(entry[4]):# for now, only show the DOS games
                    entry_count += 1
                    if last_entry_dev != entry[1]:
                        last_entry_dev = entry[1]
                        entry_count = 1                
                    writer.writerow([entry[0], entry[1], entry[2], entry[3], entry[4], entry[5], entry[6], entry[7], entry[8], entry_count])
                    print([entry[0], entry[1], entry[2], entry[3], entry[4], entry[5], entry[6], entry[7], entry[8], entry_count])
                #else:
                #    print("Not DOS:" + entry[4])
    print("output career tables")


def unifyCareersInJSON(targetfile, sourcefile):
    with open(targetfile, 'w+', encoding='utf8', newline='\n') as target:
        with open(sourcefile, 'rt', encoding='utf8', newline=None) as source:
            sourcetext = source.read()
            sourcetext = sourcetext.replace("\n}{\n", ",\n")
            target.write(sourcetext)
    
## There is an error in how this outputs the JSON: it puts each developer in their own top-level map
## Which, I guess, is good for memory as its running, but nor so great for actually feeding it into the visualizer.
## If you do a search-and-replace the find \n}{\n and replace it with a comma, that fixes the file. I'm too
## tired to implement a fix in code tonight.
## 2017/12/09 - added a postprocessing function to fix it.

def careersToJSON(targetfile, sourcefile):
    with open('./' + 'tempfile' + targetfile + '.temp', 'w+', encoding='utf8') as target:
        with open('./' + sourcefile, 'rt', encoding='utf8',newline='') as source:
            tsvin = csv.reader(source, delimiter='\t')
            last_dev = False
            last_game_id = ""
            output_buffer = []
            entry_count = 0
            entry_per_year_count = 0
            last_year = -9999
            for entry in tsvin:
                if (str(entry[3])[0:4] != last_year):
                    last_year = str(entry[3])[0:4]
                    entry_per_year_count =0
                if (entry[1] == last_dev):
                    print('.', end='')
                else:
                    if (random.random() > 0.0):
                        json.dump({last_dev: output_buffer}, target, indent=1)
                    output_buffer = []            
                    #print(2)
                    last_dev = entry[1]
                    last_game_id = ""
                    entry_count = 0
                    last_year = -9999
                    entry_per_year_count = 0
                if entry[0] == last_game_id:
                    print(entry[8])
                else:
                    entry_count += 1
                    entry_per_year_count += 1
                    output_buffer.append({
                                          'game_id': entry[0],          
                                          'dev_id':  entry[1],
                                          #'role_id': entry[2],
                                          'release_date': entry[3],
                                          'platform_id': entry[4],
                                          #'platform_name': entry[5],
                                          'title': entry[6],
                                          'dev_name': entry[7],
                                          #'role_name': entry[8],
                                          'count': entry_count,
                                          'count_per_year': entry_per_year_count
                    })
                last_game_id = entry[0]
    unifyCareersInJSON(targetfile, './tempfile' + targetfile + '.temp')

def careersToTable(targetfile, sourcefile):
    with open('./' + targetfile, 'w+', encoding='utf8', newline='\n') as target:
        with open('./' + sourcefile, 'rt', encoding='utf8',newline='') as source:
            tsvin = csv.reader(source, delimiter='\t')
            last_dev = False
            last_game_id = ""
            this_devs_games = set()
            for entry in tsvin:
                if (entry[1] == last_dev):
                    print('.', end='')
                if entry[0] == last_game_id:
                    print(entry[8])
                else:
                
    
                
def datesToJSON(targetfile, sourcefile):
    listed_games = []
    with open('./' + targetfile, 'w+', encoding='utf8',newline='\n') as target:
        writer = csv.writer(target, delimiter='\t')
        with open('./' + sourcefile, 'rt', encoding='utf8',newline='') as source:
            tsvin = csv.reader(source, delimiter='\t')            
            for entry in tsvin:
                #print(entry)
                padded_game_id = str(entry[0])
                #print("ID:" + padded_game_id)
                game_id = 'G' + str(int(padded_game_id[1:]) - 10000000)
                if(not(game_id in listed_games)):
                    listed_games.append(game_id)
                    writer.writerow([game_id, entry[3]])
                    print([game_id, entry[3]])

    

   
#sortCareerTables()    
#careersToJSON('all_careers_random_subset_100_pct_E.json', 'all_careers_sorted.tsv')
datesToJSON('all_dates.tsv', 'all_careers_sorted.tsv')
print("done")            
        

