// ==UserScript==
// @name         163 caipiao toolkit
// @namespace    https://stackoverflow.com/users/5299236/kevin-guan
// @version      1.0
// @description  Tools, and styles for caipiao.163.com
// @author       Kevin
// @include      /^https?:\/\/trend\.caipiao\.163\.com\/.*/
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.6.15/browser-polyfill.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.6.15/browser.min.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==

/* jshint ignore:start */
var inline_src = (<><![CDATA[
/* jshint ignore:end */
/* jshint esnext: true */


/* removing useless nodes part start */
const elementsToHide = [
    'topNav',
    'docHead',
    'fastBet',
    'awardInfoId',
    'statisticsTitle',
    'staticTable',
    'docFoot',
    document.getElementsByClassName('parameter')[0],
    document.getElementsByClassName('hot_block seohot_block clearfix')[0]
];

elementsToHide.map(element => {
    if (typeof element === "string")
        element = document.getElementById(element);

    if (!element) return;
    element.style.display = 'none';
});
/* removing useless nodes part end */


/* check duplicates part start */
// define functions to send the request and get the duplicates result
const funcs = {};

funcs.resultParser = (result) => {
    if (!document.getElementById('result_node')) {
        const resultNode = document.createElement('div');
        resultNode.setAttribute('id', 'result_node');

        document.getElementById('chart_area').appendChild(resultNode);
    }


    const resultNode = document.getElementById('result_node');
    resultNode.innerHTML = `<p id="main_balls" style="font-size: 20px;"><strong>${result.date}</strong>:
${result.balls.map(element => '<span>' + element + '</span>').join(' ')}
</p>` + '<br /><br />' +
        result.duplicates.map(duplicate => `<p class="subdupes" duplicates="${duplicate.duplicates}" style="font-size: 16px;">
<strong>${duplicate.date}</strong>:
${duplicate.balls.map(element => '<span>' + element + '</span>').join(' ')}
</p>`).join('<br />');


    const styleTrigger = element => {
        const duplicates = element.getAttribute('duplicates').split(',');
        const trigger = ball => {
            if (duplicates.indexOf(ball.innerHTML) > -1) {
                ball.style.color = ball.style.color ? '' : "red";
            }
        };

        Array.from(element.getElementsByTagName('span')).map(trigger);
        Array.from(document.getElementById('main_balls').getElementsByTagName('span')).map(trigger);
    };

    for (const element of Array.from(document.getElementsByClassName('subdupes'))) {
        element.addEventListener('mouseenter', event => styleTrigger(element));
        element.addEventListener('mouseleave', event => styleTrigger(element));
    }


    document.getElementById('main_balls').scrollIntoView();
};

funcs.sendRequest = (balls, times, date) => {
    const result = {
        balls: balls,
        times: times,
        date: date
    };

    GM_xmlhttpRequest({
        method: 'POST',
        url: 'http://keving.pythonanywhere.com/lottery/',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ database: /\w+/.exec(document.location.pathname)[0],
                              balls: balls,
                              times: times,
                              date: date
                             }),
        onload: response => {
            result.duplicates = JSON.parse(response.responseText).nodes;
            funcs.resultParser(result);
        }
    });
};

funcs.getResult = (row, date) => {
    const times = document.getElementById('times_options').value;

    if (row) {
        const selectedBalls = Array.from(row.getElementsByTagName('td'))
        .filter(element => element.className.indexOf('ball_red') > -1 || element.className.indexOf('ball_brown') > -1)
        .map(element => element.innerHTML);

        funcs.sendRequest(selectedBalls, times, date);
    } else {
        const selectedBalls = Array.from((document.getElementById('presele') || document.getElementsByClassName('lastRow')[0]).getElementsByClassName(' realBall'))
        .map(element => element.innerHTML);

        funcs.sendRequest(selectedBalls, times, 'The balls of yours');
    }
};


// removing and creating buttons from "toolBox"
funcs.init = () => {
    const toolBox = document.getElementById('toolBox');

    toolBox.innerHTML = '';
    toolBox.insertAdjacentHTML('beforeend', '<li id="check" style="height: auto;">检查<br>重复</li>');
    toolBox.insertAdjacentHTML('beforeend', `
<li style="height: auto;">
<select id="times_options">
<option value="3">3</option>
<option value="4" selected="selected">4</option>
<option value="5">5</option>
</select>
</li>`);


    Array.from(document.getElementsByTagName('tr'))
        .filter(element => element.hasAttribute('data-period'))
        .map(row => {
        const dateElement = row.children[0];
        const date = dateElement.innerHTML;
        const link = document.createElement('a');

        /* jshint ignore:start */
        link.href = 'javascript:void(0);';
        link.innerHTML = date;
        /* jshint ignore:end */

        dateElement.innerHTML = '';
        dateElement.appendChild(link);

        dateElement.addEventListener('click', event => {
            row.click();
            funcs.getResult(row, date);
        });
    });


    document.getElementById('check').addEventListener('click', event => funcs.getResult(false));
};

setTimeout(funcs.init, 4000);


/* jshint ignore:start */
]]></>).toString();
var c = babel.transform(inline_src);
eval(c.code);
/* jshint ignore:end */
