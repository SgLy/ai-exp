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
var ai = new Set([Chess.RED]);

// Map definition and help function
function Map()
{
  map = [];
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
  var map = new Array(3);
  for (var i = 0; i < 3; ++i) {
    map[i] = new Array(3);
    for (var j = 0; j < 3; ++j)
      map[i][j] = old_map[i][j];
  }
  return map;
}

var map = Map();

function restart()
{
  round = 0;
  table_row = [];
  table_cell = [];
  finished = false;
  map = Map();
  $('tbody').empty();
  $('h1').empty();
  $('h2').html('<i class="fitted icon"></i>\'s turn')
  turn = Chess.BLUE;
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

          if (ai.has(turn))
            aiMove(map, turn);
        }
      }
    });

  $('h2>i').addClass(css_class[turn]);
  if (ai.has(turn))
    aiMove(map, turn);
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
    $('h1').removeClass('red blue');
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

function aiMove(map, turn)
{
  afterJudge = (x, y) => {
    $('.dimmable').dimmer('hide');
    table_cell[x][y].click();
  }

  // Before judge
  $('.dimmable').dimmer('show');

  setTimeout('aiJudge(map, turn, afterJudge)', 0);
}

var dfs_counter = 0;
var buffer;
function aiJudge(map, turn, callback)
{
  dfs_counter = 0;
  buffer = {};
  console.time('dfs');
  res = quickDfs(map, turn);
  console.timeEnd('dfs');
  console.log('Dfs count: ' + dfs_counter);
  callback(res.move.x, res.move.y);
}

function isFull(map)
{
  var cnt = 0;
  for (var i = 0; i < 3; ++i)
    for (var j = 0; j < 3; ++j)
      if (map[i][j] == Chess.EMPTY)
        ++cnt;
  return cnt == 0;
}

function getResult(map)
{
  if ((res = ifFinished(map).winner) != Chess.EMPTY)
    return res;
  return isFull(map) ? 'draw' : null;
}

function getRandomMove(moves, turn)
{
  var filtered_moves = [];
  for (var i in moves)
    if (moves[i].winner == turn)
      filtered_moves.push(i);
  if (filtered_moves.length == 0)
    return null;
  return moves[filtered_moves[getRandomInt(0, filtered_moves.length)]];
}

function evaluate(map, turn)
{
  let score = 0;
  for (let i = 0; i < 3; ++i)
    for (let j = 0; j < 3; ++j)
      if (map[i][j] == Chess.EMPTY) {
        let new_map = Map.copy(map);
        new_map[i][j] = turn;
        if ((res = getResult(new_map)) == turn)
          score += 1000;
        else {
          for (let p = 0; p < 3; ++p)
            for (let q = 0; q < 3; ++q)
              if (new_map[i][j] == Chess.EMPTY) {
                let new_new_map = Map.copy(new_map);
                new_new_map[i][j] = turn;
                if ((res = getResult(new_new_map)) == turn)
                  score += 100;
              }
        }
      }
  for (let i = 0; i < 3; ++i)
    for (let j = 0; j < 3; ++j)
      if (map[i][j] == Chess.EMPTY) {
        let new_map = Map.copy(map);
        new_map[i][j] = 1 - turn;
        if ((res = getResult(new_map)) == 1 - turn)
          score += 1000;
      }
  return score;
}

// Exit once get a good move
//   to improve computing speed
//   # USING HEURISTIC #
function quickDfs(map, turn)
{
  if (buffer[JSON.stringify({ map: map, turn: turn })] !== undefined)
    return buffer[JSON.stringify({ map: map, turn: turn })];
  dfs_counter++;
  let choices = [];
  for (var i = 0; i < 3; ++i)
    for (var j = 0; j < 3; ++j)
      if (map[i][j] == Chess.EMPTY) {
        let new_map = Map.copy(map);
        new_map[i][j] = turn;
        choices.push({
          map: new_map,
          move: { x: i, y: j },
          score: evaluate(new_map, turn)
        });
      }

  choices.sort((a, b) => b.score - a.score);

  let moves = [];
  for (let choice of choices) {
    let res;
    if ((res = getResult(choice.map)) == null)
      res = quickDfs(choice.map, 1 - turn).winner;
    if (res == turn) {
      move = { winner: res, move: choice.move };
      buffer[JSON.stringify({ map: map, turn: turn })] = move;
      return move;
    }
    moves.push({ winner: res, move: choice.move });
  }

  for (var move of moves)
    if (move.winner == 'draw')
      return move;
  buffer[JSON.stringify({ map: map, turn: turn })] = move;
  return moves[0];
}

function initSettingPanel()
{
  div_id = ['#blue', '#red'];
  for (var chess of [Chess.BLUE, Chess.RED]) {
    $(div_id[chess] + '>i.icons>:first-child')
      .addClass(css_class[chess]);
    $(div_id[chess] + '>i')
      .data('chess', chess)
      .on('click', function() {
        var chess = $(this).data('chess');
        if (ai.has(chess)) {
          ai.delete(chess);
          $(this).children('.corner')
            .removeClass('computer')
            .addClass('user');
          $(this).siblings('.popup')
            .text('Switch to AI');
        } else {
          ai.add(chess);
          $(this).children('.corner')
            .removeClass('user')
            .addClass('computer');
          $(this).siblings('.popup')
            .text('Switch to human');
        }
      });
  }
  placeIcons();

  $('.setting>i')
    .on('mouseenter', function() {
      $(this).css({
        opacity: 1,
        transform: 'scale(1.1, 1.1)'
      }).popup('show');
    })
    .on('mouseleave', function() {
      $(this).css({
        opacity: 0.5,
        transform: 'scale(1, 1)'
      }).popup('hide all');
    });
  $('#restart>i')
    .on('click', function() {
      restart();
    });
}

function placeIcons()
{
  console.log('resized');
  $('#restart').css({
    top: $('table').offset().top,
    left: $('table').offset().left + $('table').width() + 40
  });
  $('#blue').css({
    top: $('#restart').offset().top + $('#restart').height() + 10,
    left: $('table').offset().left + $('table').width() + 40
  });
  $('#red').css({
    top: $('#blue').offset().top + $('#blue').height() + 10,
    left: $('table').offset().left + $('table').width() + 40
  });
}

initSettingPanel();
window.onresize = placeIcons;
restart();
