const playButtonId = "play";

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

let canvas;
let canvasContext;
let centerX;
let centerY;
let xPos;
let yOld;

window.addEventListener('DOMContentLoaded', (event) => {
    canvas = document.querySelector("canvas");
    canvasContext = canvas.getContext("2d");
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    xPos = 0;
    yOld = centerY * 1.8;

    handleVoiceRecordingAndDrawing();
});

function normalize(val, max, min){ return (val - min) / (max - min); }

function drawFollowingBar() {
    canvasContext.beginPath();
    canvasContext.fillRect(0, centerY + 50, xPos, 20);
    canvasContext.fillStyle = 'green';
    canvasContext.fill();
    canvasContext.lineWidth = 2;
    canvasContext.closePath();
}

function getAverageAudioY(analyser) {
    let array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    let values = centerY;

    let length = array.length;
    for (let i = 0; i < length; i++) {
        values += (array[i]);
    }

    return -1 * ((values / length) - centerY * 1.8);
}

function drawActiveVoiceWave(average) {
    canvasContext.beginPath();
    canvasContext.moveTo(xPos, yOld);
    canvasContext.lineTo(xPos += 6, average);
    yOld = average
    canvasContext.strokeStyle = '#0b49e6';
    canvasContext.lineWidth = 2;

    canvasContext.stroke();
    canvasContext.closePath();
}

function changeBackgroundColorAccordingToVoiceFrequency(average) {
    let precentage = normalize(average, canvas.height * 1.8, 0) + 1;

    console.log(precentage *50)

    canvas.style.backgroundColor = greenToRedGradiant(precentage*50);
}

function handleAudioProcess(analyser) {
    let average = getAverageAudioY(analyser);

    drawActiveVoiceWave(average);
    drawFollowingBar();
    changeBackgroundColorAccordingToVoiceFrequency(average)
}

function greenToRedGradiant(perc) {
    var r, g, b = 0;
    if(perc < 50) {
        r = 255;
        g = Math.round(5.1 * perc);
    }
    else {
        g = 255;
        r = Math.round(510 - 5.10 * perc);
    }
    var h = r * 0x10000 + g * 0x100 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
}

function successCallback(stream) {
    audioContext = new AudioContext();
    let analyser = audioContext.createAnalyser();
    let microphone = audioContext.createMediaStreamSource(stream);
    let javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

    analyser.smoothingTimeConstant = 0.1;
    analyser.fftSize = 1024;

    microphone.connect(analyser);
    analyser.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);

    javascriptNode.onaudioprocess = function () {
        handleAudioProcess(analyser);

    }
}

function handleVoiceRecordingAndDrawing() {
    if (navigator.getUserMedia) {
        navigator.getUserMedia({
                audio: true
            },
            function (stream) {
                document.getElementById(playButtonId).onclick = function () {
                    successCallback(stream);
                    document.getElementById(playButtonId).onclick = null;
                }
            },
            function (err) {
                console.log("The following error occured: " + err.name)
            });
    } else {
        console.log("getUserMedia not supported");
    }
}