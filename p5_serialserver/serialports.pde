String[] portList;

int baudRate = 9600;

Serial port;
int portNumber = 2;
String portName;


int getBaudRate() {
  return baudRate;
}

void setBaudRate(int newBaudRate) {
  baudRate = newBaudRate;
}

// function to print serial port list
void printSerialList() {
  portList = new String[Serial.list().length];
  for (int i = 0; i < Serial.list().length; i++) {
    portList[i] = Serial.list()[i];
  }

  printArray(portList);
}

int getPortNumber() {
  return portNumber;
}

void setPortNumber(int  newPortNumber) {
  portNumber = newPortNumber;
}

void portRead() {
  if (port.available() > 0) {
    value = port.read();
  }
}
