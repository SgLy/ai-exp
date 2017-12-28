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
            input_img = images[index: ]
            input_img.extend(images[: end])
            input_label = labels[index: ]
            input_img.extend(images[: end])
        index = end

        loss = net.train_batch(input_img, input_label)

        if i % 10 == 0:
            _labels = [np.argmax(i) for i in net.logits]
            acc = _acc(_labels, input_label)
            print("Iteration {}: loss: {} acc:{}".format(i, loss, acc))

        if save_file and i % 500 == 0:
            net.save(save_file)
            print("Model saved.")

def eval(net, images, labels):
    _labels = net.eval(images)
    count = 0
    print("Evaluating...")
    acc = _acc(_labels, labels)
    print("Accuracy: {}".format(acc))
