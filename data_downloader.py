#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
from collections import OrderedDict

link = 'http://kaijiang.zhcw.com/zhcw/html/ssq/list_1.html'

with open('ssq') as f:
    last_date = f.readline().split('|')[0]


result = OrderedDict()
result_string = ''

soup = BeautifulSoup(requests.get(link).text, "html.parser")
elements = soup.find_all('tr')[2:-1]

for element in elements:
    date = element.find_all('td')[1].text
    result[date] = [i.text for i in element.find_all('em')][:-1]


for date, balls in result.items():
    if int(date) > int(last_date):
        result_string += '|'.join((date, ' '.join(balls))) + '\n'

with open('ssq', 'r+') as f:
    content = f.read()
    f.seek(0, 0)
    f.write(result_string + content)
