// Set up basic variables for app
const record = document.querySelector(".record1");
const stop = document.querySelector(".stop");
//const soundClips = document.querySelector(".sound-clips");
const canvasAudio = document.querySelector(".visualizer");
const mainSection = document.querySelector(".main-controls");

// Disable stop button while not recording
stop.disabled = true;

// Visualiser setup - create web audio api context and canvas
let audioCtx;
const canvasCtx = canvasAudio.getContext("2d");

async function sendData(uploadFile) {
    console.log("sendData "+aqa.uploadId);
    var formData = new FormData();
    formData.append('sessionId', aqa.sessionId);
    formData.append('uploadId', aqa.uploadId);
    formData.append('nickname', aqa.nickname);
    formData.append('file', uploadFile);
    
    try {
    const response = await fetch("https://apolloqa.net/post", {
      method: "POST",
      body: formData,
      });
      console.log(await response.json());
      
      let trackUrl="https://apolloqa.net/loops/"+aqa.sessionId+"/u"+aqa.uploadId+".ogg";
      let trackId=aqa.uploadId%4;
      orbitertrackUrl[trackId]=trackUrl;
      playTrack(trackUrl, trackId);
      if(trackId<aqa.nTracks) {
          sendTrackList(orbitertrackUrl);
      }
      for (let i = 0; i < 16; i++) {
          orbiter[trackId][i].isVisible = true;
      }
      
      aqa.uploadId++;
    } catch (e) {
        console.error(e);
    }
}

// Main block for doing the audio recording
if (navigator.mediaDevices.getUserMedia) {
  console.log("The mediaDevices.getUserMedia() method is supported.");

  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function (stream) {
    aqa.mediaRecorder = new MediaRecorder(stream);

    visualize(stream);

    record.onclick = function () {
      if(syncTrackRunning===false) {
        syncTrackTimer();
      }
      console.log(aqa.mediaRecorder.state);
      console.log("Recorder armed.");
      aqa.recArmed=true;
      record.style.background = "orange";
      stop.disabled = false;
      record.disabled = true;
    };

    stop.onclick = function () {
      aqa.stopArmed=true;
      record.style.background = "";
      record.style.color = "";
      stop.disabled = true;
      record.disabled = false;
      stop.style.background = "orange";
    };

    aqa.mediaRecorder.onstop = function (e) {
      console.log("Last data to read (after MediaRecorder.stop() called).");

      /*
      const clipName = prompt(
        "Enter a name for your sound clip?",
        "My unnamed clip"
      );

      const clipContainer = document.createElement("article");
      const clipLabel = document.createElement("p");
      const audio = document.createElement("audio");
      const deleteButton = document.createElement("button");

      clipContainer.classList.add("clip");
      audio.setAttribute("controls", "");
      deleteButton.textContent = "Delete";
      deleteButton.className = "delete";

      if (clipName === null) {
        clipLabel.textContent = "My unnamed clip";
      } else {
        clipLabel.textContent = clipName;
      }

      clipContainer.appendChild(audio);
      clipContainer.appendChild(clipLabel);
      clipContainer.appendChild(deleteButton);
      //soundClips.appendChild(clipContainer);

      audio.controls = true;
      let blob = new Blob(chunks, { type: mediaRecorder.mimeType });
      //chunks = [];
      
      let audioURL = window.URL.createObjectURL(blob);
      console.log("audioURL:"+audioURL);
      audio.src = audioURL;
      */
      console.log("recorder stopped");

      let blob = new Blob(chunks, { type: "audio/ogg" });
      let uploadFile = new File([blob], 'recording.ogg');

      sendData(uploadFile);
      chunks = [];
    };

    aqa.mediaRecorder.ondataavailable = function (e) {
      chunks.push(e.data);
    };
  };

  let onError = function (err) {
    console.log("The following error occured: " + err);
  };

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
} else {
  console.log("MediaDevices.getUserMedia() not supported on your browser!");
}

function visualize(stream) {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  const source = audioCtx.createMediaStreamSource(stream);

  const bufferLength = 2048;
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = bufferLength;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);

  draw();

  function draw() {
    const WIDTH = canvasAudio.width;
    const HEIGHT = canvasAudio.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "rgb(200, 200, 200)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0, 0, 0)";

    canvasCtx.beginPath();

    let sliceWidth = (WIDTH * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      let v = dataArray[i] / 128.0;
      let y = (v * HEIGHT) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }
}

/*
window.onresize = function () {
  canvas.width = mainSection.offsetWidth;
};

window.onresize();
*/
