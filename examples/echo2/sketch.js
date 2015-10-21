/*
  Test this with the Arduino sketch echo.ino, in the p5.serialport
  examples/echo directory.
  
  Try at varying baudrates, up to 115200 (make sure to change
  Arduino to matching baud rate)
*/

var serial; // variable to hold an instance of the serialport library
var portName = '/dev/cu.usbmodem141431'; // fill in your serial port name here
var inData; // for incoming serial data
var inByte;
var byteCount = 0;
var output = 0;
var options = {
  baudrate: 9600
};

function setup() {
  createCanvas(400, 300);
  serial = new p5.SerialPort(); // make a new instance of the serialport library
  serial.on('data', serialEvent); // callback for when new data arrives
  serial.on('error', serialError); // callback for errors

  serial.open(portName, options); // open a serial port
  serial.clear();
}

function draw() {
  // black background, white text:
  background(0);
  fill(255);
  // display the incoming serial data as a string:
  text("type any key to begin sending.", 30, 30);
  var displayString = "inByte: " + inByte + "\t Byte count: " + byteCount;

  text(displayString, 30, 60);
}

function keyPressed() {
  serial.write(output);
}


function serialEvent() {
  // read a byte from the serial port:
  inByte = int(serial.read());
  if (inByte !== output) {
    println("Error: received " + inByte + " but sent " + output);
    println("byte count: " + byteCount);
  }
  byteCount++;
  output = (inByte + 1) % 256; // modulo 256 to keep value 0-255
  serial.write(output);
}

function serialError(err) {
  println('Something went wrong with the serial port. ' + err);
}