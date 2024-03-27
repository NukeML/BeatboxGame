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
    mediaRecorder = new MediaRecorder(stream);
    visualize(stream);
 
    mediaRecorder.onstop = function () {
      console.log("Data stream capture finished.");
      const userRecording = document.querySelector("#userRecording");
      audioBlob = new Blob(chunks, {type: mediaRecorder.mimeType});
      chunks = [];
      const userRecordingUrl = window.URL.createObjectURL(audioBlob);
      userRecording.src = userRecordingUrl;
      console.log("Preview loaded.");
      record.textContent = "Re-record";
    };

    mediaRecorder.ondataavailable = function (event) {
      chunks.push(event.data);
    };
    
  };

  let onError = function (err) {
    console.log("The following error occured: " + err);
    showErrorMsg(err, "#errorsAboveHere");
  };

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
}





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

// Function to fetch and play a random reference clip
function playRandomReferenceClip() {
  // Make an HTTP request to Google Apps Script to get the URL of a random reference clip
  fetch('https://script.google.com/macros/s/AKfycbxsSsMn_QUhkmCGSsuBBBFvIlpdCx-8AHQ3W-TErfaXSDK2dMPztI4crjMTeBZuwK5N/exec',
        {
          method: "GET"
        })
    .then(response => response.json()) // Correct arrow function syntax
    .then(data => {
      // Set the source of the reference clip audio element
      const referenceClip = document.getElementById('referenceClip');
      
      // Regular expression to match Google Drive file IDs in URLs
      var regex = /(?:\/)([\w-]{25,})/;
      // Match the regex against the URL
      var match = regex.exec(data.randomClipUrl);
      // var playUrlFormat = "https://docs.google.com/uc?export=download&id=";
      var playUrlFormat = "https://drive.google.com/file/d/";
      var playUrl = playUrlFormat + match[1] + "/preview";
      
      referenceClip.src = playUrl;
      // alert('Data fetched successfully');
    })
    .catch(error => {
      showErrorMsg('Fetch error: ' + error.message, "#errorsAboveHere"); // Add message property to access error message
    });
}

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

// Function to submit form data
function submitFormData() {
  // Get user's recording and reference clip URL
  const referenceClipUrl = document.getElementById('referenceClip').src;
  var form = new FormData();
  form.append("reference", referenceClipUrl);
  form.append("attempt", audioBlob);
  // Make HTTP request to Google Apps Script to submit form data
  fetch('https://script.google.com/macros/s/AKfycbxsSsMn_QUhkmCGSsuBBBFvIlpdCx-8AHQ3W-TErfaXSDK2dMPztI4crjMTeBZuwK5N/exec', 
        {
          method: 'POST',
          redirect: "follow",
          mode: "no-cors",
          headers: {
            'Content-Type': 'multipart/form-data',
            "Access-Control-Allow-Origin": "nukeml.github.com",
          },
          body: form
        })
    .then(response => {
      // Form submitted successfully
      console.log('Form submitted successfully!');
    })
    .catch(error => {
      showErrorMsg('Submit error: ' + error.message, "#errorsAboveHere");
    });
}

// Event listener for record button
record.addEventListener('click', () => {
  // Record user's mimicry attempt
  recordUserAttempt();
});

// Event listener for submit button
document.getElementById('submitButton').addEventListener('click', () => {
  // Submit form data
  submitFormData();
});

// document.addEventListener('DOMContentLoaded', function() {
//     alert("Ready!");
// }, false);

// Play a random reference clip when the page loads
playRandomReferenceClip();
// showErrorMsg("BIG ERROR", "#errorsAboveHere");
