color black;
color gray;
color yellow;

// typeface is Mattone by Nunzio Mazzaferro
// available at http://collletttivo.it/
// Collletttivo designs and distributes free open source typefaces
// retrieved on 2022-08-27
PFont mattone32;
PFont mattone16;

int textSizeParagraph = 16;
int textSizeTitle = 30;

int paddingXPercentage = 5;
int paddingX = 0;

int paddingYPercentage = 6;
int paddingY = 0;

// ControlP5 instance
ControlP5 cp5;

// setup functions

void setupText() {
  mattone32 = loadFont("Mattone-150-32.vlw");
  mattone16 = loadFont("Mattone-150-16.vlw");
  textAlign(LEFT, CENTER);
  paddingX = paddingXPercentage * width/100;
  paddingY = paddingYPercentage * height/100;
}

void setupColors() {
  black = color(255*1/8);
  gray = color(255*6/8);
  yellow = color(255, 255, 255*2/8);
}

void setupControlP5() {
  
  cp5 = new ControlP5(this);
  
  // retrieve portList
  List portsList = Arrays.asList(portsArray);

  // add a scrollable list
  cp5.addScrollableList("selectPort")
    .setPosition(paddingX, 52*height/100)
    .setSize(200, 100)
    .setBarHeight(20)
    .setItemHeight(10)
    .addItems(portsList);
}

void drawText() {

  fill(yellow);
  textFont(mattone32);
  textSize(textSizeTitle);
  text("p5_serialserver " + versionNumber, paddingX, 1 * paddingY);
  text("since 2015 at NYU ITP", paddingX, 2 * paddingY);

  fill(yellow);
  textFont(mattone32);
  textSize(textSizeTitle);
  text("info internet", paddingX, 4 * paddingY);

  fill(gray);
  textFont(mattone16);
  textSize(textSizeParagraph);
  text("your local IP address is: " + localIP, paddingX, 5 * paddingY);
  text("your websocket port is: " + serverPort, paddingX, 6 * paddingY);

  fill(yellow);
  textFont(mattone32);
  textSize(textSizeTitle);
  text("info serial", paddingX, 8 * paddingY);

  fill(gray);
  textFont(mattone16);
  textSize(textSizeParagraph);
  text("current port: " + portName, paddingX, 10 * paddingY);
  text("port status: " + portStatus, paddingX, 11 * paddingY);
}

void drawBackground() {
  background(black);
}
