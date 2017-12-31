const URL = "http://127.0.0.1:10087";

var hiddenNum = 1;
var training = false;

$(document).ready(function() {
  // initalize materizl_select
  $('select').material_select();

  // add hidden click
  $("#add_hidden").click(function() {
    hiddenNum += 1;
    $("#hidden_layers").append('<div class="input-field col s12 m6 l4">'
      + '<input class="hidden_layer_input" type="number" min="1" step="1" id="hidden_layer_'
      + hiddenNum
      + '" class="validate" name="hidden_'
      + hiddenNum
      + '">'
      + '<label for="hidden_layer_'
      + hiddenNum
      + '" data-error="Must be positive integer.">Units of Hidden Layer '
      + hiddenNum
      + '</label></div>');
    $("#hidden_num").val(hiddenNum);
  });

  // add submit new training
  $("#submit_train").click(function () {
    $('form[name="new_train"]').attr("action", URL + "/new_train").submit();
  });
});
