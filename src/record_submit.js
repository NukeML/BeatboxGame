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
var referenceAudioDuration;
var leastDuration;
var mostDuration;


const introductionPage = document.querySelector('.introduction-page');
const navButton = document.querySelector('.navButton');
const consentAgreementPopUp = document.querySelector('.consent-agreement-box');
const consentAgreementContent = document.querySelector('.consent-agreement-content');
const disagreeButton = document.querySelector('.disagree-button');
const agreeButton = document.querySelector('.agree-button');
const audioRecordingPage = document.querySelector('.audio-recording-page');
const postSubmitPage = document.querySelector('.post-submit-page');
const pageHeader = document.getElementById('header');
const navbackButton = document.querySelector('.navbackButton');
const errorMsgContainer = document.querySelector('.errorMsgContainer');

const HEADER1 = "Beatbox Imitation Game";
const HEADER2 = "Submission successful.<br>Thanks for playing!";


const playbuttons = document.querySelectorAll(".audio-player i");
const audioDurations = document.querySelectorAll(".audio-duration");

var isConsentAgreed = false;

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
  normalize: true,
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
  showErrorMsg("mediaDevices.getUserMedia() not supported on your browser. Microphone cannot be used.");
} else {
  console.log("The mediaDevices.getUserMedia() method is supported.");

  // Request Audio permission on navigation
  navButton.addEventListener('click', () => {
    if (!isConsentAgreed) {
      consentAgreementPopUp.classList.remove("hidden");
      setTimeout(() => { consentAgreementPopUp.style.opacity = 1; }, 280);
    } else {
      introductionPage.style.left = "-200%";
      introductionPage.style.opacity = "0";
      setTimeout(() => {
        introductionPage.style.display = "none";
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        audioRecordingPage.style.display = "block";
      }, 350);

      setTimeout(() => {
        audioRecordingPage.style.opacity = "1";
        if (!microphone) {
          captureMicrophone(function (mic) {
            microphone = mic;
          });
          return;
        }
      }, 550);
    }
  });

  // Require user's consent
  // Disagree action
  disagreeButton.addEventListener("click", () => {
    consentAgreementPopUp.style.opacity = 0;
    consentAgreementContent.scrollTop = 0;
    setTimeout(() => { consentAgreementPopUp.classList.add("hidden"); }, 280);
  });
  // Agree action
  agreeButton.addEventListener("click", () => {
    consentAgreementPopUp.style.opacity = 0;
    setTimeout(() => { consentAgreementPopUp.classList.add("hidden"); }, 280);

    introductionPage.style.left = "-200%";
    introductionPage.style.opacity = "0";
    setTimeout(() => {
      introductionPage.style.display = "none";
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      audioRecordingPage.style.display = "block";
    }, 350);

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

function removeErrorMsg() {
  while(errorMsgContainer.childElementCount > 0) {
    errorMsgContainer.removeChild(errorMsgContainer.lastElementChild);
  }
}

function showErrorMsg(error) {
  const template = document.querySelector("#errorMsg");
  const errorMsg = template.content.cloneNode(true);
  var errorMsgText = errorMsg.querySelector(".error-msg-innertext");
  // const closeErrorMsgButton = errorMsg.querySelector('.closebtn');
  // closeErrorMsgButton.addEventListener("click", () => { errorMsg.querySelector('error-msg').style.display = "none"; });
  errorMsgText.textContent = "Error: " + String(error);
  errorMsgContainer.appendChild(errorMsg);
}



// RECORDER SET-UP FUNCTIONS
function captureMicrophone(callback) {

  if(microphone) {
      callback(microphone);
      return;
  }

  navigator.mediaDevices.getUserMedia({
      audio: isEdge ? true : {
          echoCancellation: false
      }
  }).then(function(mic) {
      callback(mic);
  }).catch( (error) => {
      showErrorMsg(error.message);
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
    stopAttempt(true);
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
  recordIntervalObject = setInterval(timerIncrement, 500);
  timeoutObject = setTimeout(stopAttempt, mostDuration * 1000);
  timerIncrement();
  
}


// STOP RECORDING
function stopAttempt (manual=false) {
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

  // distinguish between manual stop and auto stop
  if (manual == false) {
    console.log("Recording time limit reached.");
  }
}

// Time Increment Function for Recording
function timerIncrement() {
  let seconds = recordTimer / 2;
  // let 
  //   tens = Math.floor(seconds / 10).toFixed(0),
  //   ones = (seconds % 10).toFixed(1);
  // timerText.textContent = tens + ones;
  timerText.textContent = seconds.toFixed(1);
  recordTimer++;
}


// Event listener for record button
recordButton.addEventListener('click', () => {
  removeErrorMsg();
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

var uploadLimit = 0;
var currentSubmission = 1;

// SUBMIT BUTTON ONCLICK IS HERE
function fetchAudioFile() {

  recordButton.disabled = true;

  var referenceAudioFolderRef = refS(storage, "labels/");

  return listAll(referenceAudioFolderRef).then((result) => {

    // Storing list of audio files fetched directly from Firebase storage
    var referenceAudioList = [];
    result.items.forEach((itemRef) => {
      referenceAudioList.push(itemRef.name);
    });

    // Randomly select one audio file from the list
    var randomIndex = Math.floor(Math.random() * referenceAudioList.length);
    var randomAudioName = referenceAudioList[randomIndex];
    var randomAudioRef = refS(storage, "labels/" + randomAudioName);

    var randomAudioNameWithoutExtension = randomAudioName.split(".")[0];
    audioname.textContent = randomAudioNameWithoutExtension;

    // Get audio file URL and load selected audio file
    getDownloadURL(randomAudioRef)
      .then((url) => {
        // Wavesurfer visualisation
        wavesurfer.load(url);

        // Check recorded audio duration
        var audio = new Audio(url);
        audio.addEventListener("loadedmetadata", () => {
          referenceAudioDuration = audio.duration;
          leastDuration = (Math.floor(referenceAudioDuration) * 0.9);
          mostDuration = (Math.ceil(referenceAudioDuration) * 1.3);
          leastDurationText.textContent = Math.floor(leastDuration);
          mostDurationText.textContent = Math.floor(mostDuration);
          recordButton.disabled = false;

          // SUBMIT AUDIO
          var submitButton = document.querySelector(".sbutton");
          submitButton.addEventListener("click", () => {
            isConsentAgreed = true;
            wavesurfer.pause();
            wavesurfer_user.pause();
            // Audio Validation
            if (duration >= Math.floor(leastDuration) && duration <= Math.ceil(mostDuration)) {

              uploadLimit += 1;
              // Upload file to Firebase
              if (uploadLimit == currentSubmission) {
                uploadAudioFile(randomAudioNameWithoutExtension, audioBlob);
              }

              // Reset recorded audio data to empty
              duration = 0;
              leastDuration = 0;
              mostDuration = 0;
              timerText.textContent = "0.0";
              recordButton.textContent = "Record";

              removeErrorMsg();

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
              if (errorMsgContainer.childElementCount == 0) {
                showErrorMsg("Invalid duration. Remember: " + leastDuration + "-" + mostDuration + "s!");
              }
              timerText.textContent = "00.00";
            }
          });
        });
      })
      .catch((error) => {
        showErrorMsg(error.message);
      });
    
  });
}

navbackButton.addEventListener('click', () => {

  postSubmitPage.style.right = "-200%";
  postSubmitPage.style.opacity = "0";
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  pageHeader.textContent = "Beatbox Imitation Game";

  uploadLimit = 0;
  currentSubmission += 1;

  fetchAudioFile();

  setTimeout(() => {
    postSubmitPage.style.display = "none";
    audioRecordingPage.style.display = "block";
    wavesurfer.empty();
    wavesurfer_user.empty();
  }, 250);

  setTimeout(() => {
    audioRecordingPage.style.opacity = 1;
  }, 550)
  
});




// MAILIING LIST
const emailAddress = document.getElementById('newsletterEmailAddress');
const newsletterSubButton = document.getElementById('newsletter-subscribe');

function sendEmailAddress() {
  set(refD(database, `mailing_list/${Date.now()}`), emailAddress.value);
  alert("Thanks for signing up! We'll be in touch :)");
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