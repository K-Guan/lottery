// ==UserScript==
// @name         163 caipiao toolkit
// @namespace    https://stackoverflow.com/users/5299236/kevin-guan
// @version      0.7
// @description  Tools, and styles for caipiao.163.com
// @author       Kevin
// @include      /^https?:\/\/trend\.caipiao\.163\.com\/.*/
// @grant        GM_xmlhttpRequest
// ==/UserScript==
/* jshint -W097 */
/* jshint esnext:true */

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
    console.log(result);
};

funcs.sendRequest = (balls, times, date) => {
    const result = {
        balls: balls,
        times: times,
        date: date
    };

    GM_xmlhttpRequest({
        method: 'POST',
        url: 'http://keving.pythonanywhere.com/lottery',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ database: /\w+/.exec(document.location.pathname)[0],
                              balls: balls,
                              times: times,
                              date: date
                             }),
        onload: response => {
            result.duplicates = JSON.parse(response.responseText)['nodes'];
        }
    });

    funcs.resultParser(result);
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
<option value="4">4</option>
<option value="5">5</option>
<option value="6">6</option>
</select>
</li>`);


    Array.from(document.getElementsByTagName('tr'))
        .filter(element => element.hasAttribute('data-period'))
        .map(row => {
        const dateElement = row.children[0];
        const date = dateElement.innerHTML;
        const link = document.createElement('a');

        link.href = 'javascript:void(0);';
        link.innerHTML = date;

        dateElement.innerHTML = '';
        dateElement.appendChild(link);

        dateElement.addEventListener('click', event => funcs.getResult(row, date));
    });


    document.getElementById('check').addEventListener('click', event => funcs.getResult(false));
};

setTimeout(funcs.init, 4000);
