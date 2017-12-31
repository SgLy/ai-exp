# -*- coding: utf-8 -*-

from utils import * 
import numpy as np
import json

import traceback

np.seterr(all='raise')

class Net:
    def __init__(self, input_size = 784, num_classes = 10, hidden_sizes = [30],
            batch_size = 50, lr = 0.1, model = False):
        self.input_size = input_size
        self.num_classes = num_classes
        self.batch_size = batch_size
        self.lr = lr
        self.layer_sizes = [self.input_size] + hidden_sizes + [self.num_classes]
        self.weights = []

        if model:
            # read existing model
            self.weights = np.load(model)
            # adjust layer structure to model opened
            self.layer_sizes = [w.shape[0] for w in self.weights]
            self.layer_sizes.append(self.weights[-1].shape[1])
        else:
            # random initialize
            for i in range(1, len(self.layer_sizes)):
                nrow = self.layer_sizes[i - 1]
                ncol = self.layer_sizes[i]
                self.weights.append(np.random.randn(nrow, ncol).astype(np.float32) \
                        * np.sqrt(2.0 / nrow))

    def train_batch(self, batch_input, batch_label):
        batch_input = prep(batch_input)
        self._forward(batch_input)
        self.logits = activation(self.outputs[-1])
        
        # convert label to one-hot
        batch_label = np.eye(self.num_classes)[batch_label]

        self.loss = self._loss(batch_label)
        self.gradients = [self._g_loss(batch_label)]
        self._backpropagation()
        return self.loss

    def eval(self, _input):
        _input = prep(_input)
        self._forward(_input)
        self.logits = activation(self.outputs[-1])
        return [np.argmax(i) for i in self.logits]

    def save(self, outfile):
        np.save(outfile, self.weights)

    def _forward(self, batch_input):
        self.outputs = []
        # output include input layer
        # output is the layer value not activated
        self.outputs.append(np.array(batch_input))
        # first layer does not activate
        self.outputs.append(np.matmul(batch_input, self.weights[0]))
        for i in range(1, len(self.weights)):
            hidden = np.matmul(activation(self.outputs[-1]), self.weights[i])
            self.outputs.append(hidden)
        
    def _backpropagation(self):
        # note that self.gradients is of inverse order of self.weights
        # self.gradients target to hidden output
        for w, _ in reversed(list(enumerate(self.weights))):
            nrow = self.layer_sizes[w]
            ncol = self.layer_sizes[w + 1]
            M = self.outputs[w]
            M_1 = g_active(self.outputs[w + 1])
            W = self.weights[w]

            T = np.multiply(self.gradients[-1], M_1)
            grad = np.matmul(M.T, T)
            '''
            # gradients for weights
            grad = np.zeros([nrow, ncol])
            for i in range(nrow):
                for j in range(ncol):
                    for k in range(self.batch_size):
                        grad[i][j] += self.gradients[-1][k][j] * \
                                M_1[k][j] * M[k][i]
            '''

            # apply gradient to weights
            self.weights[w] -= (self.lr * grad)
            
            T = np.multiply(self.gradients[-1], M_1)
            grad = np.matmul(T, W.T)
            '''
            # gradients for outputs
            grad = np.zeros([self.batch_size, nrow])
            for i in range(self.batch_size):
                for j in range(nrow):
                    for k in range(ncol):
                        grad[i][j] += self.gradients[-1][i][k] * \
                                M_1[i][k] * W[j][k]
            '''

            self.gradients.append(grad)
        # self.gradients = self.gradients.reverse()

    def _loss(self, batch_label):
        m = len(self.logits)
        ans = 0
        for i in range(m):
            for k in range(self.num_classes):
                ans += (self.logits[i][k] - batch_label[i][k]) ** 2
        return (1.0 / m) * ans

    # gradient of loss to last output layer
    def _g_loss(self, batch_label):
        return (2.0 / self.batch_size) * (self.logits - batch_label)

