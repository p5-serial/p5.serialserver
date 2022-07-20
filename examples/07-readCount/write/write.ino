void setup() {
  Serial.begin(9600);
}

void loop() {
  for (int inByte = 0; inByte < 256; inByte++) {
    Serial.write(inByte);
  }
}
