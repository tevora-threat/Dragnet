#  Copyright 2016 The TensorFlow Authors. All Rights Reserved.
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
"""An Example of a DNNClassifier for the Iris dataset."""
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import argparse
import tensorflow as tf

import vuln_data


parser = argparse.ArgumentParser()
parser.add_argument('--company', default='', type=str, help='', nargs='+')
parser.add_argument('--position', default='', type=str, help='', nargs='+')
parser.add_argument('--major', default='', type=str, help='', nargs='+')
parser.add_argument('--college', default='', type=str, help='', nargs='+')
parser.add_argument('--firstname', default='', type=str, help='', nargs='+')
parser.add_argument('--lastname', default='', type=str, help='', nargs='+')
parser.add_argument('--location', default='', type=str, help='', nargs='+')
parser.add_argument('--batch_size', default=100, type=int, help='batch size')
parser.add_argument('--train_steps', default=1000, type=int,
                    help='number of training steps')


def main(argv):
    args = parser.parse_args(argv[1:])

    (train_x, train_y), (test_x, test_y) = vuln_data.load_data()


    hashed_feature_column1 =tf.feature_column.categorical_column_with_hash_bucket(key = "company",hash_bucket_size = 100) # The number of categories
    hashed_feature_column2 =tf.feature_column.categorical_column_with_hash_bucket(key = "position",hash_bucket_size = 100) # The number of categories
    hashed_feature_column3 =tf.feature_column.categorical_column_with_hash_bucket(key = "major",hash_bucket_size = 100) # The number of categories
    hashed_feature_column4 =tf.feature_column.categorical_column_with_hash_bucket(key = "college",hash_bucket_size = 100) # The number of categories
    hashed_feature_column5 =tf.feature_column.categorical_column_with_hash_bucket(key = "firstname",hash_bucket_size = 100) # The number of categories
    hashed_feature_column6 =tf.feature_column.categorical_column_with_hash_bucket(key = "lastname",hash_bucket_size = 100) # The number of categories
    hashed_feature_column7 =tf.feature_column.categorical_column_with_hash_bucket(key = "location",hash_bucket_size = 100) # The number of categories


    my_feature_columns = [tf.feature_column.indicator_column(hashed_feature_column1),tf.feature_column.indicator_column(hashed_feature_column2),tf.feature_column.indicator_column(hashed_feature_column3),tf.feature_column.indicator_column(hashed_feature_column4),tf.feature_column.indicator_column(hashed_feature_column5),tf.feature_column.indicator_column(hashed_feature_column6),tf.feature_column.indicator_column(hashed_feature_column7)]

    classifier = tf.estimator.DNNClassifier(
        feature_columns=my_feature_columns,
        hidden_units=[10, 10],
        n_classes=4)

    classifier.train(
        input_fn=lambda:vuln_data.train_input_fn(train_x, train_y,
                                                 args.batch_size),
        steps=args.train_steps)

    eval_result = classifier.evaluate(
        input_fn=lambda:vuln_data.eval_input_fn(test_x, test_y,
                                                args.batch_size))


    expected = ['Not Opened']


    predict_x = {
        'company': [' '.join(args.company)],
        'position': [' '.join(args.position)],
        'major': [' '.join(args.major)],
        'college': [' '.join(args.college)],
        'firstname': [' '.join(args.firstname)],
        'lastname': [' '.join(args.lastname)],
        'location': [' '.join(args.location)],        
    }

    predictions = classifier.predict(
        input_fn=lambda:vuln_data.eval_input_fn(predict_x,
                                                labels=None,
                                                batch_size=args.batch_size))

    template = ('\nPrediction is "{}" ({:.1f}%), expected "{}"')

    for pred_dict, expec in zip(predictions, expected):
        class_id = pred_dict['class_ids'][0]
        probability = pred_dict['probabilities'][class_id]


        print(pred_dict['probabilities'][3]*100)


if __name__ == '__main__':
    tf.app.run(main)