$(document).ready(function() {

  let state = JSON.parse(localStorage.getItem("settings"));
  let trackingSettings;

  if(JSON.parse(localStorage.getItem("tracking")) == null) {
    trackingSettings = {
      pomodorosToday: 0,
      timeSpentToday: 0, 
      date: null
    };
    localStorage.setItem("tracking", JSON.stringify(trackingSettings));
  } else {
    trackingSettings = JSON.parse(localStorage.getItem("tracking"));
  }


  if(state == null) {
    let defaultSettings = {
      workDuration: 25 * 60,
      breakDuration: 5 * 60,
      continuousMode: false,
      soundMode: true,
      workOn: false
    };
    localStorage.setItem("settings", JSON.stringify(defaultSettings));  
    state = defaultSettings;
  }



  const audio = new Audio('files/sound.mp3');
  let timerID = null;

  // grabbing DOM elements
  const pomodoroText = $(".pomodoro-text");
  const indicator =  $("#indicator");

  // rendering time in HTML page
  
  function renderTime(duration) {
    if(isNaN(duration)) {
      console.log("NEED A NUMBER in renderTime()");
      return;
    }

    let minutes, seconds;

    minutes = parseInt(duration/60, 10);
    seconds = parseInt(duration%60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    pomodoroText.html(minutes + ":" + seconds);
  }

  function renderTracking() {
    $(".pomodoros").html(trackingSettings.pomodorosToday);
    $(".timespent").html(trackingSettings.timeSpentToday + " mins.");
  }

  function checkForTime() {

    let currentTime = new Date();
    currentTime.setHours(0,0,0,0);
    let oldDate = trackingSettings.date;

    if(oldDate == null) {
      trackingSettings.date = currentTime;
      localStorage.setItem("tracking", JSON.stringify(trackingSettings));
      return;
    }

    if(currentTime > new Date(oldDate)) {
      trackingSettings.pomodorosToday = 0;
      trackingSettings.timeSpentToday = 0;
      trackingSettings.date = currentTime;
      localStorage.setItem("tracking", JSON.stringify(trackingSettings));
    }
    renderTracking();
  }

  function updateTracking(duration) {
    if(state.workOn == true) {
      trackingSettings.pomodorosToday += 1;
      console.log(parseInt((duration + 1)/60));
      trackingSettings.timeSpentToday += parseInt((duration + 1)/60);
      localStorage.setItem("tracking", JSON.stringify(trackingSettings)); 
     // renderTracking();  
    }
  }


  function reset() {
    renderTime(state.workDuration);
    clearInterval(timerID);
  }

  function continuousModeCheck() {
    if(state.continuousMode == false) {
      $("#continuousModeBlock").show();
      return;
    }
    okHandle();
  }

  function soundModeCheck() {
    return state.soundMode === true ? audio.play() : null;
  }  



  function workTimer() {
    state.workOn = true;
    indicator.text("Work");
    timer(state.workDuration - 1);
  }

  function breakTimer() {
    state.workOn = false;
    indicator.text("Breeeeaak!");
    timer(state.breakDuration - 1);
  }

  function timer(duration) {
    let myTimer = duration;
   
    if(timerID != null) {
      reset();
    }

    timerID = setInterval(function() {

      renderTime(myTimer);

      if(--myTimer < 0) {
        myTimer = duration;
        if(state.workOn == true) {
          updateTracking(state.workDuration);
          checkForTime();
        }
        reset();
        soundModeCheck();
        continuousModeCheck();
        return;
      }
    }, 1000);

  }

  function startHandle() {
      workTimer(state.workDuration - 1);   
  }

  function stopHandle() {
    state.workOn = false;
    reset();
    indicator.text("-__-");
  }

  function okHandle() {
    if(state.workOn == true) {
      $("#continuousModeBlock").hide();
      breakTimer(state.breakDuration - 1);
    } else {
      $("#continuousModeBlock").hide();
      workTimer(state.workDuration - 1);
    }
  }

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
      state.workDuration = $("#workTime").val() * 60;
      state.breakDuration = $("#breakTime").val() * 60;
      state.continuousMode = $("#continuousMode").is(":checked");
      state.soundMode = $("#soundMode").is(":checked")
      renderTime(state.workDuration);
      localStorage.setItem("settings", JSON.stringify(state));    
    }
  });

  // Events
  
  $("#start").click(startHandle);  

  $("#stop").click(stopHandle);  

  $("#okButton").click(okHandle);

  $("#settings").click(function() {
    $("#workTime").val(state.workDuration / 60);
    $("#breakTime").val(state.breakDuration / 60);
  });

  renderTime(state.workDuration);
  checkForTime();
  
});