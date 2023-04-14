export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export PATH=$PATH:$PWD/../bin



function setPeer(){
    if [ "$PEER_NUMBER" == "robot0" ] ; then
        export CORE_PEER_ADDRESS=localhost:7051
    elif [ "$PEER_NUMBER" == "robot1" ] ; then
        export CORE_PEER_ADDRESS=localhost:7052
    elif [ "$PEER_NUMBER" == "robot2" ] ; then
        export CORE_PEER_ADDRESS=localhost:7055
    else
        echo "Invalid robot ID. Setting as localhost:7051"
        PEER_NUMBER="robot0"
        export CORE_PEER_ADDRESS=localhost:7051
    fi
}

function getAllAssets() {
setPeer
echo "Getting ledger of $PEER_NUMBER, $CORE_PEER_ADDRESS"
peer chaincode query -C mychannel -n basic -c '{"Args":["GetAllAssets"]}' | jq .

}

function updateAsset() {
    setPeer
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n basic -c "{\"function\":\"UpdateAsset\",\"Args\":[\"$LANDMARK\", \"$POSITION_X\", \"$POSITION_Y\", \"$REPORTED_BY\"]}" 
}

function initAsset() {
    setPeer
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n basic -c "{\"function\":\"InitLedger\",\"Args\":[]}" 
}

function channelList() {
  setPeer
  peer channel list
}

function blockchainInfo() {
  setPeer
  peer channel getinfo -c mychannel 
}


if [[ $# -lt 1 ]] ; then
  exit 0
else
  MODE=$1
  shift
fi

while [[ $# -ge 1 ]] ; do
  key="$1"
  case $key in
  -peer )
    PEER_NUMBER=$2
    shift
    ;;
  -landmark )
    LANDMARK="$2"
    shift
    ;;
  -posx )
    POSITION_X="$2"
    shift
    ;;
  -posy )
    POSITION_Y="$2"
    shift
    ;;
  -reportedby )
    REPORTED_BY="$2"
    shift
    ;;
  * )
    echo "Unknown flag: $key"
    exit 1
    ;;
  esac
  shift
done

if [ "$MODE" == "getAssets" ]; then
    getAllAssets
elif [ "$MODE" == "updateAsset" ]; then
    updateAsset
elif [ "$MODE" == "initAsset" ]; then
    initAsset
elif [ "$MODE" == "channelList" ]; then
    channelList
elif [ "$MODE" == "blockchainInfo" ]; then
    blockchainInfo
else
    exit 1
fi