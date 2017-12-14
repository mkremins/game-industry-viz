import itertools


def pairwise(iterable):
    "s -> (s0,s1), (s1,s2), (s2, s3), ..."
    a, b = itertools.tee(iterable)
    next(b, None)
    return itertools.izip(a, b)


def unique_by(f, xs):
    unique_xs = []
    seen_f_vals = []
    for x in xs:
        f_val = f(x)
        if f_val not in seen_f_vals:
            unique_xs.append(x)
            seen_f_vals.append(f_val)
    return unique_xs


seed_dev_id = 'D622071'
out_file = './alex_swaim_final_edges.csv'

print('Getting game IDs for seed dev ID: ' + seed_dev_id)
game_edges_tsv = open('./game_edges.tsv')
game_edge_rows = [line.strip().split('\t') for line in game_edges_tsv]
#for row in game_edge_rows:
#    print(row)

seed_game_ids = []
for game_id, dev_id, role_id in game_edge_rows:
    #strip_dev_id = 'D' + str(int(dev_id[1:]) - 100000000)
    #print(strip_dev_id, dev_id, seed_dev_id)
    if dev_id == seed_dev_id:
        seed_game_ids.append(game_id)
        print(game_id)

raise Exception("Just Stop")


print('Getting dev IDs for all seed game IDs')
all_dev_ids = {}
for game_id, dev_id, role_id in game_edge_rows:
    if game_id in seed_game_ids:
        all_dev_ids[dev_id] = []
        print(dev_id)
print('Total dev IDs: ' + str(len(all_dev_ids)))

print ('Building careers table')
careers_tsv = open('./all_careers_sorted.tsv')
career_rows = [line.strip().split('\t') for line in careers_tsv]
for padded_game_id, padded_dev_id, role_id, date, platform_id, platform, game, dev, role, order in career_rows:
    dev_id = 'D' + str(int(padded_dev_id[1:]) - 100000000)
    if dev_id not in all_dev_ids:
        continue
    game_id = 'G' + str(int(padded_game_id[1:]) - 10000000)
    print(dev_id + ',' + game_id)
    if game_id in all_dev_ids[dev_id]:
        continue
    all_dev_ids[dev_id].append(game_id)

print('Writing ' + out_file)
with open(out_file, 'w+') as out:
    for dev_id in all_dev_ids:
        game_ids = all_dev_ids[dev_id]
        for game_id_1, game_id_2 in pairwise(game_ids):
            #if game_id_1 == game_id_2:
            #    print(game_id_1 + ' == ' + game_id_2)
            #    continue
            csv_line = game_id_1 + ',' + game_id_2 + ',1,' + dev_id
            print(csv_line)
            out.write(csv_line + '\n')
