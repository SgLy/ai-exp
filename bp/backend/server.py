# -*- coding: utf-8 -*-

from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import json
from os import listdir
from os.path import isfile, join, splitext
import threading

from mnist import MNIST
import numpy as np
import func
from net import Net

HOST = "127.0.0.1"
PORT = 10087
MODEL_DIR = "saved"

is_training = {'value': False}
trainingData = {
    'loss': [],
    'acc': [],
    'eval': 0}
lock = threading.Lock()

def _train(lr, batch_size, hidden_sizes, epoch_num, model_name):
    global is_training, trainingData, lock

    num_iters = int(epoch_num * 60000.0 / batch_size)
    net = Net(hidden_sizes = hidden_sizes, batch_size = batch_size,
            lr = lr)
    mndata = MNIST('./mnist')
    print("Loading mnist training set...")
    mnist_img, mnist_label = mndata.load_training()
    mnist_img = np.array(mnist_img) / 255.0
    func.train(net, mnist_img, mnist_label, num_iters, 
            join(MODEL_DIR, model_name + '.npy'), 
            trainingData = trainingData, lock = lock,
            training_flag = is_training)

    print("Loading mnist testing set...")
    test_img, test_label = mndata.load_testing()
    test_img = np.array(test_img) / 255.0

    lock.acquire()
    trainingData['eval'] = func.eval(net, test_img, test_label)
    is_training['value'] = False
    lock.release()

def init_data():
    global is_training, trainingData
    lock.acquire()
    is_training = {'value': False}
    trainingData = {
        'loss': [],
        'acc': [],
        'eval': 0}
    lock.release()


class Handler(BaseHTTPRequestHandler):
    def response_json(self, data):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def _model_list(self):
        # get model files
        models = [splitext(f)[0]
                for f in listdir(MODEL_DIR) if isfile(join(MODEL_DIR, f))]
        return {'models': models}

    def _eval(self, model, r_image):
        # eval a image
        model = model + '.npy'
        net = Net(model = join(MODEL_DIR, model))
        num = func.get_num(net, r_image)
        print("Evaluation answer is {}.".format(num))
        return {'ans': int(num), 
                'layers': [i.tolist() for i in net.outputs]}
    def _train(self, params):
        global is_training
        init_data()
        is_training['value'] = True
        hidden_num = int(params['hidden_num'])
        hidden_sizes = [int(params['hidden_' + str(i + 1)]) for i in range(hidden_num)]
        P = threading.Thread(target = _train, args = (
            float(params['lr']),
            int(params['batch']), hidden_sizes, int(params['epoch']), params['model_name']))
        P.start()
        return {'state': 1}

    def _stop(self):
        global is_training
        is_training['value'] = False
        return {'state': 1}

    def _get_data(self, params):
        global lock, is_training, trainingData
        if is_training['value']:
            index = int(params['iter'])
            lock.acquire()
            if len(trainingData['loss']) > index:
                data = {'loss': trainingData['loss'][index],
                        'acc': trainingData['acc'][index],
                        'fin': 0}
            else:
                data = {'fin': 2}
            lock.release()
            return data
        else:
            lock.acquire()
            data = {'fin': 1, 'eval': trainingData['eval']}
            lock.release()
            return data

    def _is_training(self):
        global is_training, lock
        lock.acquire()
        data = {'is_training': 1 if is_training['value'] else 0}
        lock.release()
        return data

    def do_GET(self):
        parsed_path = urlparse(self.path)
        params = parse_qs(parsed_path.query)
        params = {k: params[k][0] for k in params}
        if parsed_path.path == "/model_list":
            data = self._model_list()
        elif parsed_path.path == "/new_train":
            data = self._train(params)
        elif parsed_path.path == "/stop_train":
            data = self._stop()
        elif parsed_path.path == "/get_data":
            data = self._get_data(params)
        elif parsed_path.path == "/is_training":
            data = self._is_training()
        else:
            return
        self.response_json(data)

    def do_POST(self):
        parsed_path = urlparse(self.path)
        params = parse_qs(parsed_path.query)
        content_length = int(self.headers['Content-Length'])
        r_content = self.rfile.read(content_length)
        if parsed_path.path == "/eval":
            data =self._eval(params['model'][0], r_content)
        else:
            return
        self.response_json(data)

if __name__ == "__main__":
    server = HTTPServer((HOST, PORT), Handler)
    print('Server started at {}:{}...'.format(HOST, PORT))
    server.serve_forever()
