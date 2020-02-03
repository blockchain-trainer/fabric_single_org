# fabric_single_org

Get prerequisites from the prereq.sh script
The scripts in docker-compose up will get the hyperledger images

Check images/volumes/containers

list all the volumes - should only have key based names 
listing all containers - and should be empty

+++++++++++++++++++++++++++++++Check images+++++++++++++++++++++++++++++++++++++++++++
 


docker images 
docker volume ls  
docker ps -a   

+++++++++++++++++++++++++++++++Clean up+++++++++++++++++++++++++++++++++++++++++++


docker system prune
docker volume rm auomninet_orderer.auomni.com
docker volume rm auomninet_peer0.auomninet.auomni.com
rm -R channel-artifacts/
rm -R crypto-config/
mkdir channel-artifacts



+++++++++++++++++++++++++++++++Generate Crypto Material+++++++++++++++++++++++++++++++++++++++++++
 

../../fabric-samples/bin/cryptogen generate --config=./crypto-config.yaml
../../fabric-samples/bin/configtxgen -profile OrdererGenesis -outputBlock ./channel-artifacts/genesis.block

+++++++++++++++++++++++++++++++Generate Channel Material+++++++++++++++++++++++++++++++++++++++++++

echo COMPOSE_PROJECT_NAME=companyNamenet > .env
export CHANNEL_ONE_NAME=companyNamechannel
export CHANNEL_ONE_PROFILE=companyNamechannelProfile

../../fabric-samples/bin/configtxgen -profile ${CHANNEL_ONE_PROFILE} -outputCreateChannelTx ./channel-artifacts/${CHANNEL_ONE_NAME}.tx -channelID $CHANNEL_ONE_NAME
../../fabric-samples/bin/configtxgen -profile ${CHANNEL_ONE_PROFILE} -outputAnchorPeersUpdate ./channel-artifacts/auomniMSPanchors_${CHANNEL_ONE_NAME}.tx -channelID $CHANNEL_ONE_NAME -asOrg auomniMSP



+++++++++++++++++++++++++++++++Start Docker Hyperledger+++++++++++++++++++++++++++++++++++++++++++
export IMAGE_TAG=latest
docker-compose up

+++++++++++++++++++++++++++++++Start Docker CLI+++++++++++++++++++++++++++++++++++++++++++

docker exec -it cli bash 

export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/companyName.com/orderers/orderer.companyName.com/msp/tlscacerts/tlsca.companyName.com-cert.pem
peer channel create -o orderer.companyName.com:7050 -c auomnichannel -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/companyNamechannel.tx --tls --cafile $ORDERER_CA

peer channel join -b companyNamechannel.block --tls --cafile $ORDERER_CA

peer channel update -o orderer.companyName.com:7050 -c companyNamechannel -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/companyNameMSPanchors_companyNamechannel.tx --tls --cafile $ORDERER_CA
