'use strict';

let points = JSON.parse(`
[
    { "X": 4350, "Y": 4425, "id": 1 },
    { "X": 4500, "Y": 4425, "id": 2 },
    { "X": 4300, "Y": 4725, "id": 3 },
    { "X": 4300, "Y": 4825, "id": 4 },
    { "X": 4300, "Y": 4950, "id": 5 },
    { "X": 4300, "Y": 5050, "id": 6 },
    { "X": 4350, "Y": 8875, "id": 7 },
    { "X": 4500, "Y": 8875, "id": 8 },
    { "X": 4300, "Y": 9175, "id": 9 },
    { "X": 4300, "Y": 9275, "id": 10 },
    { "X": 4300, "Y": 9400, "id": 11 },
    { "X": 4300, "Y": 9500, "id": 12 },
    { "X": 4950, "Y": 10600, "id": 13 },
    { "X": 5150, "Y": 10600, "id": 14 },
    { "X": 5525, "Y": 9525, "id": 15 },
    { "X": 5525, "Y": 9425, "id": 16 },
    { "X": 5525, "Y": 9225, "id": 17 },
    { "X": 5525, "Y": 9125, "id": 18 },
    { "X": 4950, "Y": 8875, "id": 19 },
    { "X": 5250, "Y": 8875, "id": 20 },
    { "X": 5550, "Y": 8875, "id": 21 },
    { "X": 4950, "Y": 6150, "id": 22 },
    { "X": 5150, "Y": 6150, "id": 23 },
    { "X": 5525, "Y": 5075, "id": 24 },
    { "X": 5525, "Y": 4975, "id": 25 },
    { "X": 5525, "Y": 4775, "id": 26 },
    { "X": 5525, "Y": 4675, "id": 27 },
    { "X": 4950, "Y": 4425, "id": 28 },
    { "X": 5250, "Y": 4425, "id": 29 },
    { "X": 5550, "Y": 4425, "id": 30 },
    { "X": 5875, "Y": 2325, "id": 31 },
    { "X": 5875, "Y": 2475, "id": 32 },
    { "X": 5875, "Y": 2625, "id": 33 },
    { "X": 5875, "Y": 2775, "id": 34 },
    { "X": 5675, "Y": 4825, "id": 35 },
    { "X": 5675, "Y": 4925, "id": 36 },
    { "X": 5875, "Y": 6775, "id": 37 },
    { "X": 5875, "Y": 6925, "id": 38 },
    { "X": 5875, "Y": 7075, "id": 39 },
    { "X": 5875, "Y": 7225, "id": 40 },
    { "X": 5675, "Y": 9275, "id": 41 },
    { "X": 5675, "Y": 9375, "id": 42 },
    { "X": 8125, "Y": 10150, "id": 43 },
    { "X": 8225, "Y": 10150, "id": 44 },
    { "X": 8325, "Y": 10150, "id": 45 },
    { "X": 8125, "Y": 5700, "id": 46 },
    { "X": 8225, "Y": 5700, "id": 47 },
    { "X": 8325, "Y": 5700, "id": 48 },
    { "X": 8675, "Y": 3150, "id": 49 },
    { "X": 8675, "Y": 3250, "id": 50 },
    { "X": 8675, "Y": 3350, "id": 51 },
    { "X": 8675, "Y": 3450, "id": 52 },
    { "X": 8675, "Y": 3550, "id": 53 },
    { "X": 8675, "Y": 3650, "id": 54 },
    { "X": 8675, "Y": 3750, "id": 55 },
    { "X": 8675, "Y": 3850, "id": 56 },
    { "X": 8675, "Y": 3950, "id": 57 },
    { "X": 8675, "Y": 4050, "id": 58 },
    { "X": 8425, "Y": 5700, "id": 59 },
    { "X": 8525, "Y": 5700, "id": 60 },
    { "X": 8675, "Y": 7600, "id": 61 },
    { "X": 8675, "Y": 7700, "id": 62 },
    { "X": 8675, "Y": 7800, "id": 63 },
    { "X": 8675, "Y": 7900, "id": 64 },
    { "X": 8675, "Y": 8000, "id": 65 },
    { "X": 8675, "Y": 8100, "id": 66 },
    { "X": 8675, "Y": 8200, "id": 67 },
    { "X": 8675, "Y": 8300, "id": 68 },
    { "X": 8675, "Y": 8400, "id": 69 },
    { "X": 8675, "Y": 8500, "id": 70 },
    { "X": 8425, "Y": 10150, "id": 71 },
    { "X": 8525, "Y": 10150, "id": 72 },
    { "X": 10850, "Y": 9500, "id": 73 },
    { "X": 10850, "Y": 9400, "id": 74 },
    { "X": 10850, "Y": 9275, "id": 75 },
    { "X": 10850, "Y": 9175, "id": 76 },
    { "X": 10900, "Y": 8875, "id": 77 },
    { "X": 11050, "Y": 8875, "id": 78 },
    { "X": 10850, "Y": 5050, "id": 79 },
    { "X": 10850, "Y": 4950, "id": 80 },
    { "X": 10850, "Y": 4825, "id": 81 },
    { "X": 10850, "Y": 4725, "id": 82 },
    { "X": 10900, "Y": 4425, "id": 83 },
    { "X": 11050, "Y": 4425, "id": 84 },
    { "X": 11500, "Y": 4425, "id": 85 },
    { "X": 11800, "Y": 4425, "id": 86 },
    { "X": 11500, "Y": 6150, "id": 87 },
    { "X": 11700, "Y": 6150, "id": 88 },
    { "X": 11500, "Y": 8875, "id": 89 },
    { "X": 11800, "Y": 8875, "id": 90 },
    { "X": 11500, "Y": 10600, "id": 91 },
    { "X": 11700, "Y": 10600, "id": 92 },
    { "X": 12075, "Y": 9525, "id": 93 },
    { "X": 12075, "Y": 9425, "id": 94 },
    { "X": 12225, "Y": 9375, "id": 95 },
    { "X": 12225, "Y": 9275, "id": 96 },
    { "X": 12075, "Y": 9225, "id": 97 },
    { "X": 12075, "Y": 9125, "id": 98 },
    { "X": 12100, "Y": 8875, "id": 99 },
    { "X": 12425, "Y": 7225, "id": 100 },
    { "X": 12425, "Y": 7075, "id": 101 },
    { "X": 12425, "Y": 6925, "id": 102 },
    { "X": 12425, "Y": 6775, "id": 103 },
    { "X": 12075, "Y": 5075, "id": 104 },
    { "X": 12075, "Y": 4975, "id": 105 },
    { "X": 12225, "Y": 4925, "id": 106 },
    { "X": 12225, "Y": 4825, "id": 107 },
    { "X": 12075, "Y": 4775, "id": 108 },
    { "X": 12075, "Y": 4675, "id": 109 },
    { "X": 12100, "Y": 4425, "id": 110 },
    { "X": 12425, "Y": 2775, "id": 111 },
    { "X": 12425, "Y": 2625, "id": 112 },
    { "X": 12425, "Y": 2475, "id": 113 },
    { "X": 12425, "Y": 2325, "id": 114 },
    { "X": 14675, "Y": 5700, "id": 115 },
    { "X": 14675, "Y": 10150, "id": 116 },
    { "X": 14775, "Y": 10150, "id": 117 },
    { "X": 14875, "Y": 10150, "id": 118 },
    { "X": 14975, "Y": 10150, "id": 119 },
    { "X": 15075, "Y": 10150, "id": 120 },
    { "X": 15225, "Y": 8500, "id": 121 },
    { "X": 15225, "Y": 8400, "id": 122 },
    { "X": 15225, "Y": 8300, "id": 123 },
    { "X": 15225, "Y": 8200, "id": 124 },
    { "X": 15225, "Y": 8100, "id": 125 },
    { "X": 15225, "Y": 8000, "id": 126 },
    { "X": 15225, "Y": 7900, "id": 127 },
    { "X": 15225, "Y": 7800, "id": 128 },
    { "X": 15225, "Y": 7700, "id": 129 },
    { "X": 15225, "Y": 7600, "id": 130 },
    { "X": 14775, "Y": 5700, "id": 131 },
    { "X": 14875, "Y": 5700, "id": 132 },
    { "X": 14975, "Y": 5700, "id": 133 },
    { "X": 15075, "Y": 5700, "id": 134 },
    { "X": 15225, "Y": 4050, "id": 135 },
    { "X": 15225, "Y": 3950, "id": 136 },
    { "X": 15225, "Y": 3850, "id": 137 },
    { "X": 15225, "Y": 3750, "id": 138 },
    { "X": 15225, "Y": 3650, "id": 139 },
    { "X": 15225, "Y": 3550, "id": 140 },
    { "X": 15225, "Y": 3450, "id": 141 },
    { "X": 15225, "Y": 3350, "id": 142 },
    { "X": 15225, "Y": 3250, "id": 143 },
    { "X": 15225, "Y": 3150, "id": 144 }
]`);
let svg;
let drawRatio;
let offsetX, offsetY;

