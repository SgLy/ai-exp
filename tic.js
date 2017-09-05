var round = 0;
var table_row = [];
var table_cell = [];
var finished = false;

var Chess = {
  CROSS: 0,
  CIRCLE: 1,
  EMPTY: 2
}
Object.freeze(Chess);
var css_class = ['blue remove', 'red radio'];
Object.freeze(css_class);

var turn = Chess.CROSS;

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

var map = Map();

function copy(old_map)
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
      $(this).css({
        boxShadow: 'inset 0 0 10px 4px rgba(0, 0, 0, 0.6)'
      })
    })
    .on('mouseleave', function() {
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
        putChess($(this).data('x'), $(this).data('y'), turn);
        if (finished) {
          $('h2').html('Finished');
        } else {
          $('h2>i').removeClass(css_class[turn]);
          turn = 1 - turn;
          $('h2>i').addClass(css_class[turn]);
        }
      }
    });

  $('h2>i').addClass('blue remove');
} 

function putChess(x, y, chess)
{
  map[x][y] = chess;
  winner = ifFinished(map);
  if (winner == Chess.EMPTY && round < 9)
    return;
  finished = true;
  if (winner == Chess.CROSS) {
    $('h1').addClass('blue');
    $('h1').text('Cross Win!');
  } else if (winner == Chess.CIRCLE) {
    $('h1').addClass('red');
    $('h1').text('Circle Win!');
  } else if (winner == Chess.EMPTY) {
    $('h1').text('Draw!');
  }
}

function ifFinished(map)
{
  for (i = 0; i < 3; ++i) {
    // Horizontal
    if (map[i][0] == map[i][1] && map[i][1] == map[i][2])
      return map[i][0];

    // Vertical
    if (map[0][i] == map[1][i] && map[1][i] == map[2][i])
      return map[0][i];
  }
  // Diagonal
  if (map[0][0] == map[1][1] && map[1][1] == map[2][2])
    return map[0][0];
  if (map[0][2] == map[1][1] && map[1][1] == map[2][0])
    return map[0][2];
  return Chess.EMPTY;
}
init();
