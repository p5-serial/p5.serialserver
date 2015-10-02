/*
Serial write example

Sends a byte to a webSocket server which sends the same byte
out through a serial port.

You can use this with the included Arduino example called PhysicalPixel.
Works with P5 editor as the socket/serial server, version 0.5.5 or later.

written 2 Oct 2015
by Tom Igoe
*/

// Declare a "SerialPort" object
var serial;
// fill in the name of your serial port here:
var portName = "/dev/cu.usbmodem1411";
// this is the message that will be sent to the Arduino:
var outMessage = 'H';

function setup() {
  createCanvas(windowWidth, windowHeight);

  // make an instance of the SerialPort object
  serial = new p5.SerialPort();

  // Get a list the ports available
  // You should have a callback defined to see the results. See gotList, below:
  serial.list();

  // Assuming our Arduino is connected,  open the connection to it
  serial.open(portName);

  // When you get a list of serial ports that are available
  serial.on('list', gotList);

  // When you some data from the serial port
  serial.on('data', gotData);
}


// Got the list of ports
function gotList(thelist) {
  println("List of Serial Ports:");
  // theList is an array of their names
  for (var i = 0; i < thelist.length; i++) {
    // Display in the console
    println(i + " " + thelist[i]);
  }
}

// Called when there is data available from the serial port
function gotData() {
  var currentString = serial.readLine();
  console.log(currentString);
}

function draw() {
  background(255,255,255);
  fill(0,0,0);
  text("click to change the LED", 10, 10);
}
// When you click on the screen, the server sends H or L out the serial port
function mouseReleased() {
  serial.write(outMessage);
  if (outMessage === 'H') {
    outMessage = 'L';
  } else {
    outMessage = 'H';
  }
}
