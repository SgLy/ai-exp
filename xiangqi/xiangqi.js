'use strict';

const posInf = 1e10, negInf = -posInf;
const swap = (a, b) => { [a, b] = [b, a]; };

const SIDES = ['SIDE_BLACK', 'SIDE_RED'];
Object.freeze(SIDES);
const opposite = (side) => SIDES[1 - SIDES.findIndex(s => s === side)];

const inBound = (p) => p.x >= 0 && p.x < 10 && p.y >= 0 && p.y < 9;
const validMove = (chess, pos) => {
    if (!inBound(pos))
        return false;
    let self = chess.position.x === pos.x && chess.position.y === pos.y;
    let friend = chess.board.map[pos.x][pos.y] !== undefined;
    if (!self && friend)
        return false;
    return true;
};
const validAttack = (chess, pos) => {
    if (!inBound(pos))
        return false;
    if (chess.board.map[pos.x][pos.y] === undefined)
        return false;
    return chess.board.map[pos.x][pos.y].side !== chess.side;
};
const passedRiver = (chess, pos) => {
    if (chess.side === 'SIDE_RED')
        return pos.x < 5;
    else
        return pos.x > 4;
};
const inPalace = (chess, pos) => {
    if (chess.side === 'SIDE_RED')
        return pos.x >= 7 && 3 <= pos.y && pos.y <= 5;
    else
        return pos.x <= 2 && 3 <= pos.y && pos.y <= 5;
};

let selectedChess;

class Chess {
    constructor(type, board, position, side) {
        this.type = type;
        this.board = board;
        this.position = position;
        this.side = side;
        this.moves = Chess.type[type].moves.bind(this);
        this.attacks = Chess.type[type].attacks.bind(this);
        this.value = Chess.type[type].value.bind(this)();
        if (this.side === 'SIDE_BLACK')
            this.value = -this.value;
    }

    get element() {
        let el = $('<div class="chess"></div>');
        el.addClass(this.side === 'SIDE_BLACK' ? 'black' : 'red');
        el.text(Chess.type[this.type].name[this.side === 'SIDE_BLACK' ? 0 : 1]);
        el.data('chess', this);
        return el;
    }

