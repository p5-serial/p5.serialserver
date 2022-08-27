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
  
  setupColors();
  setupText();
  
  printSerialList();

  portName = Serial.list()[portNumber];

  port = new Serial(this, portName, baudRate);

  server = new WebsocketServer(this, serverPort, "/");
}

void draw () {
  
  drawBackground();
  drawText();
  
  portRead();

  if (millis() > now + deltaTime ) {
    server.sendMessage("0");
    now = millis();
  }
}
