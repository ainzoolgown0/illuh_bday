const startButton = document.getElementById('startButton');
const flame = document.getElementById('flame');
const birthdayMessage = document.getElementById('birthdayMessage');
const loveMessage = document.getElementById('loveMessage');

let audioContext;
let analyser;
let microphone;
let javascriptNode;

startButton.addEventListener('click', toggleCandle);

function toggleCandle() {
    if (flame.classList.contains('hidden')) {
        flame.classList.remove('hidden');
        hideMessages();
        startListening();
    } else {
        stopListening();
        flame.classList.add('hidden');
    }
}

function startListening() {
    if (audioContext) {
        return; // already listening
    }

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);
        javascriptNode.onaudioprocess = () => {
            const array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            const average = array.reduce((a, b) => a + b, 0) / array.length;

            if (average > 50) { // Adjust the threshold as needed
                flame.classList.add('hidden');
                showMessages();
                stopListening();
            }
        };
    }).catch(err => {
        console.error('Error accessing the microphone', err);
    });
}

function stopListening() {
    if (audioContext) {
        audioContext.close().then(() => {
            audioContext = null;
            analyser = null;
            microphone = null;
            javascriptNode = null;
        });
    }
}

function showMessages() {
    birthdayMessage.classList.add('show');
    loveMessage.classList.add('show');
}

function hideMessages() {
    birthdayMessage.classList.remove('show');
    loveMessage.classList.remove('show');
}
