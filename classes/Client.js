/**
 * @fileOverview Client object that gets created when new web socket client connects to server. Maintains SerialPort objects that the client subscribes to.
 *
 * @author Shawn Van Every
 * @author Jiwon Shin
 *
 * @requires NPM:serialport
 * @requires NPM:ws
 * @requires classes/SerialPort.js:SerialPort
 * */

let sp = require('serialport');
let SerialPort = require('./SerialPort');
let WebSocketServer = require('ws').Server;

/**
 * Represents a web socket client. Maintains {@link SerialPort SerialPort} objects that the client subscribes to.
 */
class Client {
  /**
   * create a web socket client
   * @constructor
   * @param {ws} ws - Web socket object
   * @property {SerialPort[]} serialPorts - list of subscribed {@link SerialPort SerialPort} objects
   * @property {string[]} serialPortsList - list of string names of subscribed {@link SerialPort SerialPort} objects. Used for checking whether duplicate serial port is requested to open.
   */
  constructor(ws) {
    this.LOGGING = true;

    //websocket object for this client
    this.ws = ws;
    //list of serial ports that this client has opened
    this.serialPorts = [];
    this.serialPortsList = [];
  }

  /** echo received message back to web client */
  echo(msg) {
    this.sendit({ method: 'echo', data: msg });
  }

  /** list all available serial ports and send it to the client*/
  list() {
    let self = this;

    sp.list(function (err, ports) {
      let portNames = [];
      ports.forEach(function (port) {
        portNames.push(port.comName);
      });

      self.sendit({ method: 'list', data: portNames });
    });
  }

  /**
   * add opened SerialPort object and its name
   * @param {SerialPort} port - SerialPort object opened by client
   * */
  openSerial(port) {
    this.serialPortsList.push(port.serialPortName);
    this.serialPorts.push(port);
  }

  /**
   * write received data to subscribed serial ports.
   * @param {String} msg - received string data from client
   * */
  write(msg) {
    for (let i = 0; i < this.serialPorts.length; i++) {
      this.serialPorts[i].serialPort.write(msg);
    }
  }

  /**
   * close client connection. Set serialPorts and serialPortsList array to null.
   */
  close() {
    //this needs to be updated per port
    //also with client-side library
    this.serialPorts = [];
    this.serialPortsList = [];

    //close message via sendit?
    //close ws?
    //this.sendit()
  }

  /**
   * console.log log messages when LOGGING == true
   * @function logit
   * @param {String} mess - String to log when LOGGING == true*/
  logit(mess) {
    if (this.LOGGING) {
      console.log(mess);
    }
  }

  /**
   * send data via websocket to the client
   * @param {Object} toSend - JSON object received to be sent. Contains message method and data.
   */
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
