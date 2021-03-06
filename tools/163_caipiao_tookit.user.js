// ==UserScript==
// @name         163 caipiao toolkit
// @namespace    https://stackoverflow.com/users/5299236/kevin-guan
// @version      2.8
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


/* check duplicates part start */
const usefulTools = {};
const diffCheckerFuncs = {};
const database = /\w+/.exec(document.location.pathname)[0];

// function to hides useless nodes
usefulTools.hideNodes = () => {
    const nodesToHide = [
        'topNav',
        'docHead',
        'fastBet',
        // 'toolBoxCon',   /* if you don't use the `diffChecker` functions, you can uncomment this line
        'awardInfoId',
        'statisticsTitle',
        'staticTable',
        'docFoot',
        document.getElementsByClassName('f_right')[0],
        document.getElementsByClassName('parameter')[0],
        document.getElementsByClassName('hot_block seohot_block clearfix')[0]
    ];

    nodesToHide.forEach(element => {
        if (typeof element === "string")
            element = document.getElementById(element);

        if (!element) return;
        element.style.display = 'none';
    });


    // hide the buttons and text after the "清空全部选号" button
    let nextToHide = document.getElementById('trend_daigou');

    while (nextToHide) {
        if (nextToHide.style) nextToHide.style.display = 'none';
        nextToHide = nextToHide.nextSibling;
    }
};

// function to highlights rows by the newest blue ball
usefulTools.blueBallHighlight = () => {
    const checkEquals = (firstArr, lastArr) => firstArr.every((item, index) => lastArr[index] === item);
    const blueBalls = Array.from(document.getElementsByTagName('tr'))
                                 .filter(element => element.getAttribute('data-period'))
                                 .map(row => row.getElementsByClassName('ball_blue'));

    const lastBalls = Array.from(blueBalls[blueBalls.length - 1]).map(ball => ball.innerHTML);

    for (const balls of blueBalls) {
        if (checkEquals(Array.from(balls).map(ball => ball.innerHTML), lastBalls)) balls[0].parentNode.className = 'bg_plum';
    }
};

/* Functions of Diff Checker part start */
// function to gets the times by database
diffCheckerFuncs.getTimes = () => {
    const returnHtml = (optionsHtml) => {
        return `<li style="height: auto;">
                    <select id="timesOptions">
                        ${optionsHtml}
                    </select>
                </li>`;
    };

    const htmlGenerator = (timesArray, selected) => {
        return timesArray.map(times => {
            if (times === selected) {
                return `<option value="${times}" selected="selected">${times}</option>`;
            } else {
                return `<option value="${times}">${times}</option>`;
            }
        });
    };

    if (database === 'ssq') {
       return returnHtml(htmlGenerator([3, 4, 5], 4));
    } else if (database === 'dlt') {
        return returnHtml(htmlGenerator([2, 3, 4], 3));
    } else if (database === 'qlc') {
        return returnHtml(htmlGenerator([4, 5, 6], 5));
    }
};

