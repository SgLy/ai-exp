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
    peek() {
        return this.arr[this.left];
    }
}

const finalArr = [1, 2, 3, 8, 0, 4, 7, 6, 5];
let set = {}; // no class static variable workaround
class Node {
    constructor(arr, parent, depth) {
        this.arr = $.extend(true, [], arr);
        this.zero = arr.findIndex((v) => v === 0);
        this.parent = parent;
        this.child = [];
        this.depth = depth;
        this.id = this.levelId = -1;
        this.expanded = false;
        this.eval = this.depth + this.arr.reduce((s, t, i) => {
            if (t === 0)
                return s;
            let pos = finalArr.findIndex((v) => v === t);
            let x1 = parseInt(i / 3), x2 = parseInt(pos / 3);
            let y1 = parseInt(i % 3), y2 = parseInt(pos % 3);
            return s + Math.abs(x1 - x2) + Math.abs(y1 - y2);
        }, 0);
        this.updateString();
    }
    get up() {
        let n = new Node(this.arr, this, this.depth + 1);
        if (n.zero < 3)
            return undefined;
        [n.arr[n.zero], n.arr[n.zero - 3]] = [n.arr[n.zero - 3], n.arr[n.zero]];
        n.zero -= 3;
        n.updateString();
        return n;
    }
    get down() {
        let n = new Node(this.arr, this, this.depth + 1);
        if (n.zero > 5)
            return undefined;
        [n.arr[n.zero], n.arr[n.zero + 3]] = [n.arr[n.zero + 3], n.arr[n.zero]];
        n.zero += 3;
        n.updateString();
        return n;
    }
    get left() {
        let n = new Node(this.arr, this, this.depth + 1);
        if (n.zero % 3 === 0)
            return undefined;
        [n.arr[n.zero], n.arr[n.zero - 1]] = [n.arr[n.zero - 1], n.arr[n.zero]];
        n.zero -= 1;
        n.updateString();
        return n;
    }
    get right() {
        let n = new Node(this.arr, this, this.depth + 1);
        if (n.zero % 3 === 2)
            return undefined;
        [n.arr[n.zero], n.arr[n.zero + 1]] = [n.arr[n.zero + 1], n.arr[n.zero]];
        n.zero += 1;
        n.updateString();
        return n;
    }
    static get set() {
        return set;
    }
    updateString() {
        this.string = this.arr.reduce((s, v) => s + v, '');
    }
    get visited() {
        return Node.set[this.string] !== undefined;
    }
    visit() {
        Node.set[this.string] = this.id;
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
        if (this.searchId !== undefined)
            res.append(`<code>${this.searchId}</code>`);
        if (this.isAnswer === true)
            res.addClass('answer');
        if (this.toExpand === true)
            res.addClass('expanding');
        if (this.expanded === true)
            res.addClass('expanded');
        res.popup({
            html: `
                <b>Evaluation value:</b><code>${this.eval}</code></br>
                ${this.isAnswer === true ? '<b>This node is in the path to the answer.</b></br>': ''}
                ${this.expanded === false ? '<b>This node is in Open Set.</br>': ''}
                ${this.toExpand === true ? '</br><b>This node will be visited next.</b>': ''}
            `,
            variation: 'flowing',
            position: 'left center'
        });
        return res;
    }
}

const root = new Node(Array(9).fill(0), undefined, -1);
// let start = new Node([5, 6, 3, 1, 0, 8, 7, 2, 4], root, 0);
// let start = new Node([8, 1, 3, 7, 2, 4, 6, 0, 5], root, 0);
let start = new Node([7, 0, 2, 3, 8, 4, 1, 6, 5], root, 0);
const final = new Node(finalArr);
let ans;
let ansLength;
let allNodes = [];
let q;
let searchCnt = 0;
function next(q) {
    if (q.length === 0)
        return;
    let cur = q.dequeue();
    cur.toExpand = false;
    cur.expanded = true;
    cur.searchId = searchCnt++;
    if (cur.string === final.string)
        return cur;
    [cur.up, cur.down, cur.left, cur.right].forEach((v) => {
        if (v === undefined)
            return;
        if (v.visited === true) {
            let that = allNodes[Node.set[v.string]];
            if (v.eval < that.eval) {
                that.eval = v.eval;
                that.parent = cur;   
                that.depth = cur.depth + 1;
                if (that.expanded) {
                    that.expanded = false;
                    q.queue(that);
                }
            }
        } else {
            v.id = allNodes.length;
            allNodes.push(v);
            q.queue(v);
            v.visit();
        }
    });

    if (q.length > 0)
        q.peek().toExpand = true;
}

