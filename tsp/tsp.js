'use strict';

/* global Chart */

// SOURCE  : tsplib
// ORIGIN  : http://comopt.ifi.uni-heidelberg.de/software/TSPLIB95/tsp
let points;
let svg, table, chart;
let drawRatio;
let offsetX, offsetY;
let answer;

function init(svgSelector = 'svg', tableSelector = 'table', chartSelector = 'canvas') {
    svg = svgSelector;
    table = tableSelector;
    chart = new Chart($(chartSelector), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Current best length',
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: false,
                borderColor: 'rgba(255, 99, 132, 1)',
                pointRadius: 0,
                lineTension: 0
            }, {
                label: 'Current length',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: false,
                borderColor: 'rgba(54, 162, 235, 1)',
                pointRadius: 0,
                lineTension: 0

            }, {
                label: 'Answer',
                data: [],
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                fill: false,
                borderColor: 'rgba(255, 206, 86, 1)',
                pointRadius: 0,
                lineTension: 0

            }]
        },
        options: {
            legend: {
                labels: {
                    fontFamily: 'Roboto'
                }
            }
        }
    });
    $('#ans code').html(answer);
}
function refreshSvg() {
    $('svg').html($('svg').html());
}
function addPoint(point) {
    $('<circle></circle>')
        .attr({
            'point-id': point.ID,
            cx: point.X * drawRatio - offsetX,
            cy: point.Y * drawRatio - offsetY,
            r: 2,
            fill: 'darkblue'
        })
        .appendTo($(svg));
    $('<tr></tr>')
        .attr('row-id', point.ID)
        .append(`<td>${point.ID}</td>`)
        .append(`<td class="right aligned">${point.X}</td>`)
        .append(`<td class="right aligned">${point.Y}</td>`)
        .appendTo($(table).children('tbody'));
}
function addPoints(points) {
    let minX = Math.min(...points.map((v) => v.X));
    let minY = Math.min(...points.map((v) => v.Y));
    let maxX = Math.max(...points.map((v) => v.X));
    let maxY = Math.max(...points.map((v) => v.Y));
    drawRatio = (1127 - 600 - 20) / (maxX - minX);
    offsetX = minX * drawRatio - 10;
    offsetY = minY * drawRatio - 10;
    $(svg).attr({
        width: (maxX - minX) * drawRatio + 20,
        height: (maxY - minY) * drawRatio + 20
    });
    $(svg).html('');
    $.each(points, (index, value) => addPoint(value));
    $('#ans>code').text(answer);
}
function clearPoints() {
    $(svg).children('circle').remove();
}
function clearPath() {
    $(svg).children('path').remove();
}
function setPath(path) {
    let line = '';
    $.each(path, (index, value) => {
        line += `${index === 0 ? 'M' : 'L'}${points[value].X * drawRatio - offsetX} ${points[value].Y * drawRatio - offsetY} `;
    });
    $(`<path d="${line}Z"></path>`)
        .css({
            fillOpacity: 0,
            stroke: 'dodgerblue'
        })
        .prependTo($(svg));
}
function bindTableSvg() {
    for (let i = 0; i < points.length; ++i)
        $(`[row-id=${i}]`)
            .off('mouseenter')
            .on('mouseenter', function () {
                $(`[point-id=${i}]`).attr('r', 2 * 2.5);
                $(this).css('box-shadow', 'inset 0 0 1px 1px black');
            })
            .off('mouseleave')
            .on('mouseleave', function() {
                $(`[point-id=${i}]`).attr('r', 2);
                $(this).css('box-shadow', '');
            });
}
function update(path, best, current, iters, temp, changes, imprvs) {
    clearPath(path);
    setPath(path);
    $('#best').html(best);
    $('#current').html(current);
    $('#iters').html(iters);
    $('#temp').html(temp);
    $('#changes').html(changes);
    $('#imprvs').html(imprvs);
    refreshSvg();

    chart.data.labels.push(iters);
    chart.data.datasets[0].data.push(best);
    chart.data.datasets[1].data.push(current);
    chart.data.datasets[2].data.push(answer);
    chart.update();
}

Array.prototype.shuffle = function () {
    for (let i = this.length - 1; i > 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];
    }
};
Array.prototype.reverse = function(left, right) {
    for (let i = left, j = right; i < j; ++i, --j)
        [this[i], this[j]] = [this[j], this[i]];
};

let sqr = (x) => x * x;
let calcDistance = (i, j) =>
    Math.sqrt(sqr(points[i].X - points[j].X) + sqr(points[i].Y - points[j].Y));
let distanceBuffer;
let distance = (i, j) => distanceBuffer[i][j];
// let distance = (i, j) => calcDistance(i, j);
function calcDistanceBuffer() {
    let n = points.length;
    distanceBuffer = new Array(n);
    for (let i = 0; i < n; ++i) {
        distanceBuffer[i] = new Array(n);
        distanceBuffer[i][i] = 0;
    }
    for (let i = 0; i < n; ++i)
        for (let j = i + 1; j < n; ++j)
            distanceBuffer[i][j] = distanceBuffer[j][i] = calcDistance(i, j);
}
function getDistanceSum(path) {
    let n = path.length, s = 0;
    for(let i = 0; i < n; ++i)
        s += distance(path[i], path[(i + 1) % n], points);
    return s;
}