// function to highlights the line at the center
diffCheckerFuncs.lineHighlight = () => {
    const search = JSON.parse('{"' + decodeURI(location.search.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    Array.from(document.getElementsByTagName('tr')).filter(element => element.getAttribute('data-period') ===
                                                           String(Number(search.beginPeriod) +
                                                                  ((Number(search.endPeriod) - Number(search.beginPeriod)) / 2)))[0].className = 'bg_plum';
};

// function to gets the result and puts it into the page
diffCheckerFuncs.resultParser = (result) => {
    if (!document.getElementById('resultNode')) {
        // create the node of result
        const resultNode = document.createElement('div');

        // set the `id` of result node to  `resultNode`
        resultNode.setAttribute('id', 'resultNode');
        // append it at the buttom of the page
        document.getElementById('chart_area').insertAdjacentHTML('beforeend', '<br />');
        document.getElementById('chart_area').appendChild(resultNode);
    }

    // put the result into resultNode
    const resultNode = document.getElementById('resultNode');

    resultNode.innerHTML = `<p id="mainBalls" style="font-size: 20px;">
<strong style="color: green;">${result.date}</strong>:
${result.balls.map(element => `<span>${element}</span>`).join(' ')}
</p>
<br />
<br />` + result.duplicates.map(duplicate => `<p class="subdupes" duplicates="${duplicate.duplicates}" style="font-size: 16px;">
<a href="${window.location.origin + window.location.pathname +
                                `?beginPeriod=${String(Number(duplicate.date) - 5)}
&endPeriod=${String(Number(duplicate.date) + 5)}`}&fromDiff=true" target="_blank"><strong>${duplicate.date}</strong></a>:
${duplicate.balls.map(element => `<span>${element}</span>`).join(' ')}
<sub>(${duplicate.times})</sub></p>`).join('<br />');

    // trigger the color when hovering over the duplicate balls
    const styleTrigger = element => {
        const duplicates = element.getAttribute('duplicates').split(',');
        const trigger = ball => {
            if (duplicates.indexOf(ball.innerHTML) > -1) {
                ball.style.color = ball.style.color ? '' : "red";
            }
        };

        Array.from(element.getElementsByTagName('span')).forEach(trigger);
        Array.from(document.getElementById('mainBalls').getElementsByTagName('span')).forEach(trigger);
    };

    for (const element of Array.from(document.getElementsByClassName('subdupes'))) {
        element.addEventListener('mouseenter', event => styleTrigger(element));
        element.addEventListener('mouseleave', event => styleTrigger(element));
    }

    // scroll to the result node automatically
    document.getElementById('resultNode').scrollIntoView();
};

// function to sends the selected balls, duplicate times, and date as JSON
diffCheckerFuncs.sendRequest = (balls, times, date) => {
    // define the result object which we need to use later
    const result = {
        balls: balls,
        times: times,
        date: date
    };

    // send the request use `GM_xmlhttpRequest`, as a "POST" request
    GM_xmlhttpRequest({
        method: 'POST',
        // the url of my server
        url: 'http://keving.pythonanywhere.com/lottery/',
        // the "Content-Type" header of JSON
        headers: { 'Content-Type': 'application/json' },
        // the JSON data to send, generated by `JSON.stringify` function
        data: JSON.stringify({ database: database,
                              balls: balls,
                              times: times,
                              date: date
                             }),
        onload: response => {
            // put the response text into `result.duplicates`, and run `resultParser` on the result
            result.duplicates = JSON.parse(response.responseText).nodes;
            diffCheckerFuncs.resultParser(result);
        }
    });
};

// function to gets the selected balls, times, and date
diffCheckerFuncs.getResult = (row, date) => {
    const times = document.getElementById('timesOptions').value;

    // check if the balls are selected by user, or they're in the database
    if (row) {
         diffCheckerFuncs.sendRequest(Array.from(row.getElementsByTagName('td'))
                                      .filter(element => element.className.indexOf('ball_red') > -1 || element.className.indexOf('ball_brown') > -1)
                                      .map(element => element.innerHTML), times, date);
    } else {
         const selectingRow = document.getElementsByTagName('tbody')[1];
         const selectedBalls = Array.from(selectingRow.getElementsByClassName(' realBall').length === 0 ?
                                          selectingRow.getElementsByClassName('active') :
                                          selectingRow.getElementsByClassName(' realBall'));

         diffCheckerFuncs.sendRequest(selectedBalls.map(element => element.innerHTML), times, date);
    }
};

// function to removes the old buttons and creates a button to
// gets the selected balls and the options of `times` from "toolBox"
diffCheckerFuncs.init = () => {
    const toolBox = document.getElementById('toolBox');

    toolBox.innerHTML = '';
    // inserting button
    toolBox.insertAdjacentHTML('beforeend', '<li id="check" style="height: auto;">检查<br>重复</li>');
    // inserting options
    toolBox.insertAdjacentHTML('beforeend', diffCheckerFuncs.getTimes());
    document.getElementById('timesOptions').addEventListener('change', event => {
        if (document.getElementById('resultNode')) {
            const date = document.getElementById('mainBalls').children[0].innerHTML;
            if (date !== 'The balls of yours') {
                diffCheckerFuncs.getResult(Array.from(document.getElementsByTagName('tr'))
                                                      .filter(element => element.getAttribute('data-period') === date)[0], date);
            } else {
                 diffCheckerFuncs.getResult(false, date);
            }
        }
    });

    // add event listener to the button
    document.getElementById('check').addEventListener('click', event => diffCheckerFuncs.getResult(false, 'The balls of yours'));


    // create links on every rows so user can clicks them
    // and send the balls as selected balls with the date of them
    Array.from(document.getElementsByTagName('tr'))
        .filter(element => element.hasAttribute('data-period'))  // filter the rows we're looking for
        .forEach(row => {
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
                // change the className of the row to none to remove the line highlight
                row.className = '';
                diffCheckerFuncs.getResult(row, date);
            });
    });
};
/* Functions of Diff Checker part end */


// code will runs after everything has been loaded
window.addEventListener('load', function() {
    /* remove or comment "this" part if you want to
       disable the Diff Checker feature */

    // "this" part start
    if (window.location.search.indexOf('fromDiff=true') > -1) {
        diffCheckerFuncs.lineHighlight();
    }

    diffCheckerFuncs.init();
    // "this" part end

    usefulTools.hideNodes();
    usefulTools.blueBallHighlight();

    window.scrollTo(0, document.body.scrollHeight);  // scroll to the buttom automatically after the code ran
}, false);


/* jshint ignore:start */
]]></>).toString();
var c = babel.transform(inline_src);
eval(c.code);
/* jshint ignore:end */
