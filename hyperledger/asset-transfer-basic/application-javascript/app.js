/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');
const { channel } = require('diagnostics_channel');
const { Server } = require('http');

const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

// pre-requisites:
// - fabric-sample two organization test-network setup with two peers, ordering service,
//   and 2 certificate authorities
//         ===> from directory /fabric-samples/test-network
//         ./network.sh up createChannel -ca
// - Use any of the asset-transfer-basic chaincodes deployed on the channel "mychannel"
//   with the chaincode name of "basic". The following deploy command will package,
//   install, approve, and commit the javascript chaincode, all the actions it takes
//   to deploy a chaincode to a channel.
//         ===> from directory /fabric-samples/test-network
//         ./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript
// - Be sure that node.js is installed
//         ===> from directory /fabric-samples/asset-transfer-basic/application-javascript
//         node -v
// - npm installed code dependencies
//         ===> from directory /fabric-samples/asset-transfer-basic/application-javascript
//         npm install
// - to run this test application
//         ===> from directory /fabric-samples/asset-transfer-basic/application-javascript
//         node app.js

// NOTE: If you see  kind an error like these:
/*
	2020-08-07T20:23:17.590Z - error: [DiscoveryService]: send[mychannel] - Channel:mychannel received discovery error:access denied
	******** FAILED to run the application: Error: DiscoveryService: mychannel error: access denied

   OR

   Failed to register user : Error: fabric-ca request register failed with errors [[ { code: 20, message: 'Authentication failure' } ]]
   ******** FAILED to run the application: Error: Identity not found in wallet: appUser
*/
// Delete the /fabric-samples/asset-transfer-basic/application-javascript/wallet directory
// and retry this application.
//
// The certificate authority must have been restarted and the saved certificates for the
// admin and application user are not valid. Deleting the wallet store will force these to be reset
// with the new certificate authority.
//

async function maine() {
	try {
		// build an in memory object with the network configuration (also known as a connection profile)
		const ccp = buildCCPOrg1();

		// // build an instance of the fabric ca services client based on
		// // the information in the network configuration
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

		// // setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath);

		// // in a real application this would be done on an administrative flow, and only once
		// await enrollAdmin(caClient, wallet, mspOrg1);

		// // in a real application this would be done only when a new user was required to be added
		// // and would be part of an administrative flow
		// await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

		// Create a new gateway instance for interacting with the fabric network.
		// In a real application this would be done as the backend server session is setup for
		// a user that has been verified.
		const gateway = new Gateway();

		try {

			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: {
					enabled: true,
					asLocalhost: true,
					org1: {
						peers: ['peer1.org1.example.com'] // Specify the peer to connect to
					}
				}
			});

			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);


			// console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger');
			// await contract.submitTransaction('InitLedger');
			// console.log('*** Result: committed');

			// console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger');
			let result = await contract.evaluateTransaction('GetAllAssets');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

			// Now let's try to submit a transaction.
			// This will be sent to both peers and if both peers endorse the transaction, the endorsed proposal will be sent
			// to the orderer to be committed by each of the peer's to the channel ledger.
			// console.log('\n--> Submit Transaction: CreateAsset, creates new asset with ID, color, owner, size, and appraisedValue arguments');
			// let result = await contract.submitTransaction('CreateAsset', 'asset1112', 'blue', '10', 'TESTING123', '1300');
			//  console.log('*** Result: committed');
			// if (`${result}` !== '') {
			// 	console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			// }

			// console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID');
			// result = await contract.evaluateTransaction('ReadAsset', 'asset13');
			// console.log(`*** Result: ${prettyJSONString(result.toString())}`);

			// console.log('\n--> Evaluate Transaction: AssetExists, function returns "true" if an asset with given assetID exist');
			// result = await contract.evaluateTransaction('AssetExists', 'asset1');
			// console.log(`*** Result: ${prettyJSONString(result.toString())}`);

			// console.log('\n--> Submit Transaction: UpdateAsset asset1, change the appraisedValue to 350');
			// await contract.submitTransaction('UpdateAsset', 'asset1', 'blue', '5', 'Tomoko', '350');
			// console.log('*** Result: committed');

			// console.log('\n--> Evaluate Transaction: ReadAsset, function returns "asset1" attributes');
			// result = await contract.evaluateTransaction('ReadAsset', 'asset1');
			// console.log(`*** Result: ${prettyJSONString(result.toString())}`);

			// try {
			// 	// How about we try a transactions where the executing chaincode throws an error
			// 	// Notice how the submitTransaction will throw an error containing the error thrown by the chaincode
			// 	console.log('\n--> Submit Transaction: UpdateAsset asset70, asset70 does not exist and should return an error');
			// 	await contract.submitTransaction('UpdateAsset', 'asset70', 'blue', '5', 'Tomoko', '300');
			// 	console.log('******** FAILED to return an error');
			// } catch (error) {
			// 	console.log(`*** Successfully caught the error: \n    ${error}`);
			// }

			// console.log('\n--> Submit Transaction: TransferAsset asset1, transfer to new owner of Tom');
			// await contract.submitTransaction('TransferAsset', 'asset1', 'Tom');
			// console.log('*** Result: committed');

			// console.log('\n--> Evaluate Transaction: ReadAsset, function returns "asset1" attributes');
			// result = await contract.evaluateTransaction('ReadAsset', 'asset1');
			// console.log(`*** Result: ${prettyJSONString(result.toString())}`);
		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
}

const net = require('net');
const readline = require('readline');
const { getAssets, getAllPeers } = require('./api.js')

const server = net.createServer((socket) => {
	socket.on('data', (data) => {
		console.log(`Received data: ${data}`);
		// Here you can process the incoming data or send a response back to the client
	});

	socket.on('error', (err) => {
		console.error(`Socket error: ${err}`);
	});

	socket.on('end', () => {
		console.log('Socket connection ended');
	});
});


async function main() {
	server.listen(3000, () => {
		console.log('Server listening on port 3000');
	});

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	rl.on('line', (input) => {
		const [command, arg] = input.split(' ');

		switch (command) {
			case 'getAllAssets':
				getAssets(arg);
				break;

			case 'getAllPeers':
				getAllPeers();
				break;

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

