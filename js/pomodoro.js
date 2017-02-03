$(document).ready(function() {
  // Declaring Global Variables
  var pomodoroDefault = 25 * 60, // minutes by default
  breakDefault = 5 * 60,
  pomodoroText = $(".pomodoro-text"),
  continuousMode = false,
  soundMode = true,
  workOn = false,
  audio = new Audio('files/sound.mp3')
  timerID = null,
  pomodoros = localStorage.getItem("pomodoros") == undefined ? 0 : localStorage.getItem("pomodoros"),
  spentTime = localStorage.getItem("howMuchTime");

  $(".pomodoros").html(pomodoros);
  $(".timespent").html(spentTime + " mins.");

  function renderTime(duration) {
      var minutes, seconds;
      minutes = parseInt(duration/60, 10);
      seconds = parseInt(duration%60, 10);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      pomodoroText.html(minutes + ":" + seconds);
  }


  function reset() {
    renderTime(pomodoroDefault);
    clearTimeout(timerID);
  }

  function soundModeCheck() {
    if(soundMode == true) {
      audio.play();
    } else {
      return null;
    }    
  }


  function continuousModeCheck() {
    if(continuousMode == false) {
      $("#continuousModeBlock").show();
    } else if(workOn == true) {
      $("#continuousModeBlock").hide();
      breakTimer(breakDefault - 1);
      } else {
      $("#continuousModeBlock").hide();
      pomodoroTimer(pomodoroDefault - 1);
    }
  }

  function breakTimer(duration) {
    var timer = duration;
    workOn = false;
    $("#indicator").text("Break");

    timerID = setInterval(function() {
      renderTime(timer);

      if(--timer < 0) {
        soundModeCheck();
        timer = duration;
        reset();
        continuousModeCheck();
      }

    }, 1000);
  }

  function updatePomodoros(duration) {
      localStorage.setItem("pomodoros", ++pomodoros);
      localStorage.setItem("howMuchTime", parseInt(spentTime) + parseInt((duration + 1)/60));
      $(".pomodoros").html(pomodoros);
      $(".timespent").html(spentTime + " mins.");
  }

  function updateTime() { // in local storage, checking the date
    var currentTime = new Date();
    if(localStorage.getItem("date") == undefined) {
      var currentTime = new Date();
      localStorage.setItem("date", currentTime);
    } else if(currentTime > localStorage.getItem("date")) {
      localStorage.setItem("pomodoros", 0);
      localStorage.setItem("date", currentTime);
      localStorage.setItem("howMuchTime", zero);
    } 
  }


  function pomodoroTimer(duration) {
    
    var timer = duration;
    workOn = true;

    $("#start").text("Reset");
    $("#indicator").text("Work");

    timerID = setInterval(function() {
      
      renderTime(timer);

      if(--timer < 0) {
        updatePomodoros(duration);
        updateTime();
        soundModeCheck();
        timer = duration;
        reset();
        continuousModeCheck();
      }

    }, 1000);
  }
 
  // Events

  $("#start").click(function() {
    if(timerID != undefined) {
      reset();
      pomodoroTimer(pomodoroDefault - 1);
    } else {
      pomodoroTimer(pomodoroDefault - 1);
    }
  });

  $("#okButton").click(function() {
    if(workOn == true) {
      $("#continuousModeBlock").hide();
      breakTimer(breakDefault - 1);
    } else {
      $("#continuousModeBlock").hide();
      pomodoroTimer(pomodoroDefault - 1);
    }
  });

  $("#stop").click(function() {
    workOn = false;
    $("#start").text("Start");
    $("#indicator").text("Work");
    reset();
  });

  $("#settings").click(function() {
    $("#workTime").val(pomodoroDefault / 60);
    $("#breakTime").val(breakDefault / 60);
  });

  $("#changeSettings").click(function() {
    if(isNaN($("#workTime").val()) || isNaN($("#breakTime").val())) {
      alert("Please, enter only numbers");
      return 1;
    } else if($("#workTime").val() < 1 || $("#workTime").val() > 120) {
      alert("Work Time bounds are between 1 and 120 minutes");
      return 1;
    } else if($("#breakTime").val() < 1 || $("#breakTime").val() > 30) {
      alert("Break Time bounds are between 1 and 30 minutes");
      return 1;
    } else {
      pomodoroDefault = $("#workTime").val() * 60;
      breakDefault = $("#breakTime").val() * 60;
      continuousMode = $("#continuousMode").is(":checked");
      soundMode = $("#soundMode").is(":checked")
      renderTime(pomodoroDefault);      
    }
  });

  renderTime(pomodoroDefault);
});