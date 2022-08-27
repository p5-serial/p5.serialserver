color yellow;

void setupText() {
  textAlign(LEFT, CENTER);
  textSize(20);
  fill(0);
}

void drawText() {
  
  text("p5.serialserver", 5 * width/100, 5 * height/100);
  text("since 2015 at NYU ITP", 5 * width/100, 10 * height/100);
}

void setupBackground() {
  yellow = color(255, 255, 0);
}

void drawBackground() {
  background(yellow);
}