function searchAll(q) {
    console.time('Search');
    while (q.length !== 0) {
        if (searchCnt % 10000 === 0)
            console.log(`Queue length: ${q.length}, Searched: ${allNodes.length}, Loop count: ${searchCnt}`);
        ans = next(q);
        if (ans !== undefined)
            break;
    }
    console.timeEnd('Search');
    endSearch(q);
}

function endSearch(q) {
    if (ans === undefined) {
        ansLength = 'No answer.';
    } else {
        ansLength = 0;
        while (ans !== root) {
            ++ansLength;
            ans.isAnswer = true;
            ans = ans.parent;
        }
    }
    $('#ans').text(ansLength);
}

let leftOffset;
function traverse(node) {
    if (node.child.length === 0) {
        node.X = node.L = node.R = leftOffset;
        leftOffset += 100;
    } else {
        node.L = 1e10;
        node.R = -1;
        node.child.forEach((n) => {
            traverse(n);
            node.L = Math.min(n.L, node.L);
            node.R = Math.max(n.R, node.R);
        });
        node.X = (node.L + node.R) / 2;
    }
}

let container;
let renderCount = 50;
function render() {
    if (container !== undefined)
        container.remove();
    container = $('<div id="container"></div>');
    allNodes.sort((a, b) =>
        (a.depth - b.depth) * 1e12
        + (a.parent.id - b.parent.id) * 1e6
        + (a.id - b.id)
    );
    let nodes = allNodes.filter((v, i) => i < renderCount || v.isAnswer === true);
    allNodes.forEach((n) => {
        n.child = [];
        n.x = 0;
    });
    nodes.forEach((n) => {
        if (n.parent === undefined)
            return;
        n.parent.child.push(n);
    });
    leftOffset = 0;
    traverse(start);
    nodes.forEach((n) => {
        let d = n.html;
        d.appendTo(container);
        d.attr('node-id', n.id);
        d.css({
            position: 'absolute',
            left: n.X,
            top: n.depth * 120
        });
    });
    let bodyX = start.R - start.L + 100;
    let bodyY = Math.max(...nodes.map(n => n.depth * 120)) + 120;
    container.css({
        width: bodyX,
        height: bodyY
    });
    container.prependTo('body');
    $('body').css({
        width: `calc(24em + ${bodyX}px)`,
        height: `calc(6em + ${bodyY}px)`
    });
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

function generateRandomArray() {
    let v = Array(9).fill(true);
    let arr = Array(9);
    for (let i = 0; i < 9; ++i) {
        let tmp;
        do {
            tmp = parseInt(Math.random() * 9);
        } while (v[tmp] !== true);
        v[tmp] = false;
        arr[i] = tmp;
    }
    return arr;
}

function reset() {
    set = {};
    start.expanded = false;
    start.toExpand = true;
    start.isAnswer = undefined;
    q.queue(start);
    allNodes = [start];
    searchCnt = 0;
    $('#all, #next').removeClass('disabled');
    render();
}

$('#switch').on('click', function() {
    if ($(this).data('type') === 'astar') {
        $(this).data('type', 'plain');
        $(this).text('Switch to A*');
        q = new Queue();
    } else {
        $(this).data('type', 'astar');
        $(this).text('Switch to plain search');
        q = new PriorityQueue({
            comparator: (a, b) => {
                if (a.eval === b.eval)
                    return a.string - b.string;
                return a.eval - b.eval;
            }
        });
    }
    $('#type').text($(this).data('type'));
    reset();
});

$('#next').on('click', () => {
    ans = next(q);
    if (ans !== undefined) {
        endSearch(q);
        $('#all, #next').addClass('disabled');
    }
    $('#open-len').text(q.length);
    $('#nodes-cnt').text(allNodes.length);
    render();
});

$('#reset').on('click', () => {
    reset();
});

$('#all').on('click', () => {
    let p = new Promise((resolve) => {
        $('.ui.text.loader').text('Searching...');
        $('.ui.page.dimmer').dimmer('show');
        setTimeout(() => {
            searchAll(q);
            resolve();
        }, 1);
    });
    p = p.then(() => new Promise((resolve) => {
        $('.ui.text.loader').text(`Searched ${allNodes.length} nodes. Rendering ${renderCount} nodes...`);
        $('#open-len').text(q.length);
        $('#nodes-cnt').text(allNodes.length);
        $('#all, #next').addClass('disabled');
        setTimeout(() => {
            render();
            resolve();
        }, 1);
    }));
    p.then(() => new Promise(() => {
        $('.ui.text.loader').text(`Waiting for browser to rendering ${renderCount} nodes...`);
        container.ready(() => {
            $('.ui.page.dimmer').dimmer('hide');
        });
    }));
});

$('#random').on('click', () => {
    start = new Node(generateRandomArray(), root, 0);
    reset();
});

$(() => {
    $('#switch').trigger('click');
});
