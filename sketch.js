var serial;

function setup() {
  // uncomment this line to make the canvas the full size of the window
  // createCanvas(windowWidth, windowHeight);

  serial = new p5.SerialPort();
  serial.on('connected', serverConnected);
  serial.on('list', gotList);
  serial.on('data', gotData);
  serial.on('error', gotError);
  serial.on('open', gotOpen);
}

function serverConnected() {
  serial.list();
}

function gotList(thelist) {
  for (var i = 0; i < thelist.length; i++) {
    console.log(i + " " + thelist[i]);
    if (thelist[i].indexOf("/dev/cu.usbmodem") != -1) {
      console.log("Calling open with " + thelist[i]);
      serial.open(thelist[i]);
      break;      
    }
  }
}

function gotOpen() {
  console.log("Serial Port is Open!");
}

function gotError(theerror) {
  console.log(theerror);
}

function gotData(thedata) {
	//console.log(thedata);
}

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

function draw() {
  // draw stuff here
  ellipse(width/2, height/2, 50, 50);
  // (serial.available() )
}