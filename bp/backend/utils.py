# -*- coding: utf-8 -*-

import math
import numpy as np

def initial_matrix(row_size, col_size, init_num):
    return [[init_num for j in range(col_size)] 
            for i in range(row_size)]


def prep(x):
    x[x >= 0.3] = 1
    x[x < 0.3] = 0
    return x

def sigmoid(x):
    return 1.0 / (1 + np.exp(-x))

# gradient of sigmoid
def g_sigmoid(x):
    return np.exp(-x) / ((1 + np.exp(-x)) ** 2)

def relu(x):
    if x <= 0:
        return 0
    else:
        return x

def g_relu(x):
    if x <= 0:
        return 0
    else:
        return 1


activation = sigmoid
g_active = g_sigmoid
