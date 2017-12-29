# -*- coding: utf-8 -*-

import numpy as np

def _acc(_labels, labels):
    count = 0
    for i in range(len(labels)):
        if _labels[i] == labels[i]:
            count += 1
    return (count + 0.0) / len(labels)


def train(net, images, labels, num_iters, save_file = False):
    image_len = len(images)
    index = 0 # index of images
    batch_size = net.batch_size
    print("Start training!")
    for i in range(num_iters):
        end = index + batch_size
        if end <= image_len:
            input_img = images[index: end]
            input_label = labels[index: end]
        else:
            end = end % image_len
            input_img = np.concatenate((images[index:], images[: end]))
            input_label = np.concatenate((labels[index: ], labels[: end]))
        index = end % image_len

        loss = net.train_batch(input_img, input_label)

        if i % 10 == 0:
            _labels = [np.argmax(i) for i in net.logits]
            acc = _acc(_labels, input_label)
            print("Iteration {}: loss: {} acc:{} lr:{}".format(i, loss, acc, net.lr))
            '''
            print("label: {}".format(input_label[0]))
            print(net.logits[0])
            #print(net.weights[1])
            '''

        if (i + 1) % 500 == 0:
            net.lr = net.lr * 0.1

        if save_file and i % 200 == 0:
            net.save(save_file)
            print("Model saved.")

def eval(net, images, labels):
    _labels = net.eval(images)
    count = 0
    print("Evaluating...")
    acc = _acc(_labels, labels)
    print("Accuracy: {}".format(acc))
