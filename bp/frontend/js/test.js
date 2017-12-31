'use strict'

const URL = "http://127.0.0.1:10087";

var myBoard;

function dataURItoBytes(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Uint8Array(array);
}

$(document).ready(function() {
  // get selectable models
  $.ajax({
    url: URL + "/model_list",
    type: "GET",
    dataType: "json",
    success: function(res) {
      let modelList = res.models;
      for (let i in modelList) {
        let modelName = modelList[i];
        $("#model_select").append('<option value="' + modelName
          + '">' + modelName + '</option>')
      }
      // initalize materizl_select
      $('select').material_select();
    }
  });
 
  // initalize drawing board
  $("#drawing").height($("#drawing").width());
  let drawSize = $("#drawing").width() / 14.0
  myBoard = new DrawingBoard.Board('drawing', {
    controls: false,
    webStorage: false,
    size: drawSize
  });

  // clear board
  $("#clear_board").click(function() {
    myBoard.reset({
      background: true
    });
    // erase answer
    $("#prediction").hide();
    $("#prediction p").text("");

    clearSvg();
  });

  // submit clicked
  $("#submit_draw").click(function() {
    $("#preloader_1").show();
    $("#prediction").show();
    let model_selected = $('#model_select').find(":selected").text();
    let image = dataURItoBytes(myBoard.getImg());
    $.ajax({
      url: URL + "/eval?model=" + model_selected,
      type: "POST",
      data: image,
      dataType: "json",
      processData: false,
      success: function(res) {
        $("#preloader_1").hide();
        $("#prediction p").text(res.ans);
        // layers to drawing data
        let d_data = {nodes: []};
        for (let i in res.layers) {
          let layer = res.layers[i][0];
          for (let j in layer) {
            d_data.nodes.push({label: layer[j].toPrecision(2),
              layer: parseInt(i) + 1})
            if (j >= 30) {
              break;
            }
          }
        }
        init(d_data);
      }
    });
  });
  
  // init svg
  $(option.svg).attr('height', $("#draw_card").height()).
    attr('width', $("#svg_con").width());
});


// nodes graph related
let data = {
    nodes: [
        { label: 'i0', layer: 1 },
        { label: 'i1', layer: 1 },
        { label: 'h0', layer: 2 },
        { label: 'i2', layer: 1 },
        { label: 'h1', layer: 2 },
        { label: 'h2', layer: 2 },
        { label: 'h3', layer: 2 },
        { label: 'o0', layer: 3 }
    ]
};
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
function refreshSvg() {
    $(option.svg).html($(option.svg).html());
    $(option.svg).on('mouseenter', 'circle', function() {
        $(this).attr('r', Math.max(11 * option.ratio, 1.1));
    }).on('mouseleave', 'circle', function() {
        $(this).attr('r', Math.max(10 * option.ratio, 1));
    });
}
function addPoint(p) {
    let x = p.x * option.ratio + option.horizontalOffset;
    let y = p.y * option.ratio + option.verticalOffset;
    $('<circle></circle>').attr({
        'point-id': p.id,
        cx: x,
        cy: y,
        r: Math.max(10 * option.ratio, 1)
    }).data({
        x: p.x,
        y: p.y
    }).appendTo(option.svg);
    if (option.ratio >= 1) {
        $(`<text>${p.label}</text>`).attr({
            x: x,
            y: y,
            'font-size': 7 * option.ratio
        }).appendTo(option.svg);
    }
}
function addPath(p) {
    let d = {
        x0: p.start.x * option.ratio + option.horizontalOffset,
        y0: p.start.y * option.ratio + option.verticalOffset,
        x1: p.end.x * option.ratio + option.horizontalOffset,
        y1: p.end.y * option.ratio + option.verticalOffset,
    };
    $(`<path d="M${d.x0} ${d.y0} L${d.x1} ${d.y1} Z"></path>`).css({
        fillopacity: 0,
        stroke: 'dodgerblue'
    }).prependTo(option.svg);
}
function draw(ps) {
    clearSvg();
    ps.forEach(addPoint);
    ps.forEach(p0 => {
        ps.forEach(p1 => {
            if (Math.abs(p0.x - p1.x) !== option.horizontalPadding)
                return;
            addPath({
                start: p0,
                end: p1
            });
        });
    });
    refreshSvg();
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
        x: (n.layer - minLayer) * option.horizontalPadding,
        y: (layerIndex[n.layer]++) * option.verticalPadding
    }));
    draw(points);

    $(option.svg).on('mousewheel', (event) => {
        if (!event.altKey)
            return;
        let r = option.ratio;
        r = Math.max(0.1, Math.min(5, r + event.deltaY * 0.05));
        option.ratio = r;
        draw(points);
    }).on('mousemove', (event) => {
        if (!mouseDown)
            return;
        let {x, y} = dragOrigin;
        option.horizontalOffset += (event.offsetX - x);
        option.verticalOffset += (event.offsetY - y);
        dragOrigin = { x: event.offsetX, y: event.offsetY };
        draw(points);
    }).on('mousedown', () => {
        mouseDown = true;
        dragOrigin = { x: event.offsetX, y: event.offsetY };
        $(option.svg).css('cursor', 'move');
    }).on('mouseup', () => {
        mouseDown = false;
        $(option.svg).css('cursor', 'default');
    });
}

    
