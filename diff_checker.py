#!/usr/bin/env python3
from collections import OrderedDict
from flask import Flask, jsonify, request

diff_checker = Flask(__name__)


def result_checker(database, balls, times, date):
    rows = []
    result = {'nodes': []}

    with open(database, 'r') as f:
        for line in f:
            l = line.rstrip().split('|')
            rows.append((l[0], set(l[1].split())))

    database_dict = OrderedDict(rows)

    for sub_date, sub_balls in database_dict.items():
        if sub_date == date:
            continue

        duplicates = set(balls).intersection(set(sub_balls))

        if len(duplicates) >= times:
            result['nodes'].append({
                'date': sub_date,
                'balls': list(sub_balls),
                'times': len(duplicates),
                'duplicates': list(duplicates)
            })

    return result


@diff_checker.route('/', methods=["GET", "POST"])
def request_receiver():
    # get and load the data as json, then run `result_checker` on the data,
    # and send it as json use `jsonify` function
    return jsonify(result_checker(**request.json))
