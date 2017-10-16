'use strict';

// SOURCE  : tsplib
// ORIGIN  : http://comopt.ifi.uni-heidelberg.de/software/TSPLIB95/tsp
// DATA ID : pr144
// ANSWER  : 58537
let points = JSON.parse(`
[
    { "X": 4350, "Y": 4425, "ID": 1 },
    { "X": 4500, "Y": 4425, "ID": 2 },
    { "X": 4300, "Y": 4725, "ID": 3 },
    { "X": 4300, "Y": 4825, "ID": 4 },
    { "X": 4300, "Y": 4950, "ID": 5 },
    { "X": 4300, "Y": 5050, "ID": 6 },
    { "X": 4350, "Y": 8875, "ID": 7 },
    { "X": 4500, "Y": 8875, "ID": 8 },
    { "X": 4300, "Y": 9175, "ID": 9 },
    { "X": 4300, "Y": 9275, "ID": 10 },
    { "X": 4300, "Y": 9400, "ID": 11 },
    { "X": 4300, "Y": 9500, "ID": 12 },
    { "X": 4950, "Y": 10600, "ID": 13 },
    { "X": 5150, "Y": 10600, "ID": 14 },
    { "X": 5525, "Y": 9525, "ID": 15 },
    { "X": 5525, "Y": 9425, "ID": 16 },
    { "X": 5525, "Y": 9225, "ID": 17 },
    { "X": 5525, "Y": 9125, "ID": 18 },
    { "X": 4950, "Y": 8875, "ID": 19 },
    { "X": 5250, "Y": 8875, "ID": 20 },
    { "X": 5550, "Y": 8875, "ID": 21 },
    { "X": 4950, "Y": 6150, "ID": 22 },
    { "X": 5150, "Y": 6150, "ID": 23 },
    { "X": 5525, "Y": 5075, "ID": 24 },
    { "X": 5525, "Y": 4975, "ID": 25 },
    { "X": 5525, "Y": 4775, "ID": 26 },
    { "X": 5525, "Y": 4675, "ID": 27 },
    { "X": 4950, "Y": 4425, "ID": 28 },
    { "X": 5250, "Y": 4425, "ID": 29 },
    { "X": 5550, "Y": 4425, "ID": 30 },
    { "X": 5875, "Y": 2325, "ID": 31 },
    { "X": 5875, "Y": 2475, "ID": 32 },
    { "X": 5875, "Y": 2625, "ID": 33 },
    { "X": 5875, "Y": 2775, "ID": 34 },
    { "X": 5675, "Y": 4825, "ID": 35 },
    { "X": 5675, "Y": 4925, "ID": 36 },
    { "X": 5875, "Y": 6775, "ID": 37 },
    { "X": 5875, "Y": 6925, "ID": 38 },
    { "X": 5875, "Y": 7075, "ID": 39 },
    { "X": 5875, "Y": 7225, "ID": 40 },
    { "X": 5675, "Y": 9275, "ID": 41 },
    { "X": 5675, "Y": 9375, "ID": 42 },
    { "X": 8125, "Y": 10150, "ID": 43 },
    { "X": 8225, "Y": 10150, "ID": 44 },
    { "X": 8325, "Y": 10150, "ID": 45 },
    { "X": 8125, "Y": 5700, "ID": 46 },
    { "X": 8225, "Y": 5700, "ID": 47 },
    { "X": 8325, "Y": 5700, "ID": 48 },
    { "X": 8675, "Y": 3150, "ID": 49 },
    { "X": 8675, "Y": 3250, "ID": 50 },
    { "X": 8675, "Y": 3350, "ID": 51 },
    { "X": 8675, "Y": 3450, "ID": 52 },
    { "X": 8675, "Y": 3550, "ID": 53 },
    { "X": 8675, "Y": 3650, "ID": 54 },
    { "X": 8675, "Y": 3750, "ID": 55 },
    { "X": 8675, "Y": 3850, "ID": 56 },
    { "X": 8675, "Y": 3950, "ID": 57 },
    { "X": 8675, "Y": 4050, "ID": 58 },
    { "X": 8425, "Y": 5700, "ID": 59 },
    { "X": 8525, "Y": 5700, "ID": 60 },
    { "X": 8675, "Y": 7600, "ID": 61 },
    { "X": 8675, "Y": 7700, "ID": 62 },
    { "X": 8675, "Y": 7800, "ID": 63 },
    { "X": 8675, "Y": 7900, "ID": 64 },
    { "X": 8675, "Y": 8000, "ID": 65 },
    { "X": 8675, "Y": 8100, "ID": 66 },
    { "X": 8675, "Y": 8200, "ID": 67 },
    { "X": 8675, "Y": 8300, "ID": 68 },
    { "X": 8675, "Y": 8400, "ID": 69 },
    { "X": 8675, "Y": 8500, "ID": 70 },
    { "X": 8425, "Y": 10150, "ID": 71 },
    { "X": 8525, "Y": 10150, "ID": 72 },
    { "X": 10850, "Y": 9500, "ID": 73 },
    { "X": 10850, "Y": 9400, "ID": 74 },
    { "X": 10850, "Y": 9275, "ID": 75 },
    { "X": 10850, "Y": 9175, "ID": 76 },
    { "X": 10900, "Y": 8875, "ID": 77 },
    { "X": 11050, "Y": 8875, "ID": 78 },
    { "X": 10850, "Y": 5050, "ID": 79 },
    { "X": 10850, "Y": 4950, "ID": 80 },
    { "X": 10850, "Y": 4825, "ID": 81 },
    { "X": 10850, "Y": 4725, "ID": 82 },
    { "X": 10900, "Y": 4425, "ID": 83 },
    { "X": 11050, "Y": 4425, "ID": 84 },
    { "X": 11500, "Y": 4425, "ID": 85 },
    { "X": 11800, "Y": 4425, "ID": 86 },
    { "X": 11500, "Y": 6150, "ID": 87 },
    { "X": 11700, "Y": 6150, "ID": 88 },
    { "X": 11500, "Y": 8875, "ID": 89 },
    { "X": 11800, "Y": 8875, "ID": 90 },
    { "X": 11500, "Y": 10600, "ID": 91 },
    { "X": 11700, "Y": 10600, "ID": 92 },
    { "X": 12075, "Y": 9525, "ID": 93 },
    { "X": 12075, "Y": 9425, "ID": 94 },
    { "X": 12225, "Y": 9375, "ID": 95 },
    { "X": 12225, "Y": 9275, "ID": 96 },
    { "X": 12075, "Y": 9225, "ID": 97 },
    { "X": 12075, "Y": 9125, "ID": 98 },
    { "X": 12100, "Y": 8875, "ID": 99 },
    { "X": 12425, "Y": 7225, "ID": 100 },
    { "X": 12425, "Y": 7075, "ID": 101 },
    { "X": 12425, "Y": 6925, "ID": 102 },
    { "X": 12425, "Y": 6775, "ID": 103 },
    { "X": 12075, "Y": 5075, "ID": 104 },
    { "X": 12075, "Y": 4975, "ID": 105 },
    { "X": 12225, "Y": 4925, "ID": 106 },
    { "X": 12225, "Y": 4825, "ID": 107 },
    { "X": 12075, "Y": 4775, "ID": 108 },
    { "X": 12075, "Y": 4675, "ID": 109 },
    { "X": 12100, "Y": 4425, "ID": 110 },
    { "X": 12425, "Y": 2775, "ID": 111 },
    { "X": 12425, "Y": 2625, "ID": 112 },
    { "X": 12425, "Y": 2475, "ID": 113 },
    { "X": 12425, "Y": 2325, "ID": 114 },
    { "X": 14675, "Y": 5700, "ID": 115 },
    { "X": 14675, "Y": 10150, "ID": 116 },
    { "X": 14775, "Y": 10150, "ID": 117 },
    { "X": 14875, "Y": 10150, "ID": 118 },
    { "X": 14975, "Y": 10150, "ID": 119 },
    { "X": 15075, "Y": 10150, "ID": 120 },
    { "X": 15225, "Y": 8500, "ID": 121 },
    { "X": 15225, "Y": 8400, "ID": 122 },
    { "X": 15225, "Y": 8300, "ID": 123 },
    { "X": 15225, "Y": 8200, "ID": 124 },
    { "X": 15225, "Y": 8100, "ID": 125 },
    { "X": 15225, "Y": 8000, "ID": 126 },
    { "X": 15225, "Y": 7900, "ID": 127 },
    { "X": 15225, "Y": 7800, "ID": 128 },
    { "X": 15225, "Y": 7700, "ID": 129 },
    { "X": 15225, "Y": 7600, "ID": 130 },
    { "X": 14775, "Y": 5700, "ID": 131 },
    { "X": 14875, "Y": 5700, "ID": 132 },
    { "X": 14975, "Y": 5700, "ID": 133 },
    { "X": 15075, "Y": 5700, "ID": 134 },
    { "X": 15225, "Y": 4050, "ID": 135 },
    { "X": 15225, "Y": 3950, "ID": 136 },
    { "X": 15225, "Y": 3850, "ID": 137 },
    { "X": 15225, "Y": 3750, "ID": 138 },
    { "X": 15225, "Y": 3650, "ID": 139 },
    { "X": 15225, "Y": 3550, "ID": 140 },
    { "X": 15225, "Y": 3450, "ID": 141 },
    { "X": 15225, "Y": 3350, "ID": 142 },
    { "X": 15225, "Y": 3250, "ID": 143 },
    { "X": 15225, "Y": 3150, "ID": 144 }
]`);
let svg, table;
let drawRatio;
let offsetX, offsetY;