function initSvg(cssSelector, ratio = 0.1) {
    svg = cssSelector;
    $(svg)
        .attr({
            width: '1200px',
            height: '900px',
            version: '1.1',
            xmlns: 'http://www.w3.org/2000/svg'
        });
    drawRatio = ratio;
}
function refreshSvg() {
    $('body').html($('body').html());
}
function addPoint(point) {
    $(`<circle cx=${point.X * drawRatio - offsetX} cy=${point.Y * drawRatio - offsetY} r=2 fill=black>`).appendTo($(svg));
}
function addPoints(points) {
    offsetX = offsetY = 1e10;
    $.each(points, (_, value) => {
        offsetX = Math.min(offsetX, value.X);
        offsetY = Math.min(offsetY, value.Y);
    });
    offsetX = offsetX * drawRatio - 20;
    offsetY = offsetY * drawRatio - 20;
    $.each(points, (index, value) => addPoint(value));
}
function clearPoints() {
    $(svg).children('circle').remove();
}
function clearPath() {
    $(svg).children('path').remove();
}
function addPath(path) {
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

function shuffle(a) {
    for (let i = a.length - 1; i > 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
}

function calc_sum(path,points){
  let n = points.length;
  let sum_mid = 0;
  for (let k = 1; k < n; ++k){
    sum_mid += distance(path[k-1],path[k],points);
  }
    sum_mid += distance(path[n-1],path[0],points);
  return sum_mid;
}

function distance(i,j,points){
    return Math.sqrt((points[i].X-points[j].X)*(points[i].X-points[j].X)+(points[i].Y-points[j].Y)*(points[i].Y-points[j].Y));
}
function getSumOfDis(path,points){
	let n=path.length,s=0;
	for(let i=0;i<n;++i)
		s+=distance(path[i],path[(i+1)%n],points);
	return s;
}

function exampleAlgorithm(points) {
    clearPath();
    let n = points.length;
    let path = [];
    let sum_ini = 0;
    path.push(0);
    for (let i = 1; i < n; ++i){
        path.push(i);
        sum_ini += Math.sqrt((points[i].X-points[i-1].X)*(points[i].X-points[i-1].X)+(points[i].Y-points[i-1].Y)*(points[i].Y-points[i-1].Y));
    }
    sum_ini += Math.sqrt((points[n-1].X-points[0].X)*(points[n-1].X-points[0].X)+(points[n-1].Y-points[0].Y)*(points[n-1].Y-points[0].Y));
    console.log(sum_ini);
    //默认从0-n-1的序列进行便利
/*    let sum = 0;
    //1.n^2顺序领域交换
    for (let i = 0; i < n; ++i)
      for (let j = 0; j < n; ++j)
      if (j != i){
          [path[i],path[j]] = [path[j],path[i]]
          sum = calc_sum(path,points);
          if (sum < sum_ini) {
            clearPath();
            addPath(path);
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
    //       sum = calc_sum(path,points);
    //       console.log(sum)
    //       if (sum < sum_ini) {
    //         clearPath();
    //         addPath(path);
    //         num += 1;
    //         sum_ini = sum;
    //       }
    // }
    // console.log(sum_ini);
	*/
	// 3.模拟退火 随便找两个交换版
	
	let now=sum_ini,cur=sum_ini,best=sum_ini,bestpath=path.slice(0);
	for(let T=1000;T>1;T*=0.9)
		for(let i=0;i<100000;++i){
			let p=0,q=0;
			do{
				p=Math.floor(Math.random()*n), q=Math.floor(Math.random()*n);
			}while(p==q);
//			console.log(now);
			
/*			[path[p],path[q]] = [path[q],path[p]];
			cur=getSumOfDis(path,points);
			[path[p],path[q]] = [path[q],path[p]];
*/
//			console.log(cur);
			
			let cur0=now;
			if((q+1)%n==p)
				[p,q]=[q,p]
			
			if((p+1)%n==q){ // r p q s
				let r=(p+n-1)%n, s=(q+1)%n;
				cur0-=distance(path[r],path[p],points);
				cur0-=distance(path[p],path[q],points);
				cur0-=distance(path[q],path[s],points);
				cur0+=distance(path[r],path[q],points);
				cur0+=distance(path[q],path[p],points);
				cur0+=distance(path[p],path[s],points);
			}else{
				cur0-=distance(path[(p+n-1)%n],path[p],points);
				cur0-=distance(path[p],path[(p+1)%n],points);
				cur0+=distance(path[(p+n-1)%n],path[q],points);
				cur0+=distance(path[q],path[(p+1)%n],points);
				
				cur0-=distance(path[(q+n-1)%n],path[q],points);
				cur0-=distance(path[q],path[(q+1)%n],points);
				cur0+=distance(path[(q+n-1)%n],path[p],points);
				cur0+=distance(path[p],path[(q+1)%n],points);
			}
			
//			console.log("cur "+cur);
//			console.log("cur0 "+cur0);
//			console.log(cur==cur0);
			
			
/*			let t0=Math.random(),t1=Math.exp((now - cur) / T);
			console.log("random "+t0);
			console.log("exp "+t1);
*/			
			if(Math.random() < Math.exp((now - cur0) / T)){
				now=cur0;
				[path[p],path[q]] = [path[q],path[p]]
			}
//			console.log(now);
			if(now<best){
				console.log("wow");
//				console.log(p);
//				console.log(q);
				best=now;
				bestpath=path.slice(0);
			}
		}
	console.log("best "+best);
	console.log("best0 "+getSumOfDis(bestpath,points));
	console.log(bestpath);
	console.log(sum_ini);
    clearPath();
    addPath(bestpath);
	
    refreshSvg();
}


$(document).ready(() => {
    initSvg('svg', 0.05);
    addPoints(points);
//	shuffle(points);
    refreshSvg();
    exampleAlgorithm(points);
});
