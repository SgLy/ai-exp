'use strict';

/* global Chart */

// SOURCE  : tsplib
// ORIGIN  : http://comopt.ifi.uni-heidelberg.de/software/TSPLIB95/tsp
let points;
const answer = 58537;
let svg, table, chart;
let drawRatio;
let offsetX, offsetY;

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
                pointRadius: 0
            }, {
                label: 'Current length',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: false,
                borderColor: 'rgba(54, 162, 235, 1)',
                pointRadius: 0
            }, {
                label: 'Answer',
                data: [],
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                fill: false,
                borderColor: 'rgba(255, 206, 86, 1)',
                pointRadius: 0
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

    chart.data.labels.push(iters / 100000);
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
    let sum = getDistanceSum(path);
    let now = sum, best = sum, bestpath = path.slice(0);
    let changes = 0, imprvs = 0;
    let p = new Promise((resolve) => { resolve(); });
    for (let T = 200, i = 0; T > 1; T *= 0.95, ++i)
        p = p.then(() => new Promise((resolve) => {
            setTimeout(() => {
                let iters = i;
                best = getDistanceSum(bestpath);
                now = getDistanceSum(path);
                update(bestpath, best, now, iters * 100000, T, changes, imprvs);
                console.time('loop');
                for (let i = 0; i < 5000; ++i) {
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
        }));
    p.then(() => { console.log('Best route: ' + bestpath); });
    // console.log('best0 '+getDistanceSum(bestpath,points));
    // console.log(bestpath);
    // console.log(sum);
}

function main() {
    init('svg', 'table', 'canvas');
    addPoints(points);
    refreshSvg();
    simulatedAnnealing(points);
    bindTableSvg();
}
//4.遗传算法
function inbo(flag,n){
  for (let i = 0;i<n;i++)
    flag.push(0);
}
function suitvalue(path){
  return 1/getDistanceSum(path);
}
function calcweight(nowposter,weight){
  let sum = 0;
  for (let i = 0;i<nowposter.length;i++){
    weight[i] = suitvalue(nowposter[i]);
    sum += weight[i];
  };
  for (let i = 0;i<weight.length;i++)
    weight[i] = weight[i] / sum;
}
function jiaocha(dad,mom,jiaocha){
  let p = 0; let q = 0;
  do{
    p = Math.floor(Math.random() * n);
    q = Math.floor(Math.random() * n);
  }while (p == q);
  if (p > q) {let mid = p; p = q; q = mid;}
  let son1 = [];
  let son2 = [];
  for (let i = p;i<q;i++){
    let mid = dad[i]; dad[i] = mom[i];mom[i] = mid;}
  let mm  = 0;
  let flag = [];
  inbo(flag);
}
function GAag(points){
  const pc = 0.9;
  const pm = 0.01;
  let n = points.length;
  let path = [];
  for (let i = 0;i<n;i++)
    path.push(i);
  let GAcalc = 0;
  let son = [];
  let nowposter = [];
  nowposter.push(path);
  path.spice(0,path.length);
  for (let i = 0;i<n;i++)
    path.push(n-1-i);
  nowposter.push(path);
  son.push(nowposter);
  nowposter.spice(0,nowposter.length);
  //son 是存储所有的子代数组
  let weight = [];
  whiel (GAcalc < 1000){
    calcweight(son[GAcalc],weight);
    let jiaochasize = Math.round(son[GAcalc]*pc);
    let bianyiszie = Math.round(son[GAcalc]*pm);
    let bianyinownum = 0;
    for (bianyinownum;bianyinownum<bianyiszie;bianyinownum++){
      let p =Math.random();
      let now = 0; let nowsum = weight[now];
      while(nowsum<p){
        now++;
        nowsum+=weight[now];
      }
      let nowpath = son[GAcalc][now];
      do{
        p = Math.floor(Math.random() * n);
        q = Math.floor(Math.random() * n);
      }while (p == q);
      [p,q] = [q,p]
      nowposter.push(nowpath);
    }
    for (let i = 0; i< jiaochasize;i++){
      let p =Math.random();
      let now = 0; let nowsum = weight[now];
      while(nowsum<p){
        now++;
        nowsum+=weight[now];
      }
      let Dad = now;
      let p =Math.random();
      let now = 0; let nowsum = weight[now];
      while(nowsum<p){
        now++;
        nowsum+=weight[now];
      }
      let Mom = now;
      jiaocha(son[GAcalc][Dad],son[GAcalc][Mom],nowposter);
    }
    GAcalc++;
    son[GAcalc].push(nowposter);
    nowposter.spice(0,nowposter.length);
  }

}

$(() => {
    const code = 'pr144.tsp';
    $.get(`http://172.18.187.134/data/${code}`, (v) => {
        points = JSON.parse(v);
        main();
    });
});
