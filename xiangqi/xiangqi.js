'use strict';

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
        this.moves = Chess.type[type].moves.bind(this);
        this.attacks = Chess.type[type].attacks.bind(this);
        this.board = board;
        this.position = position;
        this.side = side;
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
    constructor() {
        this.map = Array(10).fill(0).map(() => Array(9).fill(undefined));
        this.side = 'SIDE_RED';
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
    flipSide() {
        this.side = opposite(this.side);
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

let board = new Board();
$(() => {
    board.element.appendTo($('.container'));
    $('#board').on('click', '.movable.cell', function() {
        board.move(selectedChess.position, $(this).data('position'));
        let chess = $('.selected.chess').detach();
        $(this).append(chess);
        $('.cell').removeClass('movable attackable');
        $('.chess').removeClass('selected');
        board.flipSide();
        $('#board').css({
            transform: `rotate(${board.side === 'SIDE_RED' ? 0 : 180}deg)`
        });
    });

    $('#board').on('click', '.attackable.cell', function () {
        board.move(selectedChess.position, $(this).data('position'));
        let chess = $('.selected.chess').detach();
        $('.chess', this).remove();
        $(this).append(chess);
        $('.cell').removeClass('movable attackable');
        $('.chess').removeClass('selected');
        board.flipSide();
        $('#board').css({
            transform: `rotate(${board.side === 'SIDE_RED' ? 0 : 180}deg)`
        });
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