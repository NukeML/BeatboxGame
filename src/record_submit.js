// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js';
import { getDatabase, ref as refD, set, child, get } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js';
import { getStorage, ref as refS, uploadBytes, getDownloadURL, list, listAll } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js';
// ABOVE wavesurfer source is down. Using BELOW local source instead:
import WaveSurfer from './wavesurfer.js';

// import Hover from 'https://unpkg.com/wavesurfer.js@7/dist/plugins/hover.esm.js';
// ABOVE wavesurfer source is down. Using the BELOW local source, but also making the Hover-related code (wavesurfer instantiation plugins parameter) into a variable:
import Hover from './wavesurfer_hover.js';
const hoverPlugin = Hover ? Hover.create({
  lineColor: '#fa8072',
  lineWidth: 1.5,
  labelBackground: '#777',
  labelColor: '#fff',
  labelSize: '12px',
}) : null;

// TODO: turn all uncertain imports (unpkg.com, cloudflare) into try...catch blocks with options to import locally, and show error messages if all fail.



const recordButton = document.querySelector("#recordButton");
var recordingState = false;
const afterRecordingContainer = document.querySelector(".after-recording-container");
var recordIntervalObject;
var recordTimer = 0;
const timerText = document.querySelector("#timer");
var timeoutObject;
var audioBlob;
let startTime;
let duration = 0;
const leastDurationText = document.querySelector("#leastDuration");
const mostDurationText = document.querySelector("#mostDuration");


const introductionPage = document.querySelector('.introduction-page');
const navButton = document.querySelector('.navButton');
const audioRecordingPage = document.querySelector('.audio-recording-page');
const postSubmitPage = document.querySelector('.post-submit-page');
const pageHeader = document.getElementById('header');

const HEADER1 = "Beatbox Imitation Game";
const HEADER2 = "Submission successful.<br>Thanks for playing!";


const playbuttons = document.querySelectorAll(".audio-player i");
const audioDurations = document.querySelectorAll(".audio-duration");

// detections for audio recording functionality
var isEdge = navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob);
var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

var recorder;
var microphone;

// configurations for RecordRTC
// DO NOT DELETE commented parts. only commented for debug purposes
const RTC_CONFIG = {
  type: 'audio',
  mimeType: 'audio/webm',
  // numberOfAudioChannels: isEdge ? 1 : 2,
  // numberOfAudioChannels: 1,
  recorderType: StereoAudioRecorder,
  timeSlice: 200,
  numberOfAudioChannels: 1
};
// const RecorderType = GetRecorderType(RTC_CONFIG);
// RTC_CONFIG.recorderType = RecorderType;

// DO NOT DELETE. only commented for debug purposes
// if (isSafari || isEdge) {
//   RTC_CONFIG.recorderType = StereoAudioRecorder;
// }
// if (navigator.platform && navigator.platform.toString().toLowerCase().indexOf('win') === -1) {
//   RTC_CONFIG.sampleRate = 48000; // or 44100 or remove this line for default
// }
// if (isSafari) {
//   RTC_CONFIG.sampleRate = 44100;
//   RTC_CONFIG.bufferSize = 4096;
//   RTC_CONFIG.numberOfAudioChannels = 2;
// }




// Responsive waveform height calculation
function vh(percent) {
  var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  return (percent * h) / 100;
}

function vw(percent) {
  var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  return (percent * w) / 100;
}

const R_PHONE = 0.462;
const R_PC = 2.101;
const P_SHIFT = 2;

function empirical(percent) {
  var r = vw(100) / vh(100);
  var d = vw(P_SHIFT) / (R_PC - R_PHONE) * (r - R_PHONE);
  return d + vw(percent);
}




// INSTRUCTION PAGE AUDIO
const introPageWaveContainers = document.querySelectorAll('.intro-waveform-container');
const introAudioPlaylist = ['css/audio/Instruction showcase01-lengbeat.m4a', 'css/audio/Instruction showcase01-9beat.m4a'];

for (let i = 0; i < 2; i++) {
  const wavesurfer_intro = WaveSurfer.create({
    container: introPageWaveContainers[i],
    waveColor: ['#ad961f', '#008282'][i],
    progressColor: ['#877416', '#006666'][i],
    responsive: true,
    height: empirical(7),
    cursorWidth: 1.5,
    cursorColor: '#545454',
    url: introAudioPlaylist[i],
    sampleRate: 48000,
    plugins: [
      hoverPlugin
    ],
  });
  // Audio controls
  playbuttons[i].addEventListener('click', () => {
    if (playbuttons[i].className == "bx bx-play-circle") {
      wavesurfer_intro.playPause();
      playbuttons[i].className = "bx bx-pause-circle";
    } else {
      wavesurfer_intro.playPause();
      playbuttons[i].className = "bx bx-play-circle";
    }
  });
  // Show current time
  wavesurfer_intro.on('ready', function () {
    audioDurations[i].textContent = formatTime(wavesurfer_intro.getDuration());
  });
  // Show current time
  wavesurfer_intro.on('audioprocess', function () {
    audioDurations[i].textContent = formatTime(wavesurfer_intro.getCurrentTime());
  });
  // When audio ends
  wavesurfer_intro.on('finish', () => {
    playbuttons[i].className = "bx bx-play-circle";
  });
}




