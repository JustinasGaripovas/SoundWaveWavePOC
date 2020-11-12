const normalize = function(val, max, min) { return (val - min) / (max - min); }

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;
if (navigator.getUserMedia) {
    navigator.getUserMedia({
            audio: true
        },
        function(stream) {
            audioContext = new AudioContext();
            let analyser = audioContext.createAnalyser();
            let microphone = audioContext.createMediaStreamSource(stream);
            let javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

            analyser.smoothingTimeConstant = 0.1;
            analyser.fftSize = 1024;

            microphone.connect(analyser);
            analyser.connect(javascriptNode);
            javascriptNode.connect(audioContext.destination);

            let canvasContext = document.querySelector("canvas").getContext("2d");

            canvasContext.moveTo(0, 250)

            let xPos = 0;
            let yOld = 0;

            javascriptNode.onaudioprocess = function() {
                let array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                let values = 0;

                let length = array.length;
                for (let i = 0; i < length; i++) {
                    values += (array[i]);
                }

                let average = -1 * ( (values / length) -150);

                console.log(average)

                canvasContext.beginPath();
                canvasContext.moveTo(xPos, yOld);
                canvasContext.lineTo(xPos++, average );
                yOld = average
                canvasContext.strokeStyle = '#ff0000';
                canvasContext.lineWidth = 2;

                canvasContext.stroke();
            }
        },
        function(err) {
            console.log("The following error occured: " + err.name)
        });
} else {
    console.log("getUserMedia not supported");
}