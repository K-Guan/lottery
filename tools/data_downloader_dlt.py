#!/usr/bin/env python3
import re
import requests
from bs4 import BeautifulSoup

link = 'http://www.lottery.gov.cn/lottery/dlt/History.aspx?p=1'

with open('dlt') as f:
    last_date = int(f.readline().split('|')[0])

with open('dlt', 'r+') as f:
    content = f.read()
    f.seek(0, 0)

    soup = BeautifulSoup(requests.get(link).text, "html.parser")

    for row in soup.find_all('tr')[13:-5]:
        date, balls = [i for i in i.find_all('td')[:2]]

        if int(date) > last_date:
            balls = balls.split(' + ')[0]
            f.write('|'.join((balls, date)))
            f.write('\n')

    f.write(content)