// WAVESURFER AUDIO VISUALISER SET-UP
const wavesurfer_user = WaveSurfer.create({
  container: '.waveform-user-container',
  waveColor: '#008282',
  progressColor: '#006666',
  responsive: true,
  height: empirical(7),
  cursorWidth: 1.5,
  cursorColor: '#545454',
  sampleRate: 48000,
  plugins: [
    hoverPlugin
  ],
});
// Audio controls
playbuttons[3].addEventListener('click', () => {
  if (playbuttons[3].className == "bx bx-play-circle") {
    wavesurfer_user.playPause();
    playbuttons[3].className = "bx bx-pause-circle";
  } else {
    wavesurfer_user.playPause();
    playbuttons[3].className = "bx bx-play-circle";
  }
});
// Show current time
wavesurfer_user.on('ready', function () {
  audioDurations[3].textContent = formatTime(wavesurfer_user.getDuration());
});
// Show current time
wavesurfer_user.on('audioprocess', function () {
  audioDurations[3].textContent = formatTime(wavesurfer_user.getCurrentTime());
});
// When audio ends
wavesurfer_user.on('finish', () => {
  playbuttons[3].className = "bx bx-play-circle";
});


if (typeof navigator.mediaDevices === 'undefined' || !navigator.mediaDevices.getUserMedia) {
  showErrorMsg("mediaDevices.getUserMedia() not supported on your browser. Microphone cannot be used.", "#errorsAboveHere");
} else {
  console.log("The mediaDevices.getUserMedia() method is supported.");

  // Request Audio permission on navigation
  navButton.addEventListener('click', () => {
    introductionPage.style.left = "-200%";
    introductionPage.style.opacity = "0";

    setTimeout(() => {
      introductionPage.style.display = "none";
      audioRecordingPage.style.display = "block";
    }, 350);

    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    setTimeout(() => {
      audioRecordingPage.style.opacity = "1";
      if (!microphone) {
        captureMicrophone(function (mic) {
          microphone = mic;
        });
        return;
      }
    }, 550);
  });
}



function showErrorMsg(error, anchorSelector, above = true) {
  if (!("content" in document.createElement("template"))) {
    alert('ERROR MESSAGE CANNOT BE DISPLAYED');
  } else {
    const anchor = document.querySelector(anchorSelector);
    const parent = anchor.parentNode;
    const template = document.querySelector("#errorMsg");
    const errorMsg = template.content.cloneNode(true);
    var errorMsgText = errorMsg.querySelector(".error-msg-innertext");
    errorMsgText.textContent = "Error: " + String(error);
    if (above == true) {
      parent.insertBefore(errorMsg, anchor);
    } else {
      parent.insertBefore(errorMsg, anchor.nextSibling);
    }

  }

}



// RECORDER SET-UP FUNCTIONS
function captureMicrophone(callback) {

  if(microphone) {
      callback(microphone);
      return;
  }

  if(!!navigator.getUserMedia) {
      showErrorMsg("Your browser is using a deprecated version of getUserMedia. Some features may be unusable.", "#errorsAboveHere");
  }

  navigator.mediaDevices.getUserMedia({
      audio: isEdge ? true : {
          echoCancellation: false
      }
  }).then(function(mic) {
      callback(mic);
  }).catch( (error) => {
      showErrorMsg(error.message, "#errorsAboveHere");
  });
}

function stopRecordingCallback() {
  audioBlob = recorder.getBlob()
  wavesurfer_user.loadBlob(audioBlob);
}


// SWITCH BETWEEN START AND STOP RECORDING
function recordUserAttempt() {
  if (recordingState == false) {
    startAttempt();
  } else {
    stopAttempt();
  }
}


