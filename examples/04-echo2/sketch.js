/*
  Test this with the Arduino sketch echo.ino, in the p5.serialport
  examples/echo directory.
  
  Try at varying baudrates, up to 115200 (make sure to change
  Arduino to matching baud rate)
*/

let serial; // variable to hold an instance of the serialport library
let portName = '/dev/tty.usbmodem14501'; // fill in your serial port name here
let inData; // for incoming serial data
let inByte;
let byteCount = 0;
let output = 0;
let options = {
  baudRate: 9600
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
  let displayString = "inByte: " + inByte + "\t Byte count: " + byteCount;

  text(displayString, 30, 60);
}

function keyPressed() {
  serial.write(output);
}


function serialEvent() {
  // read a byte from the serial port:
  inByte = int(serial.read());
  if (inByte !== output) {
    print("Error: received " + inByte + " but sent " + output);
    print("byte count: " + byteCount);
  }
  byteCount++;
  output = (inByte + 1) % 256; // modulo 256 to keep value 0-255
  serial.write(output);
}

function serialError(err) {
  print('Something went wrong with the serial port. ' + err);
}