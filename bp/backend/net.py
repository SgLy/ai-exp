# -*- coding: utf-8 -*-

from utils import * 
import numpy as np

np.seterr(all='raise')

class Net:
    def __init__(self, input_size, num_classes, hidden_sizes,
            batch_size = 50, lr = 0.1, model = False):
        self.input_size = input_size
        self.num_classes = num_classes
        self.batch_size = batch_size
        self.lr = lr
        self.layer_sizes = [self.input_size] + hidden_sizes + [self.num_classes]
        self.weights = []

        if model:
            # read existing model
            pass
        else:
            # random initialize
            for i in range(1, len(self.layer_sizes)):
                self.weights.append(np.random.rand(self.layer_sizes[i - 1], 
                    self.layer_sizes[i]))

    def train_batch(self, batch_input, batch_label):
        self._forward(batch_input)
        self.logits = activation(self.outputs[-1])
        self.loss = self._loss(self.logits, batch_label)
        self._backpropagation()
        return self.loss

    def eval(self, _input):
        self._forward(_input)
        return [np.argmax(i) for i in self.logits]

    def _forward(self, batch_input):
        self.outputs = []
        # output include input layer
        self.outputs.append(batch_input)
        for i in range(len(self.weights)):
            hidden = mul(activation(self.outputs[-1]), self.weights[i])
            self.outputs.append(hidden)
        
    def _backpropagation(self):
        # note that self.gradients is of inverse order of self.weights
        self.gradients = [self._g_loss()]
        for w, _ in reversed(list(enumerate(self.weights))):
            nrow = self.layer_sizes[w]
            ncol = self.layer_sizes[w + 1]
            M = self.outputs[w]
            M_1 = self.outputs[w + 1]
            W = self.weights[w]

            # gradients for weights
            grad = initial_matrix(nrow, ncol, 0)
            for i in range(nrow):
                for j in range(ncol):
                    for k in range(self.batch_size):
                        grad[i][j] += self.lr * self.gradients[-1][k][j] * \
                                g_sigmoid(M_1[k][j]) * M[k][i]
                    # apply gradient to weights
                    self.weights[w][i][j] -= self.lr * grad[i][j]

            # gradients for outputs
            grad = initial_matrix(self.batch_size, nrow, 0)
            for i in range(self.batch_size):
                for j in range(nrow):
                    for k in range(ncol):
                        grad[i][j] += self.lr * self.gradients[-1][i][k] * \
                                g_sigmoid(M_1[i][k]) * W[j][k]

            self.gradients.append(grad)
        self.gradients = self.gradients.reverse()

    def _loss(self, logits, batch_label):
        m = len(logits)
        ans = 0
        for i in range(m):
            for k in range(self.num_classes):
                if batch_label[i] == k:
                    ans += (1 - logits[i][k]) ** 2
                else:
                    ans += (logits[i][k]) ** 2
        return (1.0 / m) * ans

    # gradient of loss to last output layer
    def _g_loss(self):
        return [[(2.0 / self.batch_size) * j for j in i] 
            for i in self.logits]