// START RECORDING
function startAttempt() {

  console.log("Recorder started.");
  recordingState = true;

  // Styling
  wavesurfer_user.pause();
  playbuttons[3].className = "bx bx-play-circle";
  recordButton.textContent = "Stop";
  afterRecordingContainer.style.opacity = "0";
  setTimeout(() => {
    afterRecordingContainer.style.display = "none";
  }, 400);
  document.body.scrollTop = document.body.scrollHeight;
  document.documentElement.scrollTop = document.documentElement.scrollHeight;

  // Reset Time Zero
  recordTimer = 0;
  startTime = Date.now();


  // Start recording
  if (recorder) {
    recorder.destroy();
    recorder = null;
  }
  recorder = RecordRTC(microphone, RTC_CONFIG);
  recorder.startRecording();

  // Log Time
  timerIncrement();
  recordIntervalObject = setInterval(timerIncrement, 500);
  timeoutObject = setTimeout(stopAttempt, 30000);
  
}


// STOP RECORDING
function stopAttempt () {
  // Stop Recording
  recorder.stopRecording(stopRecordingCallback);
  console.log("Recorder stopped.");
  recordingState = false;

  // Styling
  recordButton.textContent = "Re-record";
  afterRecordingContainer.style.display = "block";
  document.body.scrollTop = document.body.scrollHeight;
  document.documentElement.scrollTop = document.documentElement.scrollHeight;
  setTimeout(() => {
    afterRecordingContainer.style.opacity = "1";
  }, 200);

  // Log Time
  duration = (Date.now() - startTime) / 1000;
  clearInterval(recordIntervalObject);
  clearTimeout(timeoutObject);
}

// Time Increment Function for Recording
function timerIncrement() {
  let seconds = recordTimer / 2;
  let 
    tens = Math.floor(seconds / 10).toFixed(0),
    ones = (seconds % 10).toFixed(1) + '0';
  timerText.textContent = tens + ones;
  recordTimer++;
}


// Event listener for record button
recordButton.addEventListener('click', () => {
  recordUserAttempt();
});











// FIREBASE


const firebaseConfig = {
  apiKey: "AIzaSyB_vp6WVFZLfwAxryfP9lJsldRabLLqaWE",
  authDomain: "beatbox-ml-datacollection.firebaseapp.com",
  projectId: "beatbox-ml-datacollection",
  storageBucket: "beatbox-ml-datacollection.appspot.com",
  messagingSenderId: "467043071261",
  appId: "1:467043071261:web:8f57f5821fd62f45fd5df4"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);


// LOAD RANDOM AUDIO WHEN WEBSITE IS LOADED
const audioname = document.getElementById("audioname");
// const audioSource = document.getElementById("audio-source");

const waveformContainer = document.querySelector("#reference-waveform-container");

var formatTime = function (time) {
  return [
    ('00' + Math.floor((time % 3600) / 60)).slice(-2), // minutes
    ('00' + Math.floor(time % 60)).slice(-2) // seconds
  ].join(':');
};

window.addEventListener("load", () => {
  fetchAudioFile();
});

function uploadAudioFile(referenceClipName, wavBlob) {

  // Referencing target user audio location
  const useraudioRef = refS(storage, `training_data/${referenceClipName}/${Date.now()}.webm`);

  // Upload audio to database
  uploadBytes(useraudioRef, wavBlob);

}

