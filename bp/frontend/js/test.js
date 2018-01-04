'use strict';

/* eslint-disable no-console */
/* global console, atob, DrawingBoard */

const URL = 'http://127.0.0.1:10087';

let myBoard;

function dataURItoBytes(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Uint8Array(array);
}

$(() => {
    // get selectable models
    $.get(`${URL}/model_list`, (res) => {
        let modelList = res.models;
        modelList.forEach(m => {
            $('#model_select').append(`<option value="${m}">${m}</option>`);
        });
        // initalize materizl_select
        $('select').material_select();
    });

    // initalize drawing board
    $('#drawing').height($('#drawing').width());
    let drawSize = $('#drawing').width() / 14.0;
    myBoard = new DrawingBoard.Board('drawing', {
        controls: false,
        webStorage: false,
        size: drawSize
    });

    // clear board
    $('#clear_board').click(function() {
        myBoard.reset({
            background: true
        });
        // erase answer
        $('#prediction').hide();
        $('#prediction p').text('');

        clearSvg();
    });

    // submit clicked
    $('#submit_draw').click(function() {
        $('#preloader_1').show();
        $('#prediction').show();
        let model_selected = $('#model_select').find(':selected').text();
        let image = dataURItoBytes(myBoard.getImg());
        $.post({
            url: `${URL}/eval?model=${model_selected}`,
            data: image,
            dataType: 'json',
            processData: false,
            success: (res) => {
                $('#preloader_1').hide();
                $('#prediction p').text(res.ans);
                option.horizontalPadding = $('.col.s12.m6.l8 .card-content').width() * 0.5 / res.layers.length;
                // layers to drawing data
                let d_data = {nodes: []};
                for (let i in res.layers) {
                    let layer = res.layers[i][0];
                    for (let j in layer) {
                        d_data.nodes.push({
                            label: layer[j].toPrecision(2),
                            layer: parseInt(i) + 1
                        });
                        // if (j >= 60) break;
                    }
                }
                init(d_data);
            }
        });
    });

    // init svg
    $(option.svg).attr({
        height: $('#draw_card').height(),
        width: $('#svg_con').width()
    }).on('mouseenter', 'circle', function() {
        $(this).attr('r', Math.max(11 * option.ratio, 1.1));
    }).on('mouseleave', 'circle', function() {
        $(this).attr('r', Math.max(10 * option.ratio, 1));
    });
});


// nodes graph related
let option = {
    svg: 'svg',
    ratio: 2,
    verticalPadding: 40,
    horizontalPadding: 150,
    verticalOffset: 20,
    horizontalOffset: 20
};

function clearSvg() {
    $(option.svg).html('');
}
function addPoint(p) {
    let r = Math.max(10 * option.ratio, 1);
    let res = `<circle cx=${p.x} cy=${p.y} r=${r}></circle>`;
    if (option.ratio >= 1)
        res += `<text x=${p.x} y=${p.y} font-size=${7 * option.ratio}>${p.label}</text>`;
    return res;
}
let addPath = (p) => `M${p.start.x} ${p.start.y} L${p.end.x} ${p.end.y} Z`;

function draw(points, path) {
    points.forEach(p => {
        p.x = p.absX * option.ratio + option.horizontalOffset;
        p.y = p.absY * option.ratio + option.verticalOffset;
    });
    console.time('drawOnce');
    console.time('calculatePoints');
    let point = points.reduce((s, p) => s + addPoint(p), '');
    console.timeEnd('calculatePoints');
    console.time('calculatePath');
    let line = `<path d="${path.map(addPath).join('')}"></path>`;
    console.timeEnd('calculatePath');
    console.time('browserDraw');
    $(option.svg).html(line + point);
    console.timeEnd('browserDraw');
    console.timeEnd('drawOnce');
}

let mouseDown = false;
let dragOrigin = undefined;
let points;
function init(data) {
    let minLayer = Math.min(...data.nodes.map(n => n.layer));
    let maxLayer = Math.max(...data.nodes.map(n => n.layer));
    let layerIndex = {};
    for (let i = minLayer; i <= maxLayer; ++i)
        layerIndex[i] = 0;
    points = data.nodes.map(n => ({
        label: n.label,
        absX: (n.layer - minLayer) * option.horizontalPadding,
        absY: (layerIndex[n.layer]++) * option.verticalPadding
    }));
    let path = points.reduce((arr, p1) =>
        arr.concat(points.map(p2 =>
            ({ start: p1, end: p2 })
        )), []);
    path = path.filter(p =>
        Math.abs(p.start.absX - p.end.absX) === option.horizontalPadding
    );
    draw(points, path);

    $(option.svg).on('mousewheel', (event) => {
        if (!event.altKey)
            return;
        let r = option.ratio;
        r = Math.max(0.1, Math.min(5, r + event.deltaY * 0.05));
        option.ratio = r;
        draw(points, path);
    }).on('mousemove', (event) => {
        if (!mouseDown)
            return;
        let {x, y} = dragOrigin;
        option.horizontalOffset += (event.offsetX - x);
        option.verticalOffset += (event.offsetY - y);
        dragOrigin = { x: event.offsetX, y: event.offsetY };
        draw(points, path);
    }).on('mousedown', (event) => {
        mouseDown = true;
        dragOrigin = { x: event.offsetX, y: event.offsetY };
        $(option.svg).css('cursor', 'move');
    }).on('mouseup', () => {
        mouseDown = false;
        $(option.svg).css('cursor', 'default');
    });
}
