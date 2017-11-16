import json, re, requests


sess = requests.session()
ans = sess.get('http://comopt.ifi.uni-heidelberg.de/software/TSPLIB95/STSP.html').content.decode('utf-8')
t = re.findall(r'([a-z]+\d+) : (\d+)', ans)

for code, ans in t:
    try:
        with open('data/%s.tsp' % code, 'r') as f:
            data = json.load(f)
        data = { 'points': data, 'answer': ans }
        with open('data/%s.tsp' % code, 'w') as f:
            json.dump(data, f)
    except Exception as err:
        print(code)
        print(err)
        pass
