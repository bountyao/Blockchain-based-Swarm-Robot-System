# Blockchain-based-Swarm-Robot-System

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