// SUBMIT BUTTON ONCLICK IS HERE
function fetchAudioFile() {

  var referenceAudioDuration;

  const referenceAudioFolderRef = refS(storage, "labels/");

  // WAVESURFER AUDIO VISUALISER SET-UP
  const wavesurfer = WaveSurfer.create({
    container: waveformContainer,
    waveColor: '#ad961f',
    progressColor: '#877416',
    responsive: true,
    height: empirical(7),
    cursorWidth: 1.5,
    cursorColor: '#545454',
    sampleRate: 48000,
    plugins: [
      hoverPlugin
    ],
  });
  // Audio controls
  playbuttons[2].addEventListener('click', () => {
    if (playbuttons[2].className == "bx bx-play-circle") {
      wavesurfer.playPause();
      playbuttons[2].className = "bx bx-pause-circle";
    } else {
      wavesurfer.playPause();
      playbuttons[2].className = "bx bx-play-circle";
    }
  });
  // Show current time
  wavesurfer.on('ready', function () {
    audioDurations[2].textContent = formatTime(wavesurfer.getDuration());
  });
  // Show current time
  wavesurfer.on('audioprocess', function () {
    audioDurations[2].textContent = formatTime(wavesurfer.getCurrentTime());
  });
  // When audio ends
  wavesurfer.on('finish', () => {
    playbuttons[2].className = "bx bx-play-circle";
  });

  return listAll(referenceAudioFolderRef).then((result) => {

    // Storing list of audio files fetched directly from Firebase storage
    var referenceAudioList = [];
    result.items.forEach((itemRef) => {
      referenceAudioList.push(itemRef.name);
    });

    // Randomly select one audio file from the list
    const randomIndex = Math.floor(Math.random() * referenceAudioList.length);
    const randomAudioName = referenceAudioList[randomIndex];
    const randomAudioRef = refS(storage, "labels/" + randomAudioName);

    // Get audio file URL and load selected audio file
    getDownloadURL(randomAudioRef)
      .then((url) => {
        // Wavesurfer visualisation
        // wavesurfer.load('css/debug/DEBUG_AUDIO.mp3'); // For debug purpose
        wavesurfer.load(url);
      })
      .catch((error) => {
        showErrorMsg(error.message, "#errorsAboveHere");
      });
    // Return filename of the randomly selected audio, matching user's audio to the correct label
    var lastIndex = randomAudioName.lastIndexOf(".");
    return randomAudioName.substring(0, lastIndex);
  })
    .then((randomAudioName) => {
      audioname.textContent = randomAudioName;
      const referenceAudioFolderRef = refS(storage, `labels/${randomAudioName}.m4a`);
      getDownloadURL(referenceAudioFolderRef)
        .then((url) => {

          var audio = new Audio(url)

          audio.addEventListener("loadedmetadata", () => {
            referenceAudioDuration = audio.duration;
            var leastDuration = Math.floor(referenceAudioDuration * 0.8);
            var mostDuration = Math.ceil(referenceAudioDuration * 1.2);
            leastDurationText.textContent = leastDuration;
            mostDurationText.textContent = mostDuration;

            // SUBMIT AUDIO
            const submitButton = document.querySelector(".sbutton");
            submitButton.addEventListener("click", () => {
              // Audio Validation
              if (duration >= leastDuration && duration <= mostDuration) {

                // Upload file to Firebase
                uploadAudioFile(randomAudioName, audioBlob);
                let chunks = [];
                audioBlob = new Blob(chunks, { type: 'audio/webm' });
                duration = 0;
                timerText.textContent = "00.00";
                recordButton.textContent = "Record";

                // Navigate to post-submit page
                audioRecordingPage.style.left = "-200%";
                audioRecordingPage.style.opacity = "0";
                afterRecordingContainer.style.display = "none";
                afterRecordingContainer.style.opacity = "0";

                setTimeout(() => {
                  audioRecordingPage.style.display = "none";
                  postSubmitPage.style.display = "block";
                }, 350);

                document.body.scrollTop = 0;
                document.documentElement.scrollTop = 0;
                pageHeader.innerHTML = HEADER2;

                setTimeout(() => {
                  postSubmitPage.style.opacity = "1";
                }, 550);

              } else {
                document.body.scrollTop = 0;
                document.documentElement.scrollTop = 0;
                showErrorMsg("Invalid duration. Remember: " + leastDuration + "-" + mostDuration + "s!", "#errorsAboveHere");
                timerText.textContent = "00.00";
              }
            });
          });

        })
        .catch((error) => {
          showErrorMsg(error.message, "#errorsAboveHere");
        });

    })
    .catch((error) => {
      showErrorMsg(error.message, "#errorsAboveHere");
    });
}




// MAILIING LIST
const emailAddress = document.getElementById('newsletterEmailAddress');
const newsletterSubButton = document.getElementById('newsletter-subscribe');

function sendEmailAddress() {
  set(refD(database, `mailing_list/${Date.now()}`), emailAddress.value);
  alert('Successfully signed up for newsletter!');
  // Clearing form input field
  emailAddress.value = "";
}

function checkInputs() {
  if (emailAddress.value == "") {
    emailAddress.classList.add("error");
    emailAddress.parentElement.classList.add("error");
  } else {
    checkEmail();
  }

  emailAddress.addEventListener("keyup", () => {
    checkEmail();
  });
}

function checkEmail() {
  const emailRegex = /^([a-z\d.-]+)@([a-z\d-]+)\.([a-z]{2,3})(\.[a-z]{2,3})?$/;
  const emailAddressErr = document.querySelector(".error-text.newsletter-email");

  if (!emailAddress.value.match(emailRegex)) {
    emailAddress.classList.add("error");
    emailAddress.parentElement.classList.add("error");

    if (emailAddress.value != "") {
      emailAddressErr.innerText = "* Please provide a valid email address";
    } else {
      emailAddressErr.innerText = "* Required";
    }
  } else {
    emailAddress.classList.remove("error");
    emailAddress.parentElement.classList.remove("error");
  }
}

newsletterSubButton.addEventListener("click", (e) => {

  checkInputs();

  if (!emailAddress.classList.contains("error")) {
    // Send Email Address to Database
    sendEmailAddress();
  }

});
