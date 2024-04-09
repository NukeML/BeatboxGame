const visualizer = document.querySelector(".visualizer");
var audioCtx;
const canvasCtx = visualizer.getContext("2d");

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