import requests
import re
from os.path import join as path_join
import json

def cut(s, start, end):
    if s.find(start) == -1 or s.find(end) == -1:
        raise RuntimeError
    return s[s.find(start) + len(start): s.find(end)]

sess = requests.session()
print('Getting list...')
r = sess.get('http://elib.zib.de/pub/mp-testdata/tsp/tsplib/tsp/index.html')
codes = re.findall(r'<LI><A HREF="(.+?)">', r.content.decode('utf-8'))
for code in codes:
    print('Getting %s...' % code)
    r = sess.get('http://elib.zib.de/pub/mp-testdata/tsp/tsplib/tsp/%s' % code)
    try:
        s = cut(r.content.decode('utf-8'), 'NODE_COORD_SECTION', 'EOF')
    except RuntimeError:
        print('  error')
        continue
    while s.find('  ') != -1:
        s = s.replace('  ', ' ')
    s = s.replace('\n ', '\n')
    data = list(map(lambda u: u.split(' '), s.split('\n')[1: -1]))
    with open(path_join('data', code), 'w') as f:
        json.dump([{ 'ID': d[0], 'X': d[1], 'Y': d[2] } for d in data], f)
