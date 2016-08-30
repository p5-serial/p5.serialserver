// Declare a "SerialPort" object
var serial;
var latestData = "waiting for data";  // you'll use this to write incoming data to the canvas

var portText = "Select a Port:";
var portDiv;
var portSelect;
var portParagraph;
var selectedPort;

var connectText = "Connect";
var connectDiv;
var connectButton;

var closeText = "Close Connection";
var closeDiv;
var closeButton;

function setup() {
	createCanvas(1, 1);

	portDiv = createDiv();
	portParagraph = createP(portText);
	portParagraph.parent(portDiv);
	
	connectDiv = createDiv("");
	connectButton = createButton(connectText);
	connectButton.parent(connectDiv);
	connectButton.mousePressed(connectPressed);
	
	closeDiv = createDiv("");
	closeButton = createButton(closeText);
	closeButton.parent(closeDiv);
	closeButton.mousePressed(closePressed);
	
	// Instantiate our SerialPort object
	serial = new p5.SerialPort();

	// Callback for list of ports available
	serial.on('list', gotList);

	// Get a list the ports available
	// You should have a callback defined to see the results
	serial.list();

	// Here are the callbacks that you can register

	// When we connect to the underlying server
	serial.on('connected', serverConnected);

	// When we get a list of serial ports that are available
	// OR
	//serial.onList(gotList);

	// When we some data from the serial port
	//serial.on('data', gotData);
	// OR
	//serial.onData(gotData);

	// When or if we get an error
	serial.on('error', gotError);
	// OR
	//serial.onError(gotError);

	// When our serial port is opened and ready for read/write
	serial.on('open', gotOpen);
	// OR
	//serial.onOpen(gotOpen);

	// Callback to get the raw data, as it comes in for handling yourself
	serial.on('rawdata', gotRawData);
	// OR
	//serial.onRawData(gotRawData);
}

// We are connected and ready to go
function serverConnected() {
  seriallog("Connected to Server");
}

// Got the list of ports
function gotList(thelist) {
	log("List of Serial Ports:");

	if (portSelect) {
		portSelect.remove();	
	}
 	portSelect = createSelect();	
	portSelect.parent(portDiv);

	for (var i = 0; i < thelist.length; i++) {
		log(i + " " + thelist[i]);
		portSelect.option(thelist[i]);
	}
}

function connectPressed() {
	seriallog("Here");
	seriallog("Opening: " + portSelect.value());
	serial.open(portSelect.value());
}

function closePressed() {
	serial.close();
}

function gotOpen() {
  seriallog("Serial Port is Open");
}

// Ut oh, here is an error, let's log it
function gotError(theerror) {
  seriallog(theerror);
}

// There is data available to work with from the serial port
function gotData() {
// 	  var currentString = serial.readLine();  // read the incoming string
// 	  trim(currentString);                    // remove any trailing whitespace
// 	  if (!currentString) return;             // if the string is empty, do no more
// 	  log(currentString);             // log the string
// 	  latestData = currentString;            // save it for the draw method
}

// We got raw from the serial port
function gotRawData(thedata) {
  seriallog(thedata);
}

// Methods available
// serial.read() returns a single byte of data (first in the buffer)
// serial.readChar() returns a single char 'A', 'a'
// serial.readBytes() returns all of the data available as an array of bytes
// serial.readBytesUntil('\n') returns all of the data available until a '\n' (line break) is encountered
// serial.readString() retunrs all of the data available as a string
// serial.readStringUntil('\n') returns all of the data available as a string until a specific string is encountered
// serial.readLine() calls readStringUntil with "\r\n" typical linebreak carriage return combination
// serial.last() returns the last byte of data from the buffer
// serial.lastChar() returns the last byte of data from the buffer as a char
// serial.clear() clears the underlying serial buffer
// serial.available() returns the number of bytes available in the buffer
// serial.write(somevar) writes out the value of somevar to the serial device

function draw() {
}

function seriallog(txt) {
	console.log(txt);
}
