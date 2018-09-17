import pandas as pd
import tensorflow as tf
import os
import sys

CSV_COLUMN_NAMES = ['company', 'position',
                    'major', 'college','firstname','lastname','location', 'result']
RESULT = ['Not Opened', 'Opened', 'Clicked', 'Exploited']

currentFile = __file__
realPath = os.path.realpath(currentFile)
dirPath = os.path.dirname(realPath)

def maybe_download():
    test_path = dirPath+'/'+'test.csv'
    train_path = dirPath+'/'+'train.csv'


    return train_path, test_path

def load_data(y_name='result'):
    train_path, test_path = maybe_download()

    train = pd.read_csv(train_path, names=CSV_COLUMN_NAMES, header=1)
    train_x, train_y = train, train.pop(y_name)

    test = pd.read_csv(test_path, names=CSV_COLUMN_NAMES, header=1)
    test_x, test_y = test, test.pop(y_name)

    return (train_x, train_y), (test_x, test_y)


def train_input_fn(features, labels, batch_size):
    """An input function for training"""
    dataset = tf.data.Dataset.from_tensor_slices((dict(features), labels))

    dataset = dataset.shuffle(1000).repeat().batch(batch_size)

    return dataset

def eval_input_fn(features, labels, batch_size):
    """An input function for evaluation or prediction"""
    features=dict(features)
    if labels is None:
        inputs = features
    else:
        inputs = (features, labels)

    dataset = tf.data.Dataset.from_tensor_slices(inputs)

    assert batch_size is not None, "batch_size must not be None"
    dataset = dataset.batch(batch_size)

    return dataset



CSV_TYPES = [[""], [""], [""], [""],[""],[""],[""],[0]]

def _parse_line(line):
    fields = tf.decode_csv(line, record_defaults=CSV_TYPES)

    features = dict(zip(CSV_COLUMN_NAMES, fields))

    label = features.pop('result')

    return features, label


def csv_input_fn(csv_path, batch_size):

    dataset = tf.data.TextLineDataset(csv_path).skip(1)

    dataset = dataset.map(_parse_line)

    dataset = dataset.shuffle(1000).repeat().batch(batch_size)

    return dataset