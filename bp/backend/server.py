# -*- coding: utf-8 -*-

from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import json
from os import listdir
from os.path import isfile, join, splitext

import func
from net import Net

HOST = "127.0.0.1"
PORT = 10087
MODEL_DIR = "saved"

class Handler(BaseHTTPRequestHandler):
    def response_json(self, data):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def model_list(self):
        # get model files
        models = [splitext(f)[0]
                for f in listdir(MODEL_DIR) if isfile(join(MODEL_DIR, f))]
        return {'models': models}

    def eval(self, model, r_image):
        # eval a image
        model = model + '.npy'
        net = Net(model = join(MODEL_DIR, model))
        num = func.get_num(net, r_image)
        print("Evaluation answer is {}.".format(num))
        return {'ans': int(num), 
                'layers': [i.tolist() for i in net.outputs]}

    def do_GET(self):
        parsed_path = urlparse(self.path)
        params = parse_qs(parsed_path.query)
        if parsed_path.path == "/model_list":
            data = self.model_list()
        self.response_json(data)

    def do_POST(self):
        parsed_path = urlparse(self.path)
        params = parse_qs(parsed_path.query)
        content_length = int(self.headers['Content-Length'])
        r_content = self.rfile.read(content_length)
        if parsed_path.path == "/eval":
            data =self.eval(params['model'][0], r_content)
        self.response_json(data)

if __name__ == "__main__":
    server = HTTPServer((HOST, PORT), Handler)
    print('Server started at {}:{}...'.format(HOST, PORT))
    server.serve_forever()
