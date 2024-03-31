// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js';
import { getDatabase, ref as refD, set, child, get } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js';
import { getStorage, ref as refS, uploadBytes, getDownloadURL, list, listAll }  from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js';
import RecordPlugin from 'https://unpkg.com/wavesurfer.js@7/dist/plugins/record.esm.js'
import Hover from 'https://unpkg.com/wavesurfer.js@7/dist/plugins/hover.esm.js';


// const visualizer = document.querySelector(".visualizer");
const record = document.querySelector("#recordButton");
var recordingState = false;
var mediaRecorder;
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


const audioRecordingPage = document.querySelector('.audio-recording-page');
const postSubmitPage = document.querySelector('.post-submit-page');
const pageHeader = document.getElementById('header');

const playbuttons = document.querySelectorAll(".audio-player i");
const audioDurations = document.querySelectorAll(".audio-duration");

var audioCtx;
// const canvasCtx = visualizer.getContext("2d");




// INSTRUCTION PAGE AUDIO
const introPageWaveContainers = document.querySelectorAll('.intro-waveform-container');
const introAudioPlaylist = ['css/audio/2 after_basic.mp3', 'css/audio/1 first_before.mp3'];

for (let i = 0; i < 2; i++) {
  const wavesurfer_intro = WaveSurfer.create({
    container: introPageWaveContainers[i],
    waveColor: ['#ad961f', '#008282'][i],
    progressColor: ['#877416', '#006666'][i],
    responsive: true,
    height: 160,
    cursorWidth: 1.5,
    cursorColor: '#545454',
    url: introAudioPlaylist[i],
    sampleRate: 48000,
    plugins: [
        Hover.create({
            lineColor: '#fa8072',
            lineWidth: 1.5,
            labelBackground: '#777',
            labelColor: '#fff',
            labelSize: '12px',
        }),
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
  height: 160,
  cursorWidth: 1.5,
  cursorColor: '#545454',
  sampleRate: 48000,
  plugins: [
      Hover.create({
          lineColor: '#fa8072',
          lineWidth: 1.5,
          labelBackground: '#777',
          labelColor: '#fff',
          labelSize: '12px',
      }),
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




if (!(navigator.mediaDevices.getUserMedia)) {
  console.log("MediaDevices.getUserMedia() not supported on your browser!");
  showErrorMsg("MediaDevices.getUserMedia() not supported on your browser!", "#errorsAboveHere");
} else {
  console.log("The mediaDevices.getUserMedia() method is supported.");
  // showErrorMsg("NO ERROR: The mediaDevices.getUserMedia() method is supported.", "#errorsAboveHere");

  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function (stream) {
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    // visualize(stream);
    
    mediaRecorder.ondataavailable = function (event) {
      chunks.push(event.data);
    };

    mediaRecorder.onstop = function () {
      console.log("Data stream capture finished.");
      // const userRecording = document.querySelector("#userRecording");

      audioBlob = new Blob(chunks, { type : 'audio/webm' });
      chunks = [];
      const userRecordingUrl = window.URL.createObjectURL(audioBlob);

      wavesurfer_user.load(userRecordingUrl);
      console.log("Preview loaded.");
      record.textContent = "Re-record";
    };
    
  };

  let onError = function (err) {
    console.log("The following error occured: " + err);
    showErrorMsg(err, "#errorsAboveHere");
  };

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
}







// function visualize(stream) {
//   if (!audioCtx) {
//     audioCtx = new (window.AudioContext || window.webkitAudioContext)();
//   }

//   const source = audioCtx.createMediaStreamSource(stream);
//   const analyser = audioCtx.createAnalyser();
//   analyser.fftSize = 4096;
//   const bufferLength = analyser.frequencyBinCount;
//   const dataArray = new Uint8Array(bufferLength);
//   analyser.getByteTimeDomainData(dataArray);

//   source.connect(analyser);

//   draw();

//   function draw() {
//     const vWidth = visualizer.width;
//     const vHeight = visualizer.height;
  
//     requestAnimationFrame(draw);
    
//     analyser.getByteTimeDomainData(dataArray);
  
//     canvasCtx.fillStyle = "rgb(200, 200, 200)";
//     canvasCtx.fillRect(0, 0, vWidth, vHeight);
//     canvasCtx.lineWidth = 2;
//     canvasCtx.strokeStyle = "rgb(0, 0, 0)";
//     canvasCtx.beginPath();
  
//     var sliceWidth = (vWidth * 1.0) / bufferLength;
//     var x = 0;
  
//     for (let i = 0; i < bufferLength; i++) {
//       let v = dataArray[i] / 128.0;
//       let y = (v * vHeight) / 2;
  
//       if (i === 0) {
//         canvasCtx.moveTo(x, y);
//       } else {
//         canvasCtx.lineTo(x, y);
//       }
  
//       x += sliceWidth;
      
//     }
  
//     canvasCtx.lineTo(vWidth, vHeight / 2);
//     canvasCtx.stroke();
    
//   }
// }



function showErrorMsg(error, anchorSelector, above=true) {
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




function recordUserAttempt() {
  if (recordingState == false) {
    startAttempt();
  } else {
    stopAttempt();
  }
}

function startAttempt() {
  wavesurfer_user.pause();
  playbuttons[3].className = "bx bx-play-circle";
  mediaRecorder.start();
  console.log(mediaRecorder.state);
  console.log("Recorder started.");
  recordingState = true;
  record.textContent = "Stop";
  afterRecordingContainer.style.opacity = "0";
  setTimeout(() => {
    afterRecordingContainer.style.display = "none";
  }, 400);
  document.body.scrollTop = document.body.scrollHeight;
  document.documentElement.scrollTop = document.documentElement.scrollHeight;
  recordTimer = 0;
  startTime = Date.now();
  timerIncrement();
  recordIntervalObject = setInterval(timerIncrement, 500);
  timeoutObject = setTimeout(stopAttempt, 30000);
}

function stopAttempt () {
  mediaRecorder.stop();
  console.log(mediaRecorder.state);
  console.log("Recorder stopped.");
  recordingState = false;
  record.textContent = "Record";
  afterRecordingContainer.style.display = "block";
  document.body.scrollTop = document.body.scrollHeight;
  document.documentElement.scrollTop = document.documentElement.scrollHeight;
  setTimeout(() => {
    afterRecordingContainer.style.opacity = "1";
  }, 200);
  timerIncrement();
  duration = (Date.now() - startTime) / 1000;
  clearInterval(recordIntervalObject);
  clearTimeout(timeoutObject);
}

function timerIncrement() {
  let seconds = recordTimer / 2;
  let 
    tens = Math.floor(seconds / 10).toFixed(0),
    ones = (seconds % 10).toFixed(1) + '0';
  timerText.innerHTML = tens + ones;
  recordTimer++;
}



// Event listener for record button
record.addEventListener('click', () => {
  // Record user's mimicry attempt
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

const waveformContainer = document.querySelector(".waveform-container");

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
    height: 160,
    cursorWidth: 1.5,
    cursorColor: '#545454',
    sampleRate: 48000,
    plugins: [
        Hover.create({
            lineColor: '#fa8072',
            lineWidth: 1.5,
            labelBackground: '#777',
            labelColor: '#fff',
            labelSize: '12px',
        }),
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
      // Method 1: Wavesurfer visualisation
      // wavesurfer.load('css/debug/DEBUG_AUDIO.mp3'); // For debug purpose
      wavesurfer.load(url);
      // Method 2: Using default audio plugin
      // audioSource.src = url;
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
            audioBlob = new Blob(chunks, { type : 'audio/webm' });
            duration = 0;
            timerText.innerHTML = "00.00";
            record.textContent = "Record";

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
            pageHeader.innerHTML = "Submission successful!";
            
            setTimeout(() => {
              postSubmitPage.style.opacity = "1";
            }, 550);

          } else {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
            showErrorMsg("your recording must be between " + leastDuration + " and " + mostDuration + " seconds long", "#errorsAboveHere");
            timerText.innerHTML = "00.00";
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