    static get type() {
        return {
            pawn: {
                name: ['卒', '兵'],
                value: function() {
                    return 6 - Math.abs(4 - this.position.y);
                },
                moves: function () {
                    let pos = this.position;
                    let forward = this.side === 'SIDE_BLACK' ? 1 : -1;
                    if (passedRiver(this, this.position))
                        return [
                            { x: pos.x + forward, y: pos.y },
                            { x: pos.x, y: pos.y + 1 },
                            { x: pos.x, y: pos.y - 1 }
                        ].filter(p => validMove(this, p));
                    else
                        return [
                            { x: pos.x + forward, y: pos.y }
                        ].filter(p => validMove(this, p));
                },
                attacks: function () {
                    let pos = this.position;
                    let forward = this.side === 'SIDE_BLACK' ? 1 : -1;
                    if (passedRiver(this, this.position))
                        return [
                            { x: pos.x + forward, y: pos.y },
                            { x: pos.x, y: pos.y + 1 },
                            { x: pos.x, y: pos.y - 1 }
                        ].filter(p => validAttack(this, p));
                    else
                        return [
                            { x: pos.x + forward, y: pos.y }
                        ].filter(p => validAttack(this, p));
                }
            },
            cannon: {
                name: ['砲', '炮'],
                value: () => 7,
                moves: function () {
                    const DIRECTIONS = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                    return DIRECTIONS.reduce((r, d) => {
                        let pos = $.extend(true, {}, this.position);
                        pos.x += d[0];
                        pos.y += d[1];
                        while (validMove(this, pos)) {
                            r.push($.extend(true, {}, pos));
                            pos.x += d[0];
                            pos.y += d[1];
                        }
                        return r;
                    }, []);
                },
                attacks: function () {
                    const DIRECTIONS = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                    return DIRECTIONS.reduce((r, d) => {
                        let pos = $.extend(true, {}, this.position);
                        while (validMove(this, pos)) {
                            pos.x += d[0];
                            pos.y += d[1];
                        }
                        if (!inBound(pos))
                            return r;
                        do {
                            pos.x += d[0];
                            pos.y += d[1];
                        } while (validMove(this, pos));
                        if (validAttack(this, pos))
                            r.push(pos);
                        return r;
                    }, []);
                }
            },
            chariot: {
                name: ['俥', '車'],
                value: () => 8,
                moves: function() {
                    const DIRECTIONS = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                    return DIRECTIONS.reduce((r, d) => {
                        let pos = $.extend(true, {}, this.position);
                        pos.x += d[0];
                        pos.y += d[1];
                        while (validMove(this, pos)) {
                            r.push($.extend(true, {}, pos));
                            pos.x += d[0];
                            pos.y += d[1];
                        }
                        return r;
                    }, []);
                },
                attacks: function () {
                    const DIRECTIONS = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                    return DIRECTIONS.reduce((r, d) => {
                        let pos = $.extend(true, {}, this.position);
                        while (validMove(this, pos)) {
                            pos.x += d[0];
                            pos.y += d[1];
                        }
                        if (validAttack(this, pos))
                            r.push(pos);
                        return r;
                    }, []);
                }
            },
            knight: {
                name: ['傌', '馬'],
                value: () => 6.5,
                moves: function() {
                    const pos = this.position;
                    let ans = [];
                    [-1, 1].forEach(a => {
                        [-2, 2].forEach(b => {
                            if (validMove(this, {
                                x: pos.x,
                                y: pos.y + b / 2
                            }))
                                ans.push({ x: pos.x + a, y: pos.y + b });
                            if (validMove(this, {
                                x: pos.x + b / 2,
                                y: pos.y
                            }))
                                ans.push({ x: pos.x + b, y: pos.y + a });
                        });
                    });
                    return ans.filter(p => validMove(this, p));
                },
                attacks: function () {
                    const pos = this.position;
                    let ans = [];
                    [-1, 1].forEach(a => {
                        [-2, 2].forEach(b => {
                            if (validMove(this, {
                                x: pos.x,
                                y: pos.y + b / 2
                            }))
                                ans.push({ x: pos.x + a, y: pos.y + b });
                            if (validMove(this, {
                                x: pos.x + b / 2,
                                y: pos.y
                            }))
                                ans.push({ x: pos.x + b, y: pos.y + a });
                        });
                    });
                    return ans.filter(p => validAttack(this, p));
                }
            },
            bishop: {
                name: ['相', '象'],
                value: () => 7,
                moves: function() {
                    const pos = this.position;
                    let ans = [];
                    [-2, 2].forEach(a => {
                        [-2, 2].forEach(b => {
                            if (validMove(this, {
                                x: pos.x + a / 2,
                                y: pos.y + b / 2
                            }))
                                ans.push({ x: pos.x + a, y: pos.y + b });
                        });
                    });
                    return ans.filter(p => validMove(this, p));
                },
                attacks: function () {
                    const pos = this.position;
                    let ans = [];
                    [-2, 2].forEach(a => {
                        [-2, 2].forEach(b => {
                            if (validMove(this, {
                                x: pos.x + a / 2,
                                y: pos.y + b / 2
                            }))
                                ans.push({ x: pos.x + a, y: pos.y + b });
                        });
                    });
                    return ans.filter(p => validAttack(this, p));
                }
            },
            guard: {
                name: ['仕', '士'],
                value: () => 8,
                moves: function () {
                    const pos = this.position;
                    let ans = [];
                    [-1, 1].forEach(a => {
                        [-1, 1].forEach(b => {
                            ans.push({ x: pos.x + a, y: pos.y + b });
                        });
                    });
                    return ans.filter(p =>
                        inPalace(this, p) && validMove(this, p)
                    );
                },
                attacks: function () {
                    const pos = this.position;
                    let ans = [];
                    [-1, 1].forEach(a => {
                        [-1, 1].forEach(b => {
                            ans.push({ x: pos.x + a, y: pos.y + b });
                        });
                    });
                    return ans.filter(p =>
                        inPalace(this, p) && validAttack(this, p)
                    );
                }
            },
            king: {
                name: ['將', '帥'],
                value: () => 10000,
                moves: function() {
                    const DIRECTIONS = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                    return DIRECTIONS.reduce((r, d) => {
                        let pos = $.extend(true, {}, this.position);
                        r.push({
                            x: pos.x + d[0],
                            y: pos.y + d[1]
                        });
                        return r;
                    }, []).filter(p =>
                        inPalace(this, p) && validMove(this, p)
                    );
                },
                attacks: function () {
                    const DIRECTIONS = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                    return DIRECTIONS.reduce((r, d) => {
                        let pos = $.extend(true, {}, this.position);
                        r.push({
                            x: pos.x + d[0],
                            y: pos.y + d[1]
                        });
                        return r;
                    }, []).filter(p =>
                        inPalace(this, p) && validAttack(this, p)
                    );
                }
            }
        };
    }
}

