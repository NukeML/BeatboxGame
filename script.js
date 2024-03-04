// Function to fetch and play a random reference clip
function playRandomReferenceClip() {
  // Make an HTTP request to Google Apps Script to get the URL of a random reference clip
  fetch('https://script.google.com/macros/s/AKfycbz-nH9xY5V2AUHmwBSFz0F4hVi5jmpqsqx8tLcYjrV1flBUL1UxeRdwqQzeIKTiGGXi/exec')
    .then(response => response.json())
    .then(data => {
      // Set the source of the reference clip audio element
      const referenceClip = document.getElementById('referenceClip');
      referenceClip.src = data.randomClipUrl;
    });
  alert(JSON.stringify(data));
  document.getElementById('rcText').textContent = "fanchoeng";
}

// Function to record user's mimicry attempt
function recordUserAttempt() {
  // Use MediaRecorder API to record audio from microphone
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.addEventListener('dataavailable', event => {
        chunks.push(event.data);
      });

      mediaRecorder.addEventListener('stop', () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const userRecording = document.getElementById('userRecording');
        userRecording.src = URL.createObjectURL(blob);
      });

      // Start recording
      mediaRecorder.start();

      // Set time limit for recording
      setTimeout(() => {
        mediaRecorder.stop();
      }, 10000); // Adjust time limit as needed (10 seconds in this example)
    });
}

// Function to submit form data
function submitFormData() {
  // Get user's recording and reference clip URL
  const userRecording = document.getElementById('userRecording').src;
  const referenceClipUrl = document.getElementById('referenceClip').src;

  // Make HTTP request to Google Apps Script to submit form data
  fetch('https://script.google.com/macros/s/your-script-id/exec', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userRecording, referenceClipUrl })
  })
  .then(response => {
    if (response.ok) {
      // Form submitted successfully
      alert('Form submitted successfully!');
    } else {
      // Error handling
      alert('Error submitting form. Please try again.');
    }
  });
}

// Event listener for record button
document.getElementById('recordButton').addEventListener('click', () => {
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
