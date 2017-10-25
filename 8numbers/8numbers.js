var table_row = [];
var table_cell = [];
var finished = false;
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
    icon = $('<i class="' + "blue moon" + ' icon"></i>');
    icon.hide();
    cell.append(icon);
    icon.fadeIn({
      duration: 200
    });
    label = $('<p>' + (3*i+j+1) + '</p>').css({
      color: "#2185d0"
    });
    cell.append(label);
    table_row[i].append(cell);
    row.push(cell);
  }
  table_cell.push(row);
  $('table').append(table_row[i]);
}