class Board {
    constructor(map, side) {
        if (map === undefined) {
            this.map = Array(10).fill(0).map(() => Array(9).fill(undefined));
            SIDES.forEach((side) => {
                this.newChess('chariot', side, 0, 0);
                this.newChess('knight', side, 0, 1);
                this.newChess('bishop', side, 0, 2);
                this.newChess('guard', side, 0, 3);
                this.newChess('king', side, 0, 4);
                this.newChess('guard', side, 0, 5);
                this.newChess('bishop', side, 0, 6);
                this.newChess('knight', side, 0, 7);
                this.newChess('chariot', side, 0, 8);
                this.newChess('cannon', side, 2, 1);
                this.newChess('cannon', side, 2, 7);
                [0, 2, 4, 6, 8].forEach((y) => {
                    this.newChess('pawn', side, 3, y);
                });
            });
        } else
            this.map = map;
        if (side === undefined)
            this.side = 'SIDE_RED';
        else
            this.side = side;
    }
    newChess(type, side, x, y) {
        if (side === 'SIDE_RED')
            x = 9 - x;
        this.map[x][y] = new Chess(type, this, { x: x, y: y }, side);
    }
    move(originalPosition, newPosition) {
        let x1 = originalPosition.x, y1 = originalPosition.y;
        let x2 = newPosition.x, y2 = newPosition.y;
        this.map[x2][y2] = this.map[x1][y1];
        this.map[x1][y1] = undefined;
        this.map[x2][y2].position = newPosition;
    }
    tryMove(originalPosition, newPosition) {
        let newBoard = new Board(null, opposite(this.side));
        let newMap = this.map.map(r => r.map(c => {
            if (c === undefined)
                return undefined;
            return new Chess(c.type, newBoard, c.position, c.side);
        }));
        newBoard.map = newMap;
        newBoard.move(originalPosition, newPosition);
        return newBoard;
    }
    flipSide() {
        this.side = opposite(this.side);
    }
    get finish() {
        return this.map.reduce((s, r) =>
            s || r.findIndex(c => c.type === 'king') !== -1, false);
    }
    get value() {
        return this.map.reduce((sum, r) => r.reduce((sum, c) => {
            return sum + (c === undefined ? 0 : c.value);
        }, sum), 0);
    }

    get element() {
        let res = $('<div id="board"></div>');
        this.map.forEach((row, x) => {
            row.forEach((cell, y) => {
                let c = $('<div class="cell"></div>');
                c.data('position', { x: x, y: y });
                c.attr({ x: x, y: y });

                let v = $('<div class="verticle line"></div>').appendTo(c);
                if (x === 0 || (x === 5 && (y > 0 && y < 8)))
                    v.addClass('down-only');
                if (x === 9 || (x === 4 && (y > 0 && y < 8)))
                    v.addClass('up-only');
                let h = $('<div class="horizontal line"></div>').appendTo(c);
                if (y === 0)
                    h.addClass('right-only');
                if (y === 8)
                    h.addClass('left-only');
                if ((x === 1 || x === 8) && (y === 4)) {
                    $('<div class="diagonal line"></div>').appendTo(c);
                    $('<div class="reversed diagonal line"></div>').appendTo(c);
                }
                if (((x === 2 || x === 7) && (y === 1 || y === 7)) || ((x === 3 || x === 6) && (y % 2 === 0))) {
                    let r = $('<div class="cross"></div>');
                    ['upper', 'lower'].forEach((v) => {
                        ['left', 'right'].forEach((h) => {
                            if ((h === 'right' && y === 8) || (h === 'left' && y === 0))
                                return;
                            let tmp = $('<div></div>');
                            tmp.addClass(v).addClass(h).appendTo(r);
                        });
                    });
                    r.appendTo(c);
                }

                if (cell !== undefined)
                    c.append(cell.element);
                res.append(c);
            });
        });
        return res;
    }
}

