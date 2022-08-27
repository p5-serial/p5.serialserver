int now;
int deltaTime = 5000;

void setup() {

  // create canvas
  size(500, 500);

  printSerialList();

  portName = Serial.list()[portNumber];

  port = new Serial(this, portName, baudRate);

  server = new WebsocketServer(this, serverPort, "/");

  setupColors();
  setupText();
  setupControlP5();
  
  findLocalIP();
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
