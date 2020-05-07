const {ipcRenderer} = require('electron');

const API_KEY = ipcRenderer.sendSync('synchronous-message', 'GOOGLE_API_KEY');
const URL = `https://texttospeech.googleapis.com/v1/text:synthesize?alt=json&key=${API_KEY}`;

const data = (text) => ({
  input: {text},
  audioConfig: {
    audioEncoding:"LINEAR16",
    sampleRateHertz: 44100,
  },
  voice: {
    languageCode:"en-US",
    name: "en-US-Wavenet-F",
    ssmlGender:"FEMALE"
  }
});

function playWave(byteArray) {
  var audioCtx = new window.AudioContext({sampleRate: 44100});
  var myAudioBuffer = audioCtx.createBuffer(1, byteArray.length, audioCtx.sampleRate);
  
  var nowBuffering = myAudioBuffer.getChannelData(0);
  for (var i = 0; i < byteArray.length; i++) {
    var byteA = byteArray[i * 2];
    var byteB = byteArray[i * 2 + 1];
    
    var result = (((byteB & 0xFF) << 8) | (byteA & 0xFF));
    var sign = byteB & (1 << 7);
    var x = ((byteB & 0xFF) << 8 | (byteA & 0xFF));
    
    if (sign) result = 0xFFFF0000 | x;
    nowBuffering[i] = ((result + 32768) % 65536 - 32768) / 32768.0;
  }

  var source = audioCtx.createBufferSource();
  source.buffer = myAudioBuffer;
  source.connect(audioCtx.destination);
  source.start();
  return new Promise((resolve) => {
    source.addEventListener('ended', () => {
      resolve();
    });
  });
}

function speak(text) {
  return fetch(URL, {
    body: JSON.stringify(data(text)),
    method: 'POST',
  }).then((response) => response.json())
  .then((data) => playWave(toBytes(data.audioContent)));
}

function toBytes(base64Encoded) {
  const byteChars = atob(base64Encoded);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }

  return byteNumbers;
}

module.exports = {
  speak,
}
