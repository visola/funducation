const opencv = require('../opencv');

function handleCaptureImage(_, response) {
  response.set('Content-Type', 'image/bmp');
  response.send(opencv.toBuffer(opencv.capture()));
};

function handleContours(_, response) {
  response.set('Content-Type', 'application/json');
  response.send(JSON.stringify(opencv.contours.map((c) => c.boundingRect())));
};

function handleCrop(request, response) {
  response.set('Content-Type', 'image/bmp');
  const { x, y, width, height } = request.query;
  const cropped = opencv.crop(parseInt(x, 10), parseInt(y, 10), parseInt(width, 10), parseInt(height, 10));
  response.send(opencv.toBuffer(cropped));
}

function handleVideoFeed(_, response) {
  response.set('Content-Type', 'multipart/x-mixed-replace; boundary=frame');
  const sendNextFrame = () => {
    response.write(`--frame\nContent-Type: image/bmp\n\n`);
    response.write(opencv.toBuffer(opencv.lastFrame));
  };
  const timer = setInterval(sendNextFrame, 250);
  response.addListener('close', () => {
    clearInterval(timer);
  })
}

module.exports = {
  setup(app) {
    app.get('/capture', handleCaptureImage);
    app.get('/contours', handleContours);
    app.get('/crop', handleCrop);
    app.get('/video', handleVideoFeed);
  },
};
