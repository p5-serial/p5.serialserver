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

void setupText() {
  mattone32 = createFont("Mattone-150-32.vlw", 32);
  mattone16 = createFont("Mattone-150-16.vlw", 16);
  textAlign(LEFT, CENTER);
  paddingX = paddingXPercentage * width/100;
  paddingY = paddingYPercentage * height/100;
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
  text("your public IP address is: ", paddingX, 5 * paddingY);
  text("your websocket port is: " + serverPort, paddingX,  6 * paddingY);
  
  fill(yellow);
  textFont(mattone32);
  textSize(textSizeTitle);
  text("info serial", paddingX, 8 * paddingY);
  
  fill(gray);
  textFont(mattone16);
  textSize(textSizeParagraph);
  text("select port", paddingX, 9 * paddingY);
  text("available ports list: ", paddingX, 10 * paddingY);
}

void setupColors() {
  black = color(255*1/8);
  gray = color(255*6/8);
  yellow = color(255, 255, 255*2/8);
}

void drawBackground() {
  background(black);
}
