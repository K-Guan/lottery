#!/usr/bin/env python3
import sys
import requests
from bs4 import BeautifulSoup

database = sys.argv[1]
link = 'http://kaijiang.zhcw.com/zhcw/html/{}/list_1.html'.format(database)

soup = BeautifulSoup(requests.get(link).text, "html.parser")
rows = soup.find_all('tr')[2:-1]

with open(database) as f:
    last_date = int(f.readline().split('|')[0])

with open(database, 'r+') as f:
    content = f.read()
    f.seek(0, 0)

    for row in rows:
        date, balls = [i.text for i in row.find_all('td')[1:3]]

        if int(date) > last_date:
            f.write('|'.join([date, ' '.join(sorted(balls.strip().split()[:-1]
                                                    if len(sys.argv) > 2
                                                    else balls.strip().split(),
                                                    key=int))]))
            f.write('\n')
        else:
            break

    f.write(content)
