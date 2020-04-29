var spawn = require('child_process').spawn;
var http = require('http');
const Jimp = require('jimp');

var http = require("http");

var server = http.createServer(function(request, response) {
  if (request.path == '/') {
    response.writeHead(404);
    return;
  }

  const start = Date.now();
  let local = Date.now();
  const child = spawn('raspistill', ['-t', '1','-o', '-']);
  console.log(`Spawn: ${Date.now() - start}ms, ${Date.now() - local}ms`);
  local = Date.now();

  const data = [];
  child.stdout.on('data', (d) => data.push(...d));
  child.on('exit', () => {
    console.log(`Photo: ${Date.now() - start}ms, ${Date.now() - local}ms`);
    local = Date.now();

    const buffer = Buffer.from(data);
    console.log(`Buffer: ${Date.now() - start}ms, ${Date.now() - local}ms`);
    local = Date.now();

    Jimp.read(buffer)
      .then((image) => {
        console.log(`Jimp read: ${Date.now() - start}ms, ${Date.now() - local}ms`);
        local = Date.now();
        image.posterize(10);

        console.log(`Jimp contrast: ${Date.now() - start}ms, ${Date.now() - local}ms`);
        local = Date.now();
        return image.getBufferAsync(Jimp.MIME_BMP);
      }).then((buffer) => {
        console.log(`Jimp buffer: ${Date.now() - start}m, ${Date.now() - local}ms`);
        local = Date.now();

        response.writeHead(200, { 'Content-type': Jimp.MIME_BMP });
        response.write(buffer);
        response.end();
        console.log(`End: ${Date.now() - start}ms, ${Date.now() - local}ms`);
      });
  });

});

server.listen(8080);
console.log("Server is listening on port 8080");

