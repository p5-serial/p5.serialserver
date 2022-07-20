/*
Example of using multiple serial ports in one sketch using arrays.

By Jiwon Shin
*/
// Change these to the name of your arduinos' serial ports
let serialPorts = ["/dev/tty.usbmodem14501", "/dev/tty.usbmodem14101"];
let serials = [];
let data = [];

function setup() {
    createCanvas(windowWidth, windowHeight);

    for(let i = 0; i < serialPorts.length; i++){
        // Instantiate our SerialPort object
        let newPort = new p5.SerialPort();
        // Assuming our Arduino is connected, let's open the connection to it
        newPort.open(serialPorts[i]);

        newPort.on('connected', serverConnected);
        newPort.on('list', gotList);
        //bind array index to the gotData callback function
        newPort.on('data', gotData.bind(this, i));
        newPort.on('error', gotError);
        newPort.on('open', gotOpen);
        newPort.on('gotClose', gotClose);

        serials.push(newPort);
    }

    // Get a list the ports available
    // You should have a callback defined to see the results
    serials[0].list();
}

// We are connected and ready to go
function serverConnected() {
    print("Connected to Server");
}

// Got the list of ports
function gotList(thelist) {
    print("List of Serial Ports:");
    // theList is an array of their names
    for (let i = 0; i < thelist.length; i++) {
        // Display in the console
        print(i + " " + thelist[i]);
    }
}

// Connected to our serial device
function gotOpen() {
    print("Serial Port is Open");
}

function gotClose(){
    print("Serial Port is Closed");
    latestData = "Serial Port is Closed";
}

// Ut oh, here is an error, let's log it
function gotError(theerror) {
    print(theerror);
}

// There is data available to work with from the serial port
function gotData(index) {
    let currentString = serials[index].readLine();  // read the incoming string
    trim(currentString);                    // remove any trailing whitespace
    if (!currentString) return;             // if the string is empty, do no more
    console.log(currentString);             // print the string
    data[index] = currentString;            // save it for the draw method
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
    background(255,255,255);
    fill(0,0,0);
    text(`From Arduino One: ${data[0]}`, 10, 10);
    text(`From Arduino Two: ${data[1]}`, 10, 30);
    // Polling method
    /*
    if (serial.available() > 0) {
    let data = serial.read();
    ellipse(50,50,data,data);
  }
  */
}