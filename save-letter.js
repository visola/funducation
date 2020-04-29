const readline = require("readline");
const cv = require('opencv4nodejs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('What letter are you taking a picture of? ', function(letter) {
  console.log('Capturing image...');
  const capture = new cv.VideoCapture(0);
  const frame = capture.read();

  const detector = new cv.ORBDetector();

  console.log('Detecting key points and computing description...');
  const keyPoints = detector.detect(frame);
  const description = detector.compute(frame, keyPoints);

  console.log('Saving...');
  cv.imwrite(`keyPoints/${letter}.jpg`, frame);
  cv.imwrite(`keyPoints/${letter}_kp.jpg`, description);

  process.exit();
});
