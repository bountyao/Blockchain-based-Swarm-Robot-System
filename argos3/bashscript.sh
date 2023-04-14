rm -r build
mkdir build
cd build
cmake ..
make
cd ..
sudo argos3 -c experiments/locate_landmark.argos