let init_temp = 200;
let decay = 0.99;

function simulatedAnnealing(points, isSA) {
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.data.datasets[1].data = [];
    chart.data.datasets[2].data = [];
    chart.update();

    let n = points.length;
    let path = [];
    for (let i = 0; i < n; ++i)
        path.push(i);
    let sum = getDistanceSum(path);
    let now = sum, best = sum, bestpath = path.slice(0);
    let changes = 0, imprvs = 0, iters = 0;
    let p = new Promise((resolve) => { resolve(); });
    for (let T = init_temp, i = 0; T > 1; T *= decay, ++i)
        p = p.then(() => new Promise((resolve) => {
            setTimeout(() => {
                best = getDistanceSum(bestpath);
                now = getDistanceSum(path);
                let nextIter = 10000;
                update(bestpath, best, now, iters, T, changes, imprvs);
                iters += nextIter;
                console.time('loop');
                for (let i = 0; i < nextIter; ++i) {
                    let p = Math.floor(Math.random() * n);
                    let q = Math.floor(Math.random() * n);
                    if (p == q)
                        q = (p + 1) % n;
                    // console.log(now);

                    // [path[p],path[q]] = [path[q],path[p]];
                    // cur=getDistanceSum(path,points);
                    // [path[p],path[q]] = [path[q],path[p]];

                    // console.log(cur);
                    let cur = now;
                    let type;
                    if (Math.random() < 0.5) {
                        type = 1;
                        // Case 1: swap
                        if ((q + 1) % n == p)
                            [p, q] = [q, p];
                        if ((p + 1) % n == q) {
                            // r p q s
                            let r = (p + n - 1) % n, s = (q + 1) % n;
                            cur -= distance(path[r], path[p]);
                            cur -= distance(path[q], path[s]);
                            cur += distance(path[r], path[q]);
                            cur += distance(path[p], path[s]);
                        } else {
                            cur -= distance(path[(p + n - 1) % n], path[p]);
                            cur -= distance(path[p], path[(p + 1) % n]);
                            cur += distance(path[(p + n - 1) % n], path[q]);
                            cur += distance(path[q], path[(p + 1) % n]);

                            cur -= distance(path[(q + n - 1) % n], path[q]);
                            cur -= distance(path[q], path[(q + 1) % n]);
                            cur += distance(path[(q + n - 1) % n], path[p]);
                            cur += distance(path[p], path[(q + 1) % n]);
                        }
                    } else {
                        // Case 2: reverse
                        type = 2;
                        if (p > q)
                            [p, q] = [q, p];
                        if ((q + 1) % n != p) {
                            // o p ... q r
                            // o q ... p r
                            let o = (p + n - 1) % n, r = (q + 1) % n;
                            cur -= distance(path[o], path[p]);
                            cur -= distance(path[q], path[r]);
                            cur += distance(path[o], path[q]);
                            cur += distance(path[p], path[r]);
                        }
                    }

                    // console.log("cur "+cur);
                    // console.log("cur0 "+cur0);
                    // console.log(cur==cur0);
                    // let t0=Math.random(),t1=Math.exp((now - cur) / T);
                    // console.log("random "+t0);
                    // console.log("exp "+t1);
                    if (cur < now || (isSA && Math.random() < Math.exp((now - cur) / T))) {
                        now = cur;
                        if (type === 1)
                            [path[p], path[q]] = [path[q], path[p]];
                        else if (type === 2)
                            path.reverse(p, q);
                        ++changes;
                    }
                    // console.log(now);
                    if (now < best) {
                        // console.log(p);
                        // console.log(q);
                        best = now;
                        bestpath = path.slice(0);
                        ++imprvs;
                    }
                }
                console.timeEnd('loop');
                resolve();
            }, 1);
        }));
    p.then(() => { console.log('Best route: ' + bestpath); });
}

let code = 'ch130';
$(() => {
    init('svg', 'table', 'canvas');
    $('#sa').on('click', () => { simulatedAnnealing(points, true); });
    $('#hill-climb').on('click', () => { simulatedAnnealing(points, false); });
    $('#init-temp').on('change', function() {
        init_temp = $(this).val();
    });
    $('#decay').on('change', function() {
        decay = $(this).val();
    });
    $('#code-dropdown').dropdown({
        onChange: (value) => {
            code = `${value}.tsp`;
            $.get(`http://localhost/data/${code}`, (v) => {
                let data = JSON.parse(v);
                console.log(data);
                answer = data.answer;
                points = data.points;
                addPoints(data.points);
                calcDistanceBuffer();
                refreshSvg();
            });
        }
    });
});
