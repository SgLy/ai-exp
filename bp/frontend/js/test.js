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
      }
    });
  });
});


