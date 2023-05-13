const path = require('path');

const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');
const { Gateway, Wallets } = require('fabric-network');
const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

exports.getAssets = async function(peerNumber) {
	if (peerNumber === undefined)
	{
		peerNumber = 0;
	}

	console.log(`connect to peer${peerNumber}.org1.example.com`)

	try {
		const ccp = buildCCPOrg1();
		const wallet = await buildWallet(Wallets, walletPath);
		const gateway = new Gateway();
		try {
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: {
					enabled: true,
					asLocalhost: false,
					org1: {
						//peers: [`peer${peerNumber}.org1.example.com`] 
						peers: [`peer${peerNumber}.org1.example.com`] 
					}
				}
			});

			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);
			let result = await contract.evaluateTransaction('GetAllAssets');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

		} finally {
			console.log('disconnecting');
			gateway.disconnect();
		}

	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
}


exports.getAllPeers = async function() {

	try {
		const ccp = buildCCPOrg1();
		const wallet = await buildWallet(Wallets, walletPath);
		const gateway = new Gateway();
		try {
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: {
					enabled: true,
					asLocalhost: true
				}
			});

			const network = await gateway.getNetwork(channelName);
			const channel = network.getChannel();
			const endorsers = channel.getEndorsers(mspOrg1);
			console.log(`All Endorsers for ${mspOrg1}: ${JSON.stringify(endorsers)}`);

		} finally {
			gateway.disconnect();
		}

	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
}