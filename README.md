# Blockchain-based-Swarm-Robot-System
This project presents a proof-of-concept blockchain-based swarm robot system designed to enhance the security of robot swarms using blockchain technology. The system is composed of three modules: ARGoS3, an open-source simulator capable of simulating large-scale robot swarms; an ARGoS3-to-Blockchain interface responsible for linking the simulation with the blockchain network, and Hyperledger Fabric, a blockchain framework utilized to create a permissioned and private blockchain network.

In the implementation, each robot functions as a blockchain peer, maintaining a synchronized record of sensor data and historical transactions across the entire swarm network. As the simulation begins, each robot collects readings from its environment. At fixed intervals, these sensor readings are propagated and securely stored within the blockchain network. During the simulation, robots navigate and detect landmarks on the map, and once detected, the coordinates are shared across the blockchain network. 

# Setup
Clone the repository with the following command.
```
git clone https://github.com/CzarCerro/Blockchain-based-Swarm-Robot-System
```

Ensure that the Docker daemon on the Linux environment is running by executing the given command.
```
sudo dockerd
```

Initialize the Hyperledger Fabric network by running the following command. This command only needs to be executed once.
```
bash ./scripts/init.sh
```

The following command starts up the network. However, this command should only be executed if you have already run `bash ./scripts/init.sh` beforehand.
```
bash ./scripts/startup.sh
```

Next, start the ARGoS3-to-Blockchain interface by running the following command.
```
bash ./scripts/server.sh
```

Lastly, start the simulation by running the following command.
```
bash ./scripts/simulation.sh
```

The following command retrieves all information across all peers.
```
bash ./scripts/getassets.sh
```

The following command dismantles the entire Hyperledger Fabric network and deletes all Docker peers.
```
bash ./scripts/teardown.sh
```
