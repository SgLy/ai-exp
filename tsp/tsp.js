'use strict';

/* global Chart */
/* eslint-disable no-console */

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
                label: 'Answer',
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: false,
                borderColor: 'rgba(255, 99, 132, 1)',
                pointRadius: 0,
                lineTension: 0
            }, {
                label: 'Current best length',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: false,
                borderColor: 'rgba(54, 162, 235, 1)',
                pointRadius: 0,
                lineTension: 0
            }, {
                label: 'Current length',
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
    $('.ga-info').hide();
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
function update(path, data) {
    clearPath(path);
    setPath(path);
    for (let k of Object.keys(data))
        $(`#${k}`).html(data[k]);
    $('#error').html(`${((data.best - answer) / answer * 100).toFixed(3)}%`);
    refreshSvg();

    chart.data.labels.push(data.label);
    chart.data.datasets[0].data.push(answer);
    chart.data.datasets[1].data.push(data.best);
    chart.data.datasets[2].data.push(data.current);
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

let randInt = (n) => Math.floor(Math.random() * n);

let sqr = (x) => x * x;
let calcDistance = (i, j) =>
    Math.sqrt(sqr(points[i].X - points[j].X) + sqr(points[i].Y - points[j].Y));
let distanceBuffer;
let distance = (i, j) => distanceBuffer[i][j];
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
    $('.ga-info').detach().appendTo('#info > .segment').hide();
    $('.sa-info').show();

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
    let current = sum, best = sum, bestpath = path.slice(0);
    let changes = 0, imprvs = 0, iters = 0;
    let p = new Promise((resolve) => { resolve(); });
    for (let T = init_temp, i = 0; T > 1; T *= decay, ++i)
        p = p.then(() => new Promise((resolve) => {
            setTimeout(() => {
                best = getDistanceSum(bestpath);
                current = getDistanceSum(path);
                let nextIter = 10000;
                iters += nextIter;
                update(bestpath, {
                    best,
                    current,
                    iters,
                    label: iters,
                    temp: T,
                    changes,
                    imprvs
                });
                console.time('loop');
                for (let i = 0; i < nextIter; ++i) {
                    let p = randInt(n);
                    let q = randInt(n);
                    if (p === q)
                        q = (p + 1) % n;
                    let cur = current;
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

                    if (cur < current || (isSA && Math.random() < Math.exp((current - cur) / T))) {
                        current = cur;
                        if (type === 1)
                            [path[p], path[q]] = [path[q], path[p]];
                        else if (type === 2)
                            path.reverse(p, q);
                        ++changes;
                    }
                    if (current < best) {
                        best = current;
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

/*
function roulette(p) {
    let r = Math.random(), i;
    for (i = 0; i < p.length && r > 0; ++i)
        r -= p[i];
    return Math.min(p.length - 1, i);
}
function calcWeight(nowposter) {
    let weight = nowposter.map(p => 1 / getDistanceSum(p));
    weight = weight.map(x => Math.pow(x, 5));
    let sum = weight.reduce((s, w) => s + w, 0);
    return weight.map(w => w / sum);
}
function crossover(n, dad, mom) {
    let p, q;
    do {
        p = randInt(n);
        q = randInt(n);
    } while (p === q);
    if (p > q)
        [p, q] = [q, p];
    let a = $.extend(true, [], dad);
    let b = $.extend(true, [], mom);
    for (let i = p; i < q; i++)
        [a[i], b[i]] = [b[i], a[i]];
    let f, flag;
    do {
        f = false;
        flag = Array(n).fill(-1);
        for (let i = 0; i < a.length; i++)
            if (flag[a[i]] === -1)
                flag[a[i]] = i;
            else {
                f = true;
                a[i] = b[flag[a[i]]];
            }

        flag = Array(n).fill(-1);
        for (let i = 0; i < b.length; i++)
            if (flag[b[i]] === -1)
                flag[b[i]] = i;
            else {
                f = true;
                b[i] = a[flag[b[i]]];
            }
    } while (f);
    return [a, b];
}
*/
/*
function encode(arr) {
    let n = arr.length;
    let ref = Array(n).fill(0).map((_, i) => i);
    let res = [];
    arr.forEach((v) => {
        let p = ref.findIndex(r => r === v);
        ref.splice(p, 1);
        res.push(p);
    });
    return res;
}
function decode(arr) {
    let n = arr.length;
    let ref = Array(n).fill(0).map((_, i) => i);
    let res = [];
    arr.forEach((v) => {
        res.push(ref[v]);
        ref.splice(v, 1);
    });
    return res;
}
function crossover(dad, mom) {
    let n = dad.length;
    let a = encode(dad), b = encode(mom);
    let p = randInt(n), q = randInt(n);
    if (p === q)
        q = (p + 1) % n;
    for (let i = p; i <= q; ++i)
        [a[i], b[i]] = [b[i], a[i]];
    return [decode(a), decode(b)];
}
*/
function crossoverOnce(dad, mom, direction) {
    let n = dad.length;
    let a = $.extend(true, [], dad);
    let b = $.extend(true, [], mom);
    let res = [];
    let c = a[randInt(n)];
    res.push(c);
    while (res.length < n) {
        let ia = a.findIndex(v => v === c);
        let ib = b.findIndex(v => v === c);
        a.splice(ia, 1);
        b.splice(ib, 1);
        ia = a[(ia + direction + a.length) % a.length];
        ib = b[(ib + direction + b.length) % b.length];
        c = distance(c, ia) < distance(c, ib) ? ia : ib;
        res.push(c);
    }
    return res;
}
function crossover(dad, mom) {
    return [crossoverOnce(dad, mom, 1), crossoverOnce(mom, dad, -1)];
}

function geneticAlgorithm(points) {
    $('.sa-info').detach().appendTo('#info > .segment').hide();
    $('.ga-info').show();

    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.data.datasets[1].data = [];
    chart.data.datasets[2].data = [];
    chart.update();

    const size = 50;
    const bestN = 4;
    let n = points.length;
    let all = [[
        Array(n).fill(0).map((_, i) => i),
        Array(n).fill(0).map((_, i) => n - 1 - i),
    ]];
    for (let k = all.length + 1; k < size; ++k) {
        let t = Array(n).fill(0).map((_, i) => i);
        t.shuffle();
        all[0].push(t);
    }
    let globalMinLength = 1e10, globalMin;
    let current = all[0];
    let p = new Promise((resolve) => {
        console.time('GA');
        resolve();
    });
    let historyBest = [];
    let end = false;
    for (let generation = 0; generation < 1000; ++generation)
        p = p.then(() => new Promise((resolve) => {
            setTimeout(() => {
                if (end) {
                    resolve();
                    return;
                }
                console.time(`Generation ${generation}`);
                current.sort((a, b) => getDistanceSum(a) - getDistanceSum(b));
                current = current.slice(0, bestN);
                let son = [];

                for (let p = 0; p < current.length; ++p)
                    for (let q = p + 1; q < current.length; ++q)
                        son = son.concat(crossover(current[p], current[q]));

                while (son.length < size) {
                    let r = [];
                    let bestLength = 1e100;
                    for (let i = 0; i < 100; ++i) {
                        let type = randInt(2);
                        let p = randInt(n);
                        let q = randInt(n);
                        if (p === q)
                            q = (p + 1) % n;
                        let t = $.extend(true, [], current[randInt(bestN)]);
                        if (type === 0) {
                            // Swap
                            [t[p], t[q]] = [t[q], t[p]];
                        } else if (type === 1) {
                            // Reverse
                            for (let l = p, r = q; l <= r; l++, r--)
                                [t[l], t[r]] = [t[r], t[l]];
                        }
                        let len = getDistanceSum(t);
                        if (len < bestLength) {
                            bestLength = len;
                            r = t;
                        }
                    }
                    son.push(r);
                }

                console.timeEnd(`Generation ${generation}`);
                let pathLength = current.map(getDistanceSum);
                let minLength = Math.min(...pathLength);
                let min = pathLength.findIndex(l => l === minLength);
                if (minLength < globalMinLength) {
                    globalMinLength = minLength;
                    globalMin = $.extend(true, [], current[min]);
                }
                update(current[min], {
                    best: globalMinLength,
                    current: minLength,
                    label: generation,
                    gen: generation
                });

                if (generation > 50) {
                    if (historyBest[generation - 50] - globalMinLength < answer / 200)
                        end = true;
                }
                historyBest.push(globalMinLength);
                all.push(son);
                current = son;
                resolve();
            }, 0);
        }));
    p.then(() => new Promise(() => {
        console.timeEnd('GA');
        console.log(`Best path: ${globalMin}`);
    }));
}

let code = 'ch130';
$(() => {
    init('svg', 'table', 'canvas');
    $('#sa').on('click', () => { simulatedAnnealing(points, true); });
    $('#hill-climb').on('click', () => { simulatedAnnealing(points, false); });
    $('#ga').on('click', () => { geneticAlgorithm(points); });
    $('#init-temp').on('change', function() {
        init_temp = $(this).val();
    });
    $('#decay').on('change', function() {
        decay = $(this).val();
    });
    $('#code-dropdown').dropdown({
        onChange: (value) => {
            code = `${value}.tsp`;
            $.get(`http:/sgly.tk/tsp/${code}`, (v) => {
                let data = JSON.parse(v);
                answer = data.answer;
                points = data.points;
                addPoints(data.points);
                calcDistanceBuffer();
                refreshSvg();
            });
        }
    });
    $('#code-dropdown').dropdown('set value', code);
});