function init(svgSelector = 'svg', tableSelector = 'table', ratio = 0.05) {
    svg = svgSelector;
    table = tableSelector;
    $(svg)
        .attr({
            version: '1.1',
            xmlns: 'http://www.w3.org/2000/svg'
        });
    drawRatio = ratio;
}
function refreshSvg() {
    $('body').html($('body').html());
}
function addPoint(point) {
    $('<circle></circle>')
        .attr({
            'point-id': point.ID,
            cx: point.X * drawRatio - offsetX,
            cy: point.Y * drawRatio - offsetY,
            r: 40 * drawRatio,
            fill: 'black'
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
    offsetX = minX * drawRatio - 10;
    offsetY = minY * drawRatio - 10;
    $(svg).attr({
        width: (maxX - minX) * drawRatio + 20,
        height: (maxY - minY) * drawRatio + 20
    });
    $(table).children('tbody').remove();
    $('<tbody></tbody>').appendTo($(table));
    $.each(points, (index, value) => addPoint(value));
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
            stroke: 'rgba(0, 0, 255, 0.5)'
        })
        .appendTo($(svg));
}
function bindTableSvg() {
    for (let i = 0; i < points.length; ++i)
        $(`[row-id=${i}]`)
            .off('mouseenter')
            .on('mouseenter', function () {
                $(`[point-id=${i}]`).attr('r', 40 * drawRatio * 2.5);
                $(this).css('box-shadow', 'inset 0 0 1px 1px black');
            })
            .off('mouseleave')
            .on('mouseleave', function() {
                $(`[point-id=${i}]`).attr('r', 40 * drawRatio);
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
let distance = (i, j) =>
    Math.sqrt(sqr(points[i].X - points[j].X) + sqr(points[i].Y - points[j].Y));
function getDistanceSum(path) {
    let n = path.length, s = 0;
    for(let i = 0; i < n; ++i)
        s += distance(path[i], path[(i + 1) % n], points);
    return s;
}

//默认从0-n-1的序列进行便利
/*    let sum = 0;
    //1.n^2顺序领域交换
    for (let i = 0; i < n; ++i)
      for (let j = 0; j < n; ++j)
      if (j != i){
          [path[i],path[j]] = [path[j],path[i]]
          sum = getDistanceSum(path,points);
          if (sum < sum_ini) {
            clearPath();
            setPath(path);
            sum_ini = sum;
          }else{
          [path[j],path[i]] = [path[i],path[j]]
          }
      }
    console.log(sum_ini);
    //2.1000次随机领域搜索

    // let num = 0;
    //
    // let i = parseInt(Math.random()*(n),10);
    // let j = parseInt(Math.random()*(n),10);
    // console.log(i);
    // console.log(j);
    // while (num < 1){
    //       let i = parseInt(Math.random()*(n),10);
    //       let j = parseInt(Math.random()*(n),10);
    //       [path[i],path[j]] = [path[j],path[i]]
    //       sum = getDistanceSum(path,points);
    //       console.log(sum)
    //       if (sum < sum_ini) {
    //         clearPath();
    //         setPath(path);
    //         num += 1;
    //         sum_ini = sum;
    //       }
    // }
    // console.log(sum_ini);
	*/

// 3.模拟退火 随便找两个交换版
function simulatedAnnealing(points) {
    let n = points.length;
    let path = [];
    for (let i = 0; i < n; ++i)
        path.push(i);
    path.shuffle();
    let sum = getDistanceSum(path);
    let now = sum, best = sum, bestpath = path.slice(0);
    let changes = 0, imprvs = 0;
    let p = new Promise((resolve) => { resolve(); });
    for (let T = 1000, i = 0; T > 1; T *= 0.99, ++i)
        p = p.then(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    let iters = i;
                    update(bestpath, best, now, iters * 100000, T, changes, imprvs);
                    console.time('loop');
                    for (let i = 0; i < 100000; ++i) {
                        let p = 0, q = 0;
                        do {
                            p = Math.floor(Math.random() * n);
                            q = Math.floor(Math.random() * n);
                        } while (p == q);
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
                        if (cur < now || Math.random() < Math.exp((now - cur) / T)) {
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
            });
        });
    // console.log('best '+best);
    // console.log('best0 '+getDistanceSum(bestpath,points));
    // console.log(bestpath);
    // console.log(sum);
}

$(document).ready(() => {
    init('svg', 'table');
    addPoints(points);
    //	shuffle(points);
    refreshSvg();
    bindTableSvg();
    simulatedAnnealing(points);
});
