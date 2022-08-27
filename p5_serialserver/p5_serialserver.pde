// import Processing Serial library
import processing.serial.*;
// import Websockets library
import websockets.*;

int value;

int now;
int deltaTime = 5000;

void setup() {
  
  // create canvas
  size(500, 500);
  
  // setup text
  setupText();
  
  printSerialList();
  

  portName = Serial.list()[portNumber];

  port = new Serial(this, portName, baudRate);

  server = new WebsocketServer(this, serverPort, "/");
}

void draw () {

  background(0);

  drawText();

  if (port.available() > 0) {
    value = port.read();
  }

  if (millis() > now + deltaTime ) {
    server.sendMessage("0");
    now = millis();
  }
}


void websocketServerEvent(String msg) {
  println(msg);
}
