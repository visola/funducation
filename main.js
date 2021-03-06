const { app, BrowserWindow, ipcMain } = require('electron');

if (!process.env.GOOGLE_API_KEY) {
	console.log('Missing API key for Google Account. Please set environment variable as:');
	console.log('export GOOGLE_API_KEY={API_KEY}');
	app.quit();
}

function createWindow () {
	let win = new BrowserWindow({
		height: 600,
		width: 800,
		webPreferences: {
            nodeIntegration: true
        }
	});
	//win.setFullScreen(true);
	win.loadFile('index.html');
}

app.commandLine.appendSwitch('enable-speech-dispatcher');
app.whenReady().then(createWindow);

ipcMain.on('synchronous-message', (event, arg) => {
   console.log(arg) 
   event.returnValue = process.env.GOOGLE_API_KEY;
});
