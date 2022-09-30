// Client object that gets created when new web socket client connects to server.
// Maintains SerialPort objects that the client subscribes to.

let sp = require('serialport');
let SerialPort = require('./SerialPort');
let WebSocketServer = require('ws').Server;

// represents a web socket client. Maintains SerialPort objects that the client subscribes to.
class Client {
  constructor(ws) {
    this.LOGGING = true;
    //websocket object for this client
    this.ws = ws;
    //list of serial ports that this client has opened
    this.serialPorts = [];
    this.serialPortsList = [];
  }

  // echo received message back to web client
  echo(msg) {
    this.sendit({ method: 'echo', data: msg });
  }

  // list all available serial ports and send it to the client
  list() {
    let self = this;

    sp.list().then((ports) => {
      let portNames = [];
      ports.forEach(function (port) {
        portNames.push(port.path);
        console.log(port.path);
      });
      self.sendit({ method: 'list', data: portNames });
    });
  }

  // add opened SerialPort object and its name
  openSerial(port) {
    this.serialPortsList.push(port.serialPortName);
    this.serialPorts.push(port);
    console.log('open');
  }

  // write received data to subscribed serial ports
  write(msg) {
    for (let i = 0; i < this.serialPorts.length; i++) {
      this.serialPorts[i].serialPort.write(msg);
    }
  }

  // close client connection. Set serialPorts and serialPortsList array to nulls
  close() {
    //this needs to be updated per port
    //also with client-side library
    this.serialPorts = [];
    this.serialPortsList = [];

    //close message via sendit?
    //close ws?
    //this.sendit()
  }

  // console.log log messages when LOGGING == true
  logit(mess) {
    if (this.LOGGING) {
      console.log(mess);
    }
  }

  // send data via websocket to the client
  sendit(toSend) {
    let dataToSend = JSON.stringify(toSend);

    try {
      this.ws.send(dataToSend);
    } catch (error) {
      console.log('Error sending: ', error);
    }
  }
}

module.exports = Client;
