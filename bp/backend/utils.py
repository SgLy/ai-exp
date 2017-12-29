# -*- coding: utf-8 -*-

import math
import numpy as np

def initial_matrix(row_size, col_size, init_num):
    return [[init_num for j in range(col_size)] 
            for i in range(row_size)]

# multiplication between matrix and matrix
'''
def mul(m1, m2):
    m1_r = len(m1)
    m1_c = len(m1[0])
    m2_r = len(m2)
    m2_c = len(m2[0])

    if m1_c != m2_r:
        raise Exception("Multiplication between matrix must match!")
    else:
        m = initial_matrix(m1_r, m2_c, 0);
        # matrix multiple
        for i in range(m1_r):
            for j in range(m2_c):
                for k in range(m1_c):
                    m[i][j] += m1[i][k] * m2[k][j]
        return m
'''
mul = np.matmul

# multiplication between matrix and matrix
def vecMulMat(v, m):
    v_c = len(v)
    m_r = len(m)

    if v_c != m_r:
        raise Exception("Multiplication between vector and matrix must match!")

    return [sum([v[j] * m_r[j][i] for j in range(v_c)])
            for i in range(m_r)]

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
