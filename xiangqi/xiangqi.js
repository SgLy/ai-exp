'use strict';

const swap = (a, b) => { [a, b] = [b, a]; };

const SIDES = ['SIDE_BLACK', 'SIDE_RED'];
Object.freeze(SIDES);

const validPosition = (chess, pos) => {
    let bound = pos.x >= 0 && pos.x < 10 && pos.y >= 0 && pos.y < 9;
    let friend = chess.board.map[pos.x][pos.y] === undefined;
    return bound && friend;
};

class Chess {
    constructor(type, board, position, side) {
        this.type = type;
        this.moves = () => Chess.type[type].moves(this);
        this.board = board;
        this.position = position;
        this.side = side;
    }

    get element() {
        let el = $('<div class="chess"></div>');
        el.addClass(this.side === 'SIDE_BLACK' ? 'black' : 'red');
        el.text(Chess.type[this.type].name[this.side === 'SIDE_BLACK' ? 0 : 1]);
        el.data('chess', this);
        el.on('click', function() {
            $(this).toggleClass('selected');
            $('.chess').not(this).removeClass('selected');
            let chess = $(this).data('chess');
            $('.cell').removeClass('movable attackable');
            if ($(this).hasClass('selected')) {
                chess.moves().forEach(p => {
                    $(`[x=${p.x}][y=${p.y}]`).addClass('movable');
                });
            }
        });
        return el;
    }

    static get type() {
        return {
            pawn: {
                name: ['卒', '兵'],
                moves: (chess) => {
                    let pos = chess.position;
                    let forward = chess.side === 'SIDE_BLACK' ? 1 : -1;
                    if ((chess.side === 'SIDE_BLACK') ? pos.x > 4 : pos.x < 5)
                        return [
                            { x: pos.x + forward, y: pos.y },
                            { x: pos.x, y: pos.y + 1 },
                            { x: pos.x, y: pos.y - 1 }
                        ].filter(p => validPosition(chess, p));
                    else
                        return [
                            { x: pos.x + forward, y: pos.y }
                        ].filter(p => validPosition(chess, p));
                }
            },
            cannon: {
                name: ['砲', '炮']
            },
            chariot: {
                name: ['俥', '車']
            },
            knight: {
                name: ['傌', '馬']
            },
            bishop: {
                name: ['相', '象']
            },
            guard: {
                name: ['仕', '士']
            },
            king: {
                name: ['將', '帥']
            }
        };
    }
}

class Board {
    constructor() {
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
        $('#board').remove();
        $('.container').append(this.element);
    }

    get element() {
        let res = $('<div id="board"></div>');
        this.map.forEach((row, x) => {
            row.forEach((cell, y) => {
                let c = $('<div class="cell"></div>');
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
});
