/*
  2 serial port test. Put the Arduino analogReadSerial sketch
  on two Arduinos and connect them to your computer using 2
  USB ports. Note the port names and change firstPort and
  secondPort below to match. Then run this sketch. You should see
  data coming in from both ports independently.
  
*/

let serial1 = new p5.SerialPort();
let serial2 = new p5.SerialPort();
let firstPort = "/dev/cu.usbmodem14111";
let secondPort = "/dev/cu.usbmodem141431";
let input1 = "";
let input2 = "";

function setup() {
  createCanvas(400, 300);
  serial1.on("data", serialEvent);
  serial1.on("error", serialError);
  serial2.on("data", serial2Event);
  serial2.on("error", serial2Error);

  serial1.open(firstPort);
  serial2.open(secondPort);
}

function draw() {
  background(0x23, 0x76, 0xf3);
  fill(255);
  text("data from serial port 1:" + input1, 30, 30);
  text("data from serial port 2: " + input2, 30, 90);
}

function serialEvent() {
  data = serial1.readStringUntil("\r\n");
  if (data.length > 0) {
    input1 = data;
  }
}

function serialError(err) {
  println("error with serial port 1: " + err);
}

function serial2Event() {
  var data = serial2.readStringUntil("\r\n");
  if (data.length > 0) {
    input2 = data;
  }
}

function serial2Error(err) {
  println("error with serial port 2: " + err);
}
