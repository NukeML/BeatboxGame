// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js';
// import { getDatabase, ref as refD, set, child, get } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js';
import { getStorage, ref as refS, uploadBytes, getDownloadURL, list, listAll }  from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js';
import Hover from 'https://unpkg.com/wavesurfer.js@7/dist/plugins/hover.esm.js';
// import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

// const convertToM4A = async (inputBlob) => {
//   const ffmpeg = createFFmpeg({ log: true });

//   await ffmpeg.load();

//   ffmpeg.FS('writeFile', 'input.mp3', await fetchFile(inputBlob));

//   await ffmpeg.run('-i', 'input.mp3', '-c:a', 'aac', '-strict', 'experimental', 'output.m4a');

//   const m4aData = ffmpeg.FS('readFile', 'output.m4a');
//   const m4aBlob = new Blob([m4aData.buffer], { type: 'audio/mp4' });

//   return m4aBlob;
// };

const visualizer = document.querySelector(".visualizer");
const record = document.querySelector("#recordButton");
var recordingState = false;
var mediaRecorder;
const afterRecordText = document.querySelector("#afterRecordText");
var recordIntervalObject;
var recordTimer = 0;
const timerText = document.querySelector("#timer");
var timeoutObject;
var audioBlob;
let startTime;
let duration = 0;

var audioCtx;
const canvasCtx = visualizer.getContext("2d");

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
    visualize(stream);
    
    mediaRecorder.ondataavailable = function (event) {
      chunks.push(event.data);
    };

    mediaRecorder.onstop = function () {
      console.log("Data stream capture finished.");
      const userRecording = document.querySelector("#userRecording");
      audioBlob = new Blob(chunks, { type : 'audio/webm' });
      chunks = [];
      const userRecordingUrl = window.URL.createObjectURL(audioBlob);
      userRecording.src = userRecordingUrl;
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


// CONVERT TO WAV

// Function to convert WebM Blob to WAV



// //////////////




function visualize(stream) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 4096;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);

  source.connect(analyser);

  draw();

  function draw() {
    const vWidth = visualizer.width;
    const vHeight = visualizer.height;
  
    requestAnimationFrame(draw);
    
    analyser.getByteTimeDomainData(dataArray);
  
    canvasCtx.fillStyle = "rgb(200, 200, 200)";
    canvasCtx.fillRect(0, 0, vWidth, vHeight);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0, 0, 0)";
    canvasCtx.beginPath();
  
    var sliceWidth = (vWidth * 1.0) / bufferLength;
    var x = 0;
  
    for (let i = 0; i < bufferLength; i++) {
      let v = dataArray[i] / 128.0;
      let y = (v * vHeight) / 2;
  
      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }
  
      x += sliceWidth;
      
    }
  
    canvasCtx.lineTo(vWidth, vHeight / 2);
    canvasCtx.stroke();
    
  }
}

// // Function to fetch and play a random reference clip
// function playRandomReferenceClip() {
//   // Make an HTTP request to Google Apps Script to get the URL of a random reference clip
//   fetch('https://script.google.com/macros/s/AKfycbxsSsMn_QUhkmCGSsuBBBFvIlpdCx-8AHQ3W-TErfaXSDK2dMPztI4crjMTeBZuwK5N/exec',
//         {
//           method: "GET"
//         })
//     .then(response => response.json()) // Correct arrow function syntax
//     .then(data => {
//       // Set the source of the reference clip audio element
//       const referenceClip = document.getElementById('referenceClip');
      
//       // Regular expression to match Google Drive file IDs in URLs
//       var regex = /(?:\/)([\w-]{25,})/;
//       // Match the regex against the URL
//       var match = regex.exec(data.randomClipUrl);
//       // var playUrlFormat = "https://docs.google.com/uc?export=download&id=";
//       var playUrlFormat = "https://drive.google.com/file/d/";
//       var playUrl = playUrlFormat + match[1] + "/preview";
      
//       referenceClip.src = playUrl;
//       // alert('Data fetched successfully');
//     })
//     .catch(error => {
//       showErrorMsg('Fetch error: ' + error.message, "#errorsAboveHere"); // Add message property to access error message
//     });
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
    errorMsgText.textContent = "error: " + String(error);
    if (above == true) {
      parent.insertBefore(errorMsg, anchor);
    } else {
      parent.insertBefore(errorMsg, anchor.nextSibling);
    }
    
  }

}


// // Function to record user's mimicry attempt
// function recordUserAttempt() {
//   // Use MediaRecorder API to record audio from microphone
//   navigator.mediaDevices.getUserMedia({ audio: true })
//     .then(stream => {
//       const mediaRecorder = new MediaRecorder(stream);
//       const chunks = [];

//       mediaRecorder.addEventListener('dataavailable', event => {
//         chunks.push(event.data);
//       });

//       mediaRecorder.addEventListener('stop', () => {
//         const blob = new Blob(chunks, { type: 'audio/wav' });
//         const userRecording = document.getElementById('userRecording');
//         userRecording.src = URL.createObjectURL(blob);
//       });

//       // Start recording
//       mediaRecorder.start();

//       // Set time limit for recording
//       setTimeout(() => {
//         mediaRecorder.stop();
//       }, 10000); // Adjust time limit as needed (10 seconds in this example)
//     });
// }

function recordUserAttempt() {
  if (recordingState == false) {
    startAttempt();
  } else {
    stopAttempt();
  }
}

function startAttempt() {
  mediaRecorder.start();
  console.log(mediaRecorder.state);
  console.log("Recorder started.");
  recordingState = true;
  record.textContent = "Stop";
  afterRecordText.style.display = "none";
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
  afterRecordText.style.display = "";
  timerIncrement();
  duration = (Date.now() - startTime) / 1000;
  clearInterval(recordIntervalObject);
  clearTimeout(timeoutObject);
}

