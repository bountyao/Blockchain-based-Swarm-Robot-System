const { exec } = require('child_process');
const net = require('net');
const readline = require('readline');

const server = net.createServer((socket) => { // Creating a TCP server
	let canRead = true;

	socket.on('data', (data) => { // Listening for incoming data from the client
		if (canRead) {
			canRead = false;

			if (data) {
				try {
					// Splitting the received data into individual variables using destructuring
					const [bufferStart, landmark, posX, posY, id, bufferEnd] = data.toString('utf-8').split(",");

					if (typeof landmark !== 'undefined' && typeof posX !== 'undefined' && typeof posY !== 'undefined' && typeof id !== 'undefined') {
						// Call interface.sh command to update peer corresponding to the robot's ID
						const command = `bash ./interface.sh updateAsset -peer ${id} -landmark "${landmark}" -posx ${posX} -posy ${posY} -reportedby ${id}`;
						exec(command, (error, stdout, stderr) => {
							if (error) {
								console.error(`exec error: ${error}`);
							}
							console.log(`stdout: ${stdout}`);
							console.error(`stderr: ${stderr}`);
						});

					}
				} catch {
				}
			}

			setTimeout(() => {
				canRead = true;
			}, 3000); // 3 seconds delay before allowing reading again
		}
	});
});


async function main() {
	server.listen(1234, () => { // Start the TCP server and listen on port 1234
		console.log('Server listening on port 1234');
	});

	const rl = readline.createInterface({ // CMD interface for reading user input
		input: process.stdin,
		output: process.stdout
	});

	rl.on('line', (input) => { // Listen for user input
		const [command] = input.split(' ');

		switch (command) {
			case 'exit':
				console.log('Exiting application...');
				rl.close();
				process.exit();

			default:
				console.log("Invalid command");
		}
	});
}


main(); // Call the main function to start the server and listen for user input
