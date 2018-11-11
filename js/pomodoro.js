$(document).ready(function() {

  let state = JSON.parse(localStorage.getItem("settings"));
  let trackingSettings;

  if(JSON.parse(localStorage.getItem("tracking")) == null) {
    trackingSettings = {
      pomodorosToday: 0,
      pomodorosTodaySimul: 0,
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
      workOn: false,
      longBreakDuration: 15 * 60,
      pauseDuration: 25 * 60,
      pomosToLongBreak: 4,
      actualTimer: 0
    };
    localStorage.setItem("settings", JSON.stringify(defaultSettings));
    state = defaultSettings;
  }



  //const audio = new Audio('files/sound.mp3');
  const audio = new Audio('files/kill_bill_-_whistle.mp3');

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

    pomodoroText.html(minutes + ":" + seconds );
    state.pauseDuration = duration;
  }

  function renderTracking() {
    $(".pomodoros").html(trackingSettings.pomodorosToday);
    const hours = Math.floor(trackingSettings.timeSpentToday / 60);
    const minutes = trackingSettings.timeSpentToday % 60;
    if(trackingSettings.timeSpentToday > 60 && trackingSettings.timeSpentToday < 120) {
      $(".timespent").html(`${hours} hr. ${minutes} mins.`);
    } else if(trackingSettings.timeSpentToday >= 120) {
      $(".timespent").html(`${hours} hrs. ${minutes} mins.`);
    }else {
      $(".timespent").html(`${trackingSettings.timeSpentToday} mins.`);
    }
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
      trackingSettings.pomodorosTodaySimul = 0;
      trackingSettings.timeSpentToday = 0;
      trackingSettings.date = currentTime;
      localStorage.setItem("tracking", JSON.stringify(trackingSettings));
    }
    renderTracking();
  }

  function updateTracking(duration) {
    if(state.workOn == true) {
      trackingSettings.pomodorosToday += 1;
      trackingSettings.pomodorosTodaySimul = trackingSettings.pomodorosToday;
      trackingSettings.timeSpentToday += parseInt((duration + 1)/60);
      localStorage.setItem("tracking", JSON.stringify(trackingSettings));
    }
  }


  function reset( resetTime ) {
    renderTime( resetTime );
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
    state.actualTimer = 1;
    timer(state.workDuration - 1);
   }

  function breakTimer() {
    state.workOn = false;
    indicator.text("Breeeeaak!");
    state.actualTimer = 2;
    timer(state.breakDuration - 1);
  }

  function longBreakTimer() {
    state.workOn = false;
    indicator.text("Looong Breeaak!");
    state.actualTimer = 3;
    timer(state.longBreakDuration - 1);
  }

  function continueTimer() {
    timer( state.pauseDuration - 1);
  }

  function timer(duration) {
    let myTimer = duration;

    if(timerID != null) {
      reset( duration + 1 );
    }

    timerID = setInterval(function() {

      renderTime(myTimer);

      if(--myTimer < 0) {
        myTimer = duration;
        if(state.workOn == true) {
          updateTracking(state.workDuration);
          checkForTime();
        }
        reset( 0 );
        soundModeCheck();
        continuousModeCheck();
        return;
      }
   }, 1000);

  }

  function startHandle() {
      workTimer(state.workDuration - 1);
  }

  function pauseHandle() {

      switch (state.actualTimer ) {
        case 0 :
        break;
        case 1 :
            indicator.text("A pause from work!");
        break;
        case 2 :
            indicator.text("Little break in pause!");
        break;
        case 3 :
            indicator.text("Break in pause!");
        break;
        case 11 :
            indicator.text("Work!");
            break;
        case 12 :
            indicator.text("Breeeeaak!");
        break;
        case 13 :
            indicator.text("Looong Breeaak!");
        break;
      }

      if( state.actualTimer != 0 ) {
          if( state.actualTimer < 10 ) {
              state.actualTimer += 10;
              clearInterval(timerID);
          }
          else if ( state.actualTimer > 10 ){
              state.actualTimer -= 10;
              continueTimer();
          }
      }
    }


  function stopHandle() {
    state.workOn = false;
    state.actualTimer = 0;
    reset( state.workDuration );
    indicator.text("-__-");
  }

  function nextHandle() {
      if(state.workOn == true) {
        trackingSettings.pomodorosTodaySimul += 1;
        if( trackingSettings.pomodorosTodaySimul % state.pomosToLongBreak == 0) {
            longBreakTimer( );
        }
          else {
              breakTimer(state.breakDuration - 1);
          }
      } else {
        workTimer(state.workDuration - 1);
      }
  }

  function okHandle() {
    if(state.workOn == true) {
      $("#continuousModeBlock").hide();
      if( trackingSettings.pomodorosToday % state.pomosToLongBreak == 0) {
          longBreakTimer(state.longBreakDuration - 1);
      }
        else {
            breakTimer(state.breakDuration - 1);
        }
    } else {
      $("#continuousModeBlock").hide();
      workTimer(state.workDuration - 1);
    }
  }

  $("#changeSettings").click(function() {
    if( isNaN($("#workTime").val()) || isNaN($("#breakTime").val()) ||
        isNaN($("#longBreakTime").val()) ||
        isNaN($("#pomosToLongBreak").val()) ) {
      alert("Please, enter only numbers");
      return 1;
    } else if($("#workTime").val() < 1 || $("#workTime").val() > 120) {
      alert("Work Time bounds are between 1 and 120 minutes");
      return 1;
    } else if($("#breakTime").val() < 1 || $("#breakTime").val() > 30) {
      alert("Break Time bounds are between 1 and 30 minutes");
      return 1;
    } else if($("#longBreakTime").val() < 1 || $("#longBreakTime").val() > 30) {
    alert("Long break Time bounds are between 1 and 30 minutes");
    return 1;
    } else if($("#pomosToLongBreak").val() < 2 || $("#pomosToLongBreak").val() > 10) {
    alert("Pomodoros to long break bounds are between 2 and 10 times");
    return 1;
    }
      else {
      state.workDuration = $("#workTime").val() * 60;
      state.breakDuration = $("#breakTime").val() * 60;
      state.longBreakDuration = $("#longBreakTime").val() * 60;
      state.pomosToLongBreak = $("#pomosToLongBreak").val();
      state.continuousMode = $("#continuousMode").is(":checked");
      state.soundMode = $("#soundMode").is(":checked")
      if ( state.workOn == false ) {
          renderTime(state.workDuration);
      }
      localStorage.setItem("settings", JSON.stringify(state));
    }
  });

  // Events

  $("#start").click(startHandle);

  // Evento de pausa
  $("#pausa").click(pauseHandle);

  $("#stop").click(stopHandle);

  // Evento Next
  $("#next").click(nextHandle);

  $("#okButton").click(okHandle);

  $("#settings").click(function() {
    $("#workTime").val(state.workDuration / 60);
    $("#breakTime").val(state.breakDuration / 60);
    $("#longBreakTime").val(state.longBreakDuration / 60);
    $("#pomosToLongBreak").val(state.pomosToLongBreak);
    $("#continuousMode").prop('checked', state.continuousMode);
    $("#soundMode").prop('checked', state.soundMode);
  });

  renderTime(state.workDuration);
  checkForTime();

});