function timerIncrement() {
  let seconds = recordTimer / 2;
  let 
    tens = Math.floor(seconds / 10).toFixed(0),
    ones = (seconds % 10).toFixed(1);
  timerText.textContent = tens + ones;
  recordTimer++;
}

// // Function to submit form data
// function submitFormData() {
//   // Get user's recording and reference clip URL
//   const referenceClipUrl = document.getElementById('referenceClip').src;
//   var form = new FormData();
//   form.append("reference", referenceClipUrl);
//   form.append("attempt", audioBlob);
//   // Make HTTP request to Google Apps Script to submit form data
//   fetch('https://script.google.com/macros/s/AKfycbxsSsMn_QUhkmCGSsuBBBFvIlpdCx-8AHQ3W-TErfaXSDK2dMPztI4crjMTeBZuwK5N/exec', 
//         {
//           method: 'POST',
//           redirect: "follow",
//           mode: "no-cors",
//           headers: {
//             'Content-Type': 'multipart/form-data',
//             "Access-Control-Allow-Origin": "nukeml.github.com",
//           },
//           body: form
//         })
//     .then(response => {
//       // Form submitted successfully
//       console.log('Form submitted successfully!');
//     })
//     .catch(error => {
//       showErrorMsg('Submit error: ' + error.message, "#errorsAboveHere");
//     });
// }

// Event listener for record button
record.addEventListener('click', () => {
  // Record user's mimicry attempt
  recordUserAttempt();
});

// Event listener for submit button
// document.getElementById('submitButton').addEventListener('click', () => {
//   // Submit form data
//   submitFormData();
// });

// document.addEventListener('DOMContentLoaded', function() {
//     alert("Ready!");
// }, false);

// Play a random reference clip when the page loads
// playRandomReferenceClip();
// showErrorMsg("BIG ERROR", "#errorsAboveHere");





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
// const database = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);


// LOAD RANDOM AUDIO WHEN WEBSITE IS LOADED
const audioname = document.getElementById("audioname");
const audioSource = document.getElementById("audio-source");

// const waveformContainer = document.querySelector(".waveform-container");

// const playbuttons = document.querySelector(".audio-player i");
// const audioDurations = document.querySelector(".audio-duration");

// var formatTime = function (time) {
//   return [
//       ('00' + Math.floor((time % 3600) / 60)).slice(-2), // minutes
//       ('00' + Math.floor(time % 60)).slice(-2) // seconds
//   ].join(':');
// };

window.addEventListener("load", () => {
  fetchAudioFile();
});

function uploadAudioFile(referenceClipName, wavBlob) {

  // Referencing target user audio location
  const useraudioRef = refS(storage, `training_data/${referenceClipName}/${Date.now()}.webm`);

  // Upload audio to database
  uploadBytes(useraudioRef, wavBlob)
  .then(() => {
    alert("Audio submitted!");
  })
  .catch((error) => {
    showErrorMsg(error.message, "#errorsAboveHere");
  });

}

function fetchAudioFile() {

  var audio = new Audio();

  const referenceAudioFolderRef = refS(storage, "labels/");

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
    var referenceAudioDruation;

    // Get audio file URL and load selected audio file
    getDownloadURL(randomAudioRef)
    .then((url) => {
      // const wavesurfer = WaveSurfer.create({
      //   container: waveformContainer,
      //   waveColor: '#ad961f',
      //   progressColor: '#877416',
      //   responsive: true,
      //   height: 85,
      //   cursorWidth: 1.5,
      //   cursorColor: '#545454',
      //   sampleRate: 48000,
      //   url: url,
      //   plugins: [
      //       Hover.create({
      //           lineColor: '#fa8072',
      //           lineWidth: 1.5,
      //           labelBackground: '#777',
      //           labelColor: '#fff',
      //           labelSize: '12px',
      //       }),
      //   ],
      // });
      // // Audio controls
      // playbuttons.addEventListener('click', () => {
      //   if (playbuttons.className == "bx bx-play-circle") {
      //     wavesurfer.playPause();
      //       playbuttons.className = "bx bx-pause-circle";
      //   } else {
      //     wavesurfer.playPause();
      //     playbuttons.className = "bx bx-play-circle";
      //   }
      // });
      // // Show current time
      // wavesurfer.on('ready', function () {
      //   audioDurations.textContent = formatTime(wavesurfer.getDuration());
      // });
      // // Show current time
      // wavesurfer.on('audioprocess', function () {
      //   audioDurations.textContent = formatTime(wavesurfer.getCurrentTime());
      // });
      // // When audio ends
      // wavesurfer.on('finish', () => {
      //   playbuttons.className = "bx bx-play-circle";
      // });

      // Method 2: Using default audio plugin
      audioSource.src = url;
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

    // SUBMIT AUDIO
    const submitButton = document.querySelector(".sbutton");
    submitButton.addEventListener("click", () => {
      // Audio Validation
      if (duration >= 5) {
        // Assume webmBlob contains the Blob data of your WebM audio file
        // var wavBlob = convertWebMToWAV(audioBlob);
        uploadAudioFile(randomAudioName, audioBlob);
        let chunks = [];
        audioBlob = new Blob(chunks, { type : 'audio/webm' });
        duration = 0;
      } else if (duration == 0) {
        alert("Please start recording before submitting your audio.")
      } else {
        alert("Your recorded audio is too short! Please re-try.");
      }
    });

  })
  .catch((error) => {
    showErrorMsg(error.message, "#errorsAboveHere");
  });
}
