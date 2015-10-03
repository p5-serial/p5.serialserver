/*

Serial list ports

Lists serial ports in an options menu. When you choose one, opens the port
and displays any incoming strings as text onscreen.

Works with P5 editor as the serial server, version 0.5.5 or later.

created 2 Oct 2015
by Tom Igoe
*/

var serial; // Declare a "SerialPort" object
var menu;
var result = '';

function setup() {
  createCanvas(400, 300); // window size
  serial = new p5.SerialPort();
  serial.list();
  serial.on('list', printList);
  serial.on('data', printData);
}


function draw() {
  background(255);
  fill(0);
  text(result, 10, 60);
}

function openPort() {
  portName = menu.elt.value;
  serial.open(portName);
}

function printData() {
  var inString = serial.readStringUntil('\r\n');
  trim(inString);
  if (!inString) return;
  result = inString;
}

// Got the list of ports
function printList(serialList) {
  menu = createSelect();
  var title = createElement('option', 'Choose a port:');
  menu.child(title);
  menu.position(10, 10);
  menu.changed(openPort);
  for (var i = 0; i < serialList.length; i++) {
    var thisOption = createElement('option', serialList[i]);
    thisOption.value = serialList[i];
    menu.child(thisOption);
    println(i + " " + serialList[i]);
  }
}