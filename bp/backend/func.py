# -*- coding: utf-8 -*-

import io
import numpy as np
from PIL import Image, ImageChops

def _acc(_labels, labels):
    count = 0
    for i in range(len(labels)):
        if _labels[i] == labels[i]:
            count += 1
    return (count + 0.0) / len(labels)


def train(net, images, labels, num_iters, save_file = False, saving_gap = 2000):
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

        if i % 100 == 0:
            _labels = [np.argmax(i) for i in net.logits]
            acc = _acc(_labels, input_label)
            print("Iteration {}: loss: {} acc:{} lr:{}".format(i, loss, acc, net.lr))
            '''
            print("label: {}".format(input_label[0]))
            print(net.logits[0])
            #print(net.weights[1])
            '''

        if i % 2000 == 1999:
            net.lr = net.lr * 0.1

        if save_file and i % saving_gap == 0:
            net.save(save_file)
            print("Model saved.")

    net.save(save_file)

def eval(net, images, labels):
    _labels = net.eval(images)
    count = 0
    print("Evaluating...")
    acc = _acc(_labels, labels)
    print("Accuracy: {}".format(acc))

def trim(im):
    bg = Image.new(im.mode, im.size, 255)
    diff = ImageChops.difference(im, bg)
    bbox = diff.getbbox()
    im = im.crop(bbox)
    # extend im to square
    l = max(im.size)
    bg = Image.new(im.mode, (l, l), 255)
    size = im.size
    bg.paste(im, (int((l - size[0]) / 2.0),
        int((l - size[1]) / 2.0)))
    return bg

def prep_raw(r_image):
    im = Image.open(io.BytesIO(r_image)).convert('L')
    im = trim(im)
    im = im.resize((20, 20))
    bg = Image.new('L', (28, 28), (255))
    bg.paste(im, (4, 4))
    # bg.show()
    data = np.array(list(bg.getdata()))
    data = (255 - data) / 255.0
    return data

# for a single image
def get_num(net, r_image):
    image = prep_raw(r_image)
    num = net.eval(np.array([image]))
    return num[0]