function aiMove(maxDepth) {
    let p = new Promise((resolve) => {
        $('#board').dimmer('show');
        setTimeout(() => {
            let {move} = alphabeta(board, maxDepth, negInf, posInf);
            console.log(move);
            resolve(move);
        }, 1);
    });
    p.then((m) => new Promise(() => {
        move(m.original, m.new);
        $('#board').dimmer('hide');
    }));
}

function alphabeta(board, depth, alpha, beta) {
    if (depth === 0 || board.finished)
        return { search: board.value, move: undefined };
    let v = board.side === 'SIDE_RED' ? negInf : posInf;
    let move = undefined;
    for (let i = 0; i < board.map.length; ++i)
        for (let j = 0; j < board.map[i].length; ++j) {
            let chess = board.map[i][j];
            if (chess === undefined)
                continue;
            if (chess.side !== board.side)
                continue;
            let moves = chess.moves().concat(chess.attacks());
            if (depth === 4)
                console.log(chess, moves);
            for (let k = 0; k < moves.length; ++k) {
                let newBoard = board.tryMove(chess.position, moves[k]);
                let {search} = alphabeta(newBoard, depth - 1, alpha, beta);
                if (board.side === 'SIDE_RED') {
                    if (search > v) {
                        v = search;
                        move = { original: chess.position, new: moves[k] };
                    }
                    alpha = Math.max(alpha, v);
                } else {
                    if (search < v) {
                        v = search;
                        move = { original: chess.position, new: moves[k] };
                    }
                    beta = Math.min(beta, v);
                }
                if (beta <= alpha)
                    return { search: v, move: move };
            }
        }
    return { search: v, move: move };
}

function move(oldPos, newPos) {
    board.move(oldPos, newPos);
    let chess = $(`[x=${oldPos.x}][y=${oldPos.y}] .chess`).detach();
    $(`[x=${newPos.x}][y=${newPos.y}] .chess`).remove();
    $(`[x=${newPos.x}][y=${newPos.y}]`).append(chess);
    $('.cell').removeClass('movable attackable');
    $('.chess').removeClass('selected');
    board.flipSide();
    // $('#board').css({
    //     transform: `rotate(${board.side === 'SIDE_RED' ? 0 : 180}deg)`
    // });
}

let board = new Board();
$(() => {
    board.element.appendTo($('.container'));
    aiMove(4);
    let dimmerLoader = $('<div class="ui text loader">AI thinking...</div>');
    $('#board').dimmer('add content', dimmerLoader);
    $('#board').on('click', '.movable.cell, .attackable.cell', function() {
        move(selectedChess.position, $(this).data('position'));
        aiMove(4);
    });

    $('#board').on('click', '.chess', function () {
        let chess = $(this).data('chess');
        if (chess.side !== chess.board.side)
            return;
        $(this).toggleClass('selected');
        $('.chess').not(this).removeClass('selected');
        $('.cell').removeClass('movable attackable');
        if ($(this).hasClass('selected')) {
            selectedChess = chess;
            chess.moves().forEach(p => {
                $(`[x=${p.x}][y=${p.y}]`).addClass('movable');
            });
            chess.attacks().forEach(p => {
                $(`[x=${p.x}][y=${p.y}]`).addClass('attackable');
            });
        }
    }).on('mouseenter', '.chess', function () {
        let chess = $(this).data('chess');
        if (chess.side !== chess.board.side)
            return;
        $(this).addClass('floating');
    }).on('mouseleave', '.chess', function () {
        let chess = $(this).data('chess');
        if (chess.side !== chess.board.side)
            return;
        $(this).removeClass('floating');
    });
});
