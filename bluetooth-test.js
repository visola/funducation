const noble = require('@abandonware/noble');

const deviceName = 'SquarePanda_94CD';
const serviceId = 'af52f0030aed11e5a6c01697f925ec7b';

console.log('Noble loaded.');

noble.on('stateChange', async (state) => {
	console.log(state);
	if (state === 'poweredOn') {
		await noble.startScanningAsync();
	}
});

noble.on('scanStart', function() {
	console.log('Scan starting...');
});

noble.on('discover', async function(peripheral) {
	if (peripheral.advertisement.localName == deviceName) {
		await noble.stopScanningAsync();
		
		peripheral.once('connect', async function () {
			console.log(arguments);
			console.log('Connected!');
			
			const {characteristics} = await peripheral.discoverSomeServicesAndCharacteristicsAsync(['180f'], ['2a19']);
			const batteryLevel = (await characteristics[0].readAsync())[0];
			console.log(`${peripheral.address} (${peripheral.advertisement.localName}): ${batteryLevel}%`);
			
			peripheral.discoverAllServicesAndCharacteristics(function (error, services, characteristics) {
				if (error) {
					console.error('Error while connecting to peripheral...');
					console.error(error);
					return;
				}
				
				console.log('Services:');
				services.forEach((service) => {
					console.log('------');
					console.log(`  - ${service.uuid} - '${service.name}' (${service.type})`);
					if (service.characteristics.length > 0) {
						console.log('    Characteristics:');
						service.characteristics.forEach((c) => {
							console.log(`      - ${c.uuid} - '${c.name}' (${c.type}): ${c.properties}`);
						});
					}
				});
			});
		});
		
		peripheral.connect(function(error) {
			if (error) {
				console.error('Error while connecting to peripheral...');
				console.error(error);
			}
		});
	}
});


