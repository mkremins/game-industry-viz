import json
import requests
import time
import io


api_key = ' API KEY GOES HERE '
baseurl = 'https://api.mobygames.com/v1/'
#example_endpoint = 'games/53611/platforms/81'


def query_string(pairs):
    pairs = [str(k) + '=' + str(v) for k, v in pairs]
    return '?' + '&'.join(pairs)


def get_endpoint(endpoint, query=[], printresp=False):
    fullquery = [('api_key', api_key)] + query
    url = baseurl + endpoint + query_string(fullquery)
    print('GET ' + url)
    resp = requests.get(url, auth=(api_key, ''))
    if printresp:
        print(resp.text)
    return json.loads(resp.text)


def get_endpoint_paged(endpoint, query=[], printresp=False, offset = 0):
    pagesize = 5
    pages = []
    noun = endpoint.split('/')[0]  # toplevel key in the response JSON object
    while(True):
        fullquery = query + [('offset', offset)]
        page = get_endpoint(endpoint, fullquery, printresp)[noun]
        pages.extend(page)
        if len(page) < pagesize:
            return pages
        offset += len(page)
        long_delay()
        
connection_errors = 0
mobygames_save_file_path = ""
        
def save_endpoint_paged(endpoint, query=[], printresp=False, offset = 0):
    global connection_errors
    pagesize = 5
    noun = endpoint.split('/')[0]  # toplevel key in the response JSON object
    while(True):
        fullquery = query + [('offset', offset)]
        try:
            page = get_endpoint(endpoint, fullquery, printresp)[noun]
            with io.open("{2}mobygames_{0}_{1!s:0>7}.json".format("all", offset, mobygames_save_file_path), "w", encoding="utf-8") as file:
                file.write(unicode(json.dumps(page, indent=2, ensure_ascii=False)))
            if len(page) < pagesize:
                print "Found pages: ", len(page)
                return page
            offset += len(page)
            long_delay()
        except requests.ConnectionError as e:
            print e
            connection_errors = connection_errors + 1
            print "Connnection errors: " + connection_errors
            very_long_delay()
            



def short_delay():
    time.sleep(1)  # max peak rate of one API req per second


def long_delay():
    time.sleep(10+1)  # max long-term rate of one API req per 10secs (360/hr)

def very_long_delay():
    time.sleep(60 + (15 * (connection_errors * connection_errors * 0.5)))  # max long-term rate of one API req per 10secs (360/hr)


#et_endpoint_paged('games', [('platform', 2), ('format', 'full')])
#x = main.get_endpoint_paged('games', [('platform', 2), ('format', 'full'), ('limit', 5)])

