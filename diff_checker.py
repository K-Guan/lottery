#!/usr/bin/env python3
from collections import OrderedDict
from flask import Blueprint, jsonify, request, abort

lottery = Blueprint("lottery", __name__)


def result_checker(database_name, balls, times, date):
    rows = []
    result = []

    with open(database_name, 'r') as f:
        for line in f:
            l = line.rstrip().split('|')
            rows.append((l[0], set(l[1].split())))

    database = OrderedDict(rows)

    for sub_date, sub_balls in database.items():
        if sub_date == date:
            continue

        duplicates = balls.intersection(sub_balls)

        if len(duplicates) >= times:
            result.append({
                'date': sub_date,
                'balls': sub_balls,
                'times': len(duplicates),
                'duplicates': duplicates
            })

    return result


@lottery.route('/', methods=["POST"])
def request_receiver():
    # get and load the data as json, then run `result_checker` on the data,
    # and send it as json use `jsonify` function
    data = json.loads(request.form)
    return jsonify(result_checker(**data))
