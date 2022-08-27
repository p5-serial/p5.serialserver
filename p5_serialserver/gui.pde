color black;
color gray;
color yellow;

int textSizeParagraph = 20;
int textSizeTitle = 25;

int paddingXPercentage = 5;
int paddingX = 0;

int paddingYPercentage = 6;
int paddingY = 0;

void setupText() {
  textAlign(LEFT, CENTER);
  paddingX = paddingXPercentage * width/100;
  paddingY = paddingYPercentage * height/100;
}

void drawText() {

  fill(yellow);
  textSize(textSizeTitle);
  text("p5_serialserver " + versionNumber, paddingX, 1 * paddingY);
  text("since 2015 at NYU ITP", paddingX, 2 * paddingY);


  fill(yellow);
  textSize(textSizeTitle);
  text("info", paddingX, 4 * paddingY);

  fill(gray);
  textSize(textSizeParagraph);
  text("your public IP address is: ", paddingX, 5 * paddingY);
  text("available ports list: ", paddingX, 6 * paddingY);

  fill(yellow);
  textSize(textSizeTitle);
  text("connect", paddingX, 8 * paddingY);

  fill(gray);
  textSize(textSizeParagraph);
  text("select port", paddingX, 9 * paddingY);
}

void setupColors() {
  black = color(255*1/8);
  gray = color(255*6/8);
  yellow = color(255, 255, 255*2/8);
}

void drawBackground() {
  background(black);
}
