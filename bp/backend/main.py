# -*- coding: utf-8 -*-

from mnist import MNIST
from net import Net
from func import *
import numpy as np

if __name__ == "__main__":
    net = Net(input_size = 784, num_classes = 10, lr = 0.1,
            hidden_sizes = [30], batch_size = 50)

    mndata = MNIST('./mnist')
    print("Loading mnist training set...")
    mnist_img, mnist_label = mndata.load_training()
    mnist_img = np.array(mnist_img) / 255.0

    train(net, mnist_img, mnist_label, 10000, "saved/model.npy")

    print("Loading mnist testing set...")
    test_img, test_label = mndata.load_testing()
    test_img = np.array(test_img) / 255.0

    eval(net, test_img, test_label)
