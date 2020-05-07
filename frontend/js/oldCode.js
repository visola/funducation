const {ipcRenderer} = require('electron');

const apiKey = ipcRenderer.sendSync('synchronous-message', 'GOOGLE_API_KEY');

const buttonEl = document.querySelector('#speak');
const selectEl = document.querySelector('select');
const textEl = document.querySelector('#text');

function toBytes(base64Encoded) {
  const byteChars = atob(base64Encoded);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  
  var byteArray = new Uint8Array(byteNumbers);
  
  return byteNumbers;
}

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
}

const data = {
  input: {
    text: "This is a pen"
  },
  audioConfig: {
    audioEncoding:"LINEAR16",
    sampleRateHertz: 44100,
  },
  voice: {
    languageCode:"en-US",
    name: "en-US-Wavenet-F",
    ssmlGender:"FEMALE"
  }
};

buttonEl.addEventListener('click', function () {
  data.input.text = textEl.value;
  data.voice.name = selectEl.value;
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?alt=json&key=${apiKey}`;
  fetch(url, {
    body: JSON.stringify(data),
    method: 'POST',
  }).then((response) => response.json())
  .then((data) => {
    playWave(toBytes(data.audioContent));
  });
});

fetch(`https://texttospeech.googleapis.com/v1/voices?alt=json&key=${apiKey}&languageCode=en-US`)
  .then((response) => response.json())
  .then(({voices}) => {
    voices.filter((voice) => voice.languageCodes.indexOf('en-US') >= 0).forEach((voice) => {
      const optionEl = document.createElement('option');
      optionEl.innerText = voice.name;
      optionEl.setAttribute('value', voice.name);
      if (voice.name == data.voice.name) {
        optionEl.setAttribute('selected', 'selected');
      }
      selectEl.appendChild(optionEl);
    });
  });