const { exec } = require('child_process');

const net = require('net');
const readline = require('readline');

const server = net.createServer((socket) => {
	let canRead = true;
  
	socket.on('data', (data) => {
	  if (canRead) {
		canRead = false;
  
		if (data) {
		  try {
			const [bufferStart, landmark, posX, posY, id, bufferEnd] = data.toString('utf-8').split(",");
			
			if (typeof landmark !== 'undefined' && typeof posX !== 'undefined' && typeof posY !== 'undefined' && typeof id !== 'undefined') {
			  const command = `cd .. && bash ./test.sh updateAsset -peer ${id} -landmark "${landmark}" -posx ${posX} -posy ${posY} -reportedby ${id}`;
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
		}, 3000); // 3 seconds delay
	  }
	});
  });
  

async function main() {
	server.listen(1234, () => {
		console.log('Server listening on port 1234');
	});

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	rl.on('line', (input) => {
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


main();
