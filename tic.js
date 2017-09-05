var round = 0;
var table_row = [];
var table_cell = [];
var finished = false;

// Chess definition
var Chess = {
  BLUE: 0,
  RED: 1,
  EMPTY: 2
}
Object.freeze(Chess);
var css_class = ['blue moon', 'red sun'];
Object.freeze(css_class);
var css_color = ['#2185d0', '#db2828'];
Object.freeze(css_color);

var turn = Chess.BLUE;
var ai = Chess.RED;

// Map definition and help function
function Map()
{
  var map = [];
  for (var i = 0; i < 3; ++i) {
    row = [];
    for (var j = 0; j < 3; ++j)
      row.push(Chess.EMPTY);
    map.push(row);
  }
  return map;
}
Map.copy = function (old_map)
{
  var map = [];
  for (var i = 0; i < 3; ++i) {
    row = [];
    for (var j = 0; j < 3; ++j)
      row.push(old_map[i][j]);
    map.push(row);
  }
  return map;
}

var map = Map();

function init()
{
  for (var i = 0; i < 3; ++i) {
    table_row.push($('<tr></tr>'));
    row = [];
    for (var j = 0; j < 3; ++j) {
      cell = $('<td></td>');
      cell.data('x', i);
      cell.data('y', j);
      if ((i + j) % 2 == 0)
        cell.addClass('even');
      else
        cell.addClass('odd');
      table_row[i].append(cell);
      row.push(cell);
    }
    table_cell.push(row);
    $('table').append(table_row[i]);
  }

  $('td')
    .on('mouseenter', function() {
      if (!finished)
        $(this).css({
          boxShadow: 'inset 0 0 10px 4px rgba(0, 0, 0, 0.6)'
        })
    })
    .on('mouseleave', function() {
      if (!finished)
        $(this).css({
          boxShadow: 'none'
        })
    })
    .on('click', function() {
      if (finished)
        return;
      if ($(this).children().length == 0) {
        icon = $('<i class="' + css_class[turn] + ' icon"></i>');
        icon.hide();
        $(this).append(icon);
        icon.fadeIn({
          duration: 200
        });
        round++;
        label = $('<p>' + round + '</p>').css({
          color: css_color[turn]
        });
        $(this).append(label);
        putChess($(this).data('x'), $(this).data('y'), turn);
        if (!finished) {
          $('h2>i').removeClass(css_class[turn]);
          turn = 1 - turn;
          $('h2>i').addClass(css_class[turn]);

          if (turn == ai)
            ai_move(map);
        }
      }
    });

  $('h2>i').addClass(css_class[turn]);
  if (turn == ai)
    ai_move(map);
}

function putChess(x, y, chess)
{
  map[x][y] = chess;
  result = ifFinished(map);
  if (result.winner == Chess.EMPTY && round < 9)
    return;
  else
    finish(result.winner, result.win_position);
}

function ifFinished(map)
{
  for (i = 0; i < 3; ++i) {
    // Horizontal
    if (map[i][0] != Chess.EMPTY && map[i][0] == map[i][1] && map[i][1] == map[i][2])
      return {'winner': map[i][0], 'win_position': ['h', i]};

    // Vertical
    if (map[0][i] != Chess.EMPTY && map[0][i] == map[1][i] && map[1][i] == map[2][i])
      return {'winner': map[0][i], 'win_position': ['v', i]};
  }
  // Diagonal
  if (map[0][0] != Chess.EMPTY && map[0][0] == map[1][1] && map[1][1] == map[2][2])
    return {'winner': map[1][1], 'win_position': ['d', 0]};
  if (map[0][2] != Chess.EMPTY && map[0][2] == map[1][1] && map[1][1] == map[2][0])
    return {'winner': map[1][1], 'win_position': ['d', 1]};
  return {'winner': Chess.EMPTY, 'win_position': null};
}

function finish(winner, win_position)
{
  finished = true;
  $('h2').html('Finished');
  if (winner == Chess.BLUE) {
    $('h1').addClass('blue');
    $('h1').html('<i class="' + css_class[winner] +' icon"></i>Win!');
  } else if (winner == Chess.RED) {
    $('h1').addClass('red');
    $('h1').html('<i class="' + css_class[winner] +' icon"></i>Win!');
  } else if (winner == Chess.EMPTY) {
    $('h1').text('Draw!');
  }

  $('td').css({
    boxShadow: 'none'
  });
  if (winner != Chess.EMPTY) {
    p = win_position[1];
    if (win_position[0] == 'h')
      pos = [[p, 0], [p, 1], [p, 2]];
    else if (win_position[0] == 'v')
      pos = [[0, p], [1, p], [2, p]];
    else if (win_position[0] == 'd') {
      if (p == 0)
        pos = [[0, 0], [1, 1], [2, 2]];
      else
        pos = [[0, 2], [1, 1], [2, 0]];
    }
    color = css_color[winner];
    for (i = 0; i < 3; ++i)
      table_cell[pos[i][0]][pos[i][1]].css({
        boxShadow: 'inset 0 0 10px 3px ' + color,
        textShadow: '0 0 20px ' + color
      });
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function ai_move(map)
{
  after_judge = function (x, y) {
    $('.dimmable').dimmer('hide');
    table_cell[x][y].click();
  }

  // Before judge
  $('.dimmable').dimmer('show');

  setTimeout('ai_judge(map, after_judge)', 250);
}

function ai_judge(map, callback)
{
  for (i = 0; i < 1000000; ++i)
  for (j = 0; j < 250; ++j);
  while (true) {
    x = getRandomInt(0, 3);
    y = getRandomInt(0, 3);
    if (map[x][y] == Chess.EMPTY) {
      callback(x, y);
      break;
    }
  }
}

init();
