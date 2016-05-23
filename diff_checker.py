#!/usr/bin/env python3
from collections import OrderedDict
from flask import Blueprint, jsonify, request

diff_checker = Blueprint('diff_checker', __name__)


def result_checker(database, balls, times, date):
    rows = []
    result = {'nodes': []}

    with open('/home/KevinG/mysite/LotteryDataAnalysis/' + database, 'r') as f:
        for line in f:
            l = line.rstrip().split('|')
            rows.append((l[0], set(l[1].split())))

    database_dict = OrderedDict(rows)

    for sub_date, sub_balls in database_dict.items():
        if sub_date == date:
            continue

        duplicates = set(balls).intersection(sub_balls)

        if len(duplicates) >= times:
            result['nodes'].append({
                'date': sub_date,
                'balls': sorted(sub_balls),
                'times': len(duplicates),
                'duplicates': sorted(duplicates)
            })

    return result


@diff_checker.route('/', methods=["GET", "POST"])
def request_receiver():
    if request.method == 'GET':
        return 'Please use "POST" method on this page.'
    elif request.method == 'POST':
        return jsonify(result_checker(**request.json))
