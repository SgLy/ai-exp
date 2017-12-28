# -*- coding: utf-8 -*-

from mnist import MNIST
from net import Net
from func import *
import numpy as np

if __name__ == "__main__":
    net = Net(input_size = 784, num_classes = 10, lr = 2,
            hidden_sizes = [30], batch_size = 50)

    mndata = MNIST('./mnist')
    print("Loading mnist training set...")
    mnist_img, mnist_label = mndata.load_training()

    train(net, mnist_img, mnist_label, 10000)

    print("Loading mnist testing set...")
    test_img, test_label = mndata.load_testing()
    eval(net, test_img, test_label)
