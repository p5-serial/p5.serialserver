p5.serialport 

A [p5.js](http://p5js.org/) library that more or less clones the [Processing Serial Library API](https://processing.org/reference/libraries/serial/index.html).  As JavaScript in a browser can not interact directly with a serial port, it includes a simple Node.js based WebSocket server that performs the actual serial communication.

To Use:

Connect an Arduino or other serial device to your computuer.

Clone or download this repo and install the dependencies with: ```npm install``` and start the server with: ```node startserver.js```

Alternatively, you can install the server globally via npm with ```sudo npm install -g p5.serialserver```  and then run it with ```p5serial``` or locally with ```npm install p5.serialserver``` and run it from the node_modules directory with ```node startserver.js```

Another alternative is to download and run a [release of p5.serialcontrol](https://github.com/vanevery/p5.serialcontrol/releases) which incorporates p5.serialserver in a GUI application for MacOS and Windows.

Then load one of the [examples/](https://github.com/vanevery/p5.serialport/tree/master/examples) in your browser to see it in action.  (You'll likely have to change the name of the serial port that is opened.)

[API documentation now available](http://vanevery.github.io/p5.serialport/docs/classes/p5.serialport.html)

The basics:
```javascript
var serial;

function setup() {
  // Instantiate our SerialPort object
  serial = new p5.SerialPort();

  // Let's list the ports available
  var portlist = serial.list();

  // Assuming our Arduino is connected, let's open the connection to it
  // Change this to the name of your arduino's serial port
  serial.open("/dev/cu.usbmodem1421");

  // Register some callbacks

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
}

// We are connected and ready to go
function serverConnected() {
    println("We are connected!");
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
  println("Serial Port is open!");
}

// Ut oh, here is an error, let's log it
function gotError(theerror) {
  println(theerror);
}

// There is data available to work with from the serial port
function gotData() {
  var currentString = serial.readStringUntil("\r\n");
  console.log(currentString);
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

function draw() {
  // Polling method
/*
  if (serial.available() > 0) {
    var data = serial.read();
    ellipse(50,50,data,data);
  }
*/
}
```

### Documentation
To generate documentation, install yuidoc (``npm install -g yuidocjs``) and run
```yuidoc -c yuidoc.json ./lib```
