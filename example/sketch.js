// Declare a "SerialPort" object
var serial;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Instantiate our SerialPort object
  serial = new p5.SerialPort();

  // Assuming our Arduino is connected, let's open the connection to it
  // Change this to the name of your arduino's serial port
  serial.open("/dev/cu.usbmodem1421");

  // Here are the callbacks that you can register

  // When we connect to the underlying server
  serial.on('connected', serverConnected);

  // When we get a list of serial ports that are available
  serial.on('list', gotList);

  // When we some data from the serial port
  serial.on('data', gotData);

  // When or if we get an error
  serial.on('error', gotError);

  // When our serial port is opened and ready for read/write
  serial.on('open', gotOpen);

  // Callback to get the raw data, as it comes in for handling yourself
  //serial.on('rawdata', gotRawData);
}

// We are connected and ready to go
function serverConnected() {
  // Let's list the ports available
  serial.list();
}

// Got the list of ports
function gotList(thelist) {
  // theList is an array of their names
  for (var i = 0; i < thelist.length; i++) {
    // Display in the console
    println(i + " " + thelist[i]);
  }
}

// Connected to our serial device
function gotOpen() {
  println("Serial Port is Open!");
}

// Ut oh, here is an error, let's log it
function gotError(theerror) {
  println(theerror);
}

// There is data available to work with from the serial port
function gotData() {
	// Callback method
  //while(serial.available() > 0) {
    var currentString = serial.readStringUntil("\r\n");
    //var currentString = serial.readString();
    //console.log(currentString);
    //var currentString = serial.readBytesUntil('\n');
    //var currentString = serial.read();
    console.log(currentString);
  //}
}

// We got raw from the serial port
function gotRawData(thedata) {
  println("gotRawData" + thedata);
}

// Methods available
// serial.read() returns a single byte of data (first in the buffer)
// serial.readChar() returns a single char 'A', 'a'
// serial.readBytes() returns all of the data available as an array of bytes
// serial.readBytesUntil('\n') returns all of the data available until a '\n' (line break) is encountered
// serial.readString() retunrs all of the data available as a string
// serial.readStringUntil('\n') returns all of the data available as a tring until a (line break) is encountered
// serial.last() returns the last byte of data from the buffer
// serial.lastChar() returns the last byte of data from the buffer as a char
// serial.clear() clears the underlying serial buffer
// serial.available() returns the number of bytes available in the buffer


// Here is a silly test suite
/*
var counter = 0;
function mousePressed() {
  counter++;
  var mod = counter%9;
  console.log(serial.available() + " bytes avialable");
  var somedata = "";
  if (mod == 0) {
    console.log("read");
    somedata = serial.read();
  } else if (mod == 1) {
    console.log("readChar");
    somedata = serial.readChar();
  } else if (mod == 2) {
    console.log("readBytes");
    somedata = serial.readBytes();
  } else if (mod == 3) {
    console.log("readBytesUntil");
    somedata = serial.readBytesUntil('\n');
  } else if (mod == 4) {    
    console.log("readString");
    somedata = serial.readString();
  } else if (mod == 5) {
    console.log("readStringUntil");
    somedata = serial.readStringUntil(',');
  } else if (mod == 6) {
    console.log("last");
    somedata = serial.last();
  } else if (mod == 7) {
    console.log("lastChar");
    somedata = serial.lastChar();
  } else if (mod == 8) {
    console.log("clear");
    somedata = serial.clear();
  }
  console.log(somedata);
  console.log(serial.available() + " bytes avialable");
}
*/

function draw() {
  if (serial.isConnected()) {
    background(0,0,255);
  } else {
    background(255,0,0);
  }
  // Polling method
  /*
  while (serial.available() > 0) {
    var data = serial.read();
    ellipse(50,50,data,data);
  }
  */
}