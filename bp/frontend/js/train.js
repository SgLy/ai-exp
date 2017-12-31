const URL = "http://127.0.0.1:10087";

var hiddenNum = 1;
var state = 0; // 0 for not training, 1 for training, 2 for finished training.
var iter = 0;

var loss_chart;
var acc_chart;

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
    if ($("input:blank").length > 0) {
      toast('You must fill all input fields!');
    } else if (!$("form").valid()) {
      toast('Some fields of your input are not valid!');
    } else if ($("#model_n").val().indexOf('?') != -1 || $("#model_n").val().indexOf('=') != -1) {
      toast("Model name should not contain '?' or '=' !");
    } else {
      $.ajax({
        url: URL + "/new_train?" + $("form").serialize(),
        type: 'get',
        dataType: 'json',
        success: function(res) {
          if (res.state == 1) {
            startTraining();
          } else {
            toast('Failed to start!');
          }
        }
      });
    } 
  });

  $("#stop_train").click(function () {
    $.ajax({
      url: URL + '/stop_train',
      type: 'get',
      dataType: 'json',
      success: function (res) {
        if (res.state == 1) {
          notTrain();
        } else {
          toast('Failed to stop!');
        }
      }
    });
  });

  $("#to_new_train").click(function() {
    notTrain();
  });

  // set chart box
  {
    let chart_w = $("#mid_reference").width() * 0.8;
    let chart_h = chart_w * 0.5;
    $("#loss_chart").attr("width", chart_w).attr("height", chart_h);
    $("#acc_chart").attr("width", chart_w).attr("height", chart_h);
  }

  // chart
  {
    let ctx = document.getElementById("loss_chart").getContext('2d');
    loss_chart = new Chart(ctx, {
      type: 'line',
      options: {
        scales: {
          xAxes: [{
              display: true,
              scaleLabel: {
                  display: true,
                  labelString: 'Iteration'
              }
          }],
          yAxes: [{
              display: true,
              scaleLabel: {
                  display: true,
                  labelString: 'Loss'
              }
          }]
        }
      }
    });

    ctx = document.getElementById("acc_chart").getContext('2d');
    acc_chart = new Chart(ctx, {
      type: 'line',
      options: {
        scales: {
          xAxes: [{
              display: true,
              scaleLabel: {
                  display: true,
                  labelString: 'Iteration'
              }
          }],
          yAxes: [{
              display: true,
              scaleLabel: {
                  display: true,
                  labelString: 'Accuracy'
              }
          }]
        }
      }
    });

    initData();
  }
  
  // see if already start
  $.ajax({
    url: URL + '/is_training',
    type: 'get',
    dataType: 'json',
    success: function (res) {
      if (res.is_training) {
        startTraining()
      }
    }
  })
});

function initData() {
  let red = "rgb(255, 99, 132)";
  let blue = "rgb(54, 162, 235)";
  loss_chart.data.labels = [];
  loss_chart.data.datasets = [];
  loss_chart.data.datasets.push({
    label: 'Loss',
    data: [],
    backgroundColor: red,
    borderColor: red
  });
  loss_chart.update();
  acc_chart.data.labels = [];
  acc_chart.data.datasets = [];
  acc_chart.data.datasets.push({
    label: 'Accuracy',
    data: [],
    backgroundColor: blue,
    borderColor: blue
  });
  acc_chart.update();
}

function toast(text) {
  Materialize.toast(text, 4000, 'rounded');
}

function startTraining() {
  if (state != 1) {
    state = 1;
    initData();
    setTimeout(getTrainData, 1000)
    $("#create_new").hide();
    $("#finished_figure").hide();
    $("#training_control").show();
    $("#train_figures").show();
  }
}

function finishTrain() {
  if (state != 2) {
    state = 2;
    iter = 0;
    $("#create_new").hide();
    $("#training_control").hide();
    $("#finished_figure").show();
    $("#train_figures").show()
  }
}

function notTrain() {
  hiddenNum = 1;
  iter = 0;

  if (state != 0) {
    state = 0;
    $("#training_control").hide();
    $("#finished_figure").hide();
    $("#train_figures").hide()
    $("#create_new").show();

    $("#accuracy").text("");
  }
}

function getTrainData() {
  $.ajax({
    url: URL + '/get_data?iter=' + iter,
    type: 'get',
    dataType: 'json',
    success: function(res) {
      if (res.fin == 0) {
        loss_chart.data.labels.push(iter * 500);
        loss_chart.data.datasets[0].data.push(res.loss);
        loss_chart.update();
        acc_chart.data.labels.push(iter * 500);
        acc_chart.data.datasets[0].data.push(res.acc);
        acc_chart.update();
        iter += 1;
        if (state == 1)
          setTimeout(getTrainData, 1000);
      } else if (res.fin == 1) {
        $("#accuracy").text(res.eval);
        if (state == 1)
          finishTrain();
      } else if (res.fin == 2) {
        if (state == 1)
          setTimeout(getTrainData, 2000);
      }
    }
  });
}
