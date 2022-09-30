String[] portsArray;

int baudRate = 9600;

Serial port;
int portNumber = 2;
String portName;

String portStatus = "";

int value;

void selectPort(int n) {
  portName = portsArray[n];
  port = new Serial(this, portName, baudRate);
  portStatus = "open";
}

int getBaudRate() {
  return baudRate;
}

void setBaudRate(int newBaudRate) {
  baudRate = newBaudRate;
}

// function to print serial port list
void printSerialList() {
  portsArray = new String[Serial.list().length];
  for (int i = 0; i < Serial.list().length; i++) {
    portsArray[i] = Serial.list()[i];
  }

  printArray(portsArray);
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
    println(value);
  }
  
}
