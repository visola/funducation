var fs = require('fs');
var execSync = require('child_process').execSync;
var http = require("http");
const fileName = 'photo.jpg';

var server = http.createServer(function(request, response) {
  // raspistill -t 1 -o photo.jpg
  var child = execSync('raspistill -t 1 -o '+ fileName);
//  child.stdout.pipe(process.stdout);
 // child.stderr.pipe(process.stderr);
  response.writeHead(200, { 'Content-type': 'image/jpeg' });
  fs.createReadStream(fileName).pipe(response);
});

server.listen(8080);
console.log("Server is listening on port 8080");

