'use strict';

/* global PriorityQueue, jsPlumb */
/* eslint-disable no-console */

class Queue {
    constructor() {
        this.arr = [];
        this.left = 0;
        this.right = 0;
    }
    get length() {
        return this.right - this.left;
    }
    queue(x) {
        this.arr.push(x);
        this.right++;
    }
    dequeue() {
        return this.arr[this.left++];
    }
}

let set = new Set(); // no class static variable workaround
class Node {
    constructor(arr, parent, depth) {
        this.arr = $.extend(true, [], arr);
        this.zero = arr.findIndex((v) => v === 0);
        this.parent = parent;
        this.child = [];
        this.depth = depth;
        this.id = this.levelId = -1;
    }
    get up() {
        let n = new Node(this.arr, this, this.depth + 1);
        if (n.zero < 3)
            return undefined;
        [n.arr[n.zero], n.arr[n.zero - 3]] = [n.arr[n.zero - 3], n.arr[n.zero]];
        n.zero -= 3;
        return n;
    }
    get down() {
        let n = new Node(this.arr, this, this.depth + 1);
        if (n.zero > 5)
            return undefined;
        [n.arr[n.zero], n.arr[n.zero + 3]] = [n.arr[n.zero + 3], n.arr[n.zero]];
        n.zero += 3;
        return n;
    }
    get left() {
        let n = new Node(this.arr, this, this.depth + 1);
        if (n.zero % 3 === 0)
            return undefined;
        [n.arr[n.zero], n.arr[n.zero - 1]] = [n.arr[n.zero - 1], n.arr[n.zero]];
        n.zero -= 1;
        return n;
    }
    get right() {
        let n = new Node(this.arr, this, this.depth + 1);
        if (n.zero % 3 === 2)
            return undefined;
        [n.arr[n.zero], n.arr[n.zero + 1]] = [n.arr[n.zero + 1], n.arr[n.zero]];
        n.zero += 1;
        return n;
    }
    get string() {
        return this.arr.reduce((s, v) => s + v, '');
    }
    static get set() {
        return set;
    }
    get visited() {
        return Node.set.has(this.string);
    }
    visit() {
        Node.set.add(this.string);
    }

    get html() {
        let res = $('<table><tbody></tbody></table>');
        for (let i = 0; i < 3; ++i) {
            let row = $('<tr></tr>');
            for (let j = 0; j < 3; ++j) {
                let cell = $('<td></td>');
                cell.data('x', i);
                cell.data('y', j);
                if ((i + j) % 2 == 0)
                    cell.addClass('even');
                else
                    cell.addClass('odd');
                if (this.arr[i * 3 + j] !== 0)
                    cell.append($(`<code>${this.arr[i * 3 + j]}</code>`));
                row.append(cell);
            }
            res.append(row);
        }
        if (this.isAnswer === true)
            res.addClass('answer');
        return res;
    }
}

let root = new Node(Array(9).fill(0), undefined, -1);
// let start = new Node([5, 6, 3, 1, 0, 8, 7, 2, 4], root, 0);
let start = new Node([8, 1, 3, 7, 2, 4, 6, 0, 5], root, 0);
let final = new Node([1, 2, 3, 8, 0, 4, 7, 6, 5]);
let ans;
let searchedCount = 0;
let allNodes = [];
function search() {
    // let q = new PriorityQueue({ comparator: (a, b) => a.string < b.string });
    let q = new Queue();
    q.queue(start);

    console.time('search');
    while (q.length !== 0) {
        let current = q.dequeue(), next;
        if (current.visited === true)
            continue;
        current.id = allNodes.length;
        allNodes.push(current);
        ++searchedCount;
        current.visit();
        if (current.string === final.string) {
            console.log('got');
            ans = current;
            break;
        }
        if ((next = current.up) !== undefined)
            q.queue(next);
        if ((next = current.down) !== undefined)
            q.queue(next);
        if ((next = current.left) !== undefined)
            q.queue(next);
        if ((next = current.right) !== undefined)
            q.queue(next);
    }
    console.timeEnd('search');
    while (ans !== root) {
        ans.isAnswer = true;
        ans = ans.parent;
    }
    while (q.length !== 0) {
        let current = q.dequeue();
        current.id = allNodes.length;
        allNodes.push(current);
    }
    allNodes.sort((a, b) =>
        (a.depth - b.depth) * 1e12
        + (a.parent.id - b.parent.id) * 1e6
        + (a.id - b.id)
    );
}

let container = $('<div></div>');
function render(renderLevel) {
    let nodes = allNodes.filter((n) => n.depth <= renderLevel);
    let maxDepth, depthCnt;
    maxDepth = nodes.reduce((m, n) => Math.max(m, n.depth), 0) + 1;
    depthCnt = Array(maxDepth).fill(0);
    nodes.forEach((n) => n.levelId = depthCnt[n.depth]++);
    nodes.forEach((n) => {
        n.L = 1e12;
        n.R = 0;
    });
    nodes.forEach((n) => {
        if (n.parent === undefined)
            return;
        n.parent.child.push(n);
    });
    for (let left = nodes.length - 1, right = left + 1; left >= 0; --left) {
        if (left === 0 || nodes[left].depth !== nodes[left - 1].depth) {
            for (let i = left; i < right; ++i) {
                let n = nodes[i];
                if (n.child.length === 0)
                    n.width = 1;
                else
                    n.width = n.child.reduce((w, c) => w + c.width, 0);
                n.L = (i !== left && nodes[i - 1].parent === n.parent) ? nodes[i - 1].R : 0;
                n.R = n.L + n.width * 100;
                n.X = (n.R - n.L) / 2 + n.L;
                n.Y = n.depth * 120;
            }
            right = left;
        }
    }
    nodes.forEach((n) => {
        let p = n.parent;
        while (p != root) {
            n.X += p.L;
            p = p.parent;
        }
    });
    nodes.forEach((n) => {
        let d = n.html;
        d.appendTo(container);
        d.attr('node-id', n.id);
        d.css({
            position: 'absolute',
            left: n.X,
            top: n.Y
        });
        return;
    });
    $('body').css({
        width: nodes[0].width * 100 + 200,
        height: maxDepth * 120 + 100
    });
    container.prependTo('body');
    let jsPlumbIns = jsPlumb.getInstance();
    jsPlumbIns.ready(() => {
        jsPlumbIns.setContainer(container);
        nodes.forEach((n) => {
            if (n.parent === root)
                return;
            let source = $(`[node-id=${n.parent.id}]`);
            let target = $(`[node-id=${n.id}]`);
            jsPlumbIns.connect({
                source: source,
                target: target,
                anchors: [['BottomCenter'], ['TopCenter']],
                endpoint: 'Blank',
                connector: 'Flowchart'
            });
        });
    });
}

function main() {
    let renderLevel = 10;
    let p = new Promise((resolve) => {
        $('.ui.page.dimmer').dimmer('show');
        console.log('Start search...');
        setTimeout(() => {
            search();
            resolve();
        }, 1);
    });
    p.then(() => new Promise((resolve) => {
        $('.ui.text.loader').text(`Searched ${searchedCount} nodes. Rendering ${renderLevel} levels...`);
        setTimeout(() => {
            render(renderLevel);
            resolve();
        });
    }));
    p.then(() => new Promise(() => {
        $('.ui.text.loader').text(`Waiting for browser to rendering ${renderLevel} levels...`);
        container.ready(() => {
            console.log('test');
            $('.ui.page.dimmer').dimmer('hide');
        });
    }));
}

$(() => {
    main();
});
