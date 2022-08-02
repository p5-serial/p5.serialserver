/**
 * @fileOverview Sets up web socket server and handles client connections by creating and deleting Client objects and SerialPort objects
 *
 * @author Shawn Van Every
 * @author Jiwon Shin
 *
 * @requires	classes/Client.js:Client
 * @requires 	classes/SerialPort.js:SerialPort
 * @requires 	NPM:ws
 */

let Client = require('./classes/Client');
let SerialPort = require('./classes/SerialPort');

/**
 * Variable to decide whether to console.log detailed messages
 * @type {Boolean}
 * */
let LOGGING = true;
/**
 * Web socket server. Initialized in start() function.
 * @type {ws}
 * */
let wss = null;

/**
 * Array of all opened serial port names in string.
 * @type {String[]}
 */
let serialPortsList = [];
/**
 * Array of all opened {@link SerialPort SerialPort} objects.
 * @type {SerialPort[]}
 * */
let serialPorts = [];
/**
 * Array of all connected {@link Client Client} objects.
 * @type {Client[]}
 * */
let clients = [];

/**
 * console.log log messages when LOGGING == true
 * @function logit
 * @param {String} mess - String to log when LOGGING == true*/
let logit = function (mess) {
  if (LOGGING) {
    console.log(mess);
  }
};

/**
 * @function start
 * @desc Initialize web socket server at port 8081. Initialize web socket clients on connection by creating a {@link Client Client} object and create a (@link SerialPort SerialPort} object after determining that it has not been opened already. Initialize web socket client message events.
 * @param {Number} port - port number used to open web socket server.
 * */

/**
 * @event Client#message
 * @param {Object} inmessage - Type of message emitted from {@link Client Client}. Defined message types are: echo, list, openserial, write, close and error. Undefined message types are treated as error messages
 * */
let start = function (port) {
  logit('start()');

  let SERVER_PORT = port;

  let WebSocketServer = require('ws').Server;
  wss = new WebSocketServer({
    perMessageDeflate: false,
    port: SERVER_PORT,
  });

  wss.on('connection', (ws) => {
    // Push the connection into the array of clients
    let client = new Client(ws);
    clients.push(client);
    // Create an object to hold information about the connection

    logit(`${clients.length} clients connected`);

    client.ws.on('message', function (inmessage) {
      let message = JSON.parse(inmessage);

      if (
        typeof message !== 'undefined' &&
        typeof message.method !== 'undefined' &&
        typeof message.data !== 'undefined'
      ) {
        if (message.method === 'echo') {
          client.echo(message.data);
        } else if (message.method === 'list') {
          logit('message.method === list');
          client.list();
        } else if (message.method === 'openserial') {
          logit('message.method === openserial');

          if (typeof message.data.serialport === 'string') {
            let newPort = message.data.serialport;
            let newPortOptions = message.data.serialoptions;

            //before opening new port, clean up array
            for (let i = 0; i < serialPortsList; i++) {
              if (serialPortsList[i].serialPort === null) {
                serialPorts.splice(i, 1);
              }
            }

            if (serialPortsList.length > 0) {
              //specified serial port is already opened
              if (serialPortsList.indexOf(newPort) > -1) {
                let portIndex = serialPortsList.indexOf(newPort);

                if (client.serialPortsList.indexOf(newPort) > -1) {
                  client.sendit({
                    method: 'error',
                    data: 'Already open',
                  });
                  logit(`serialPort ${newPort} is already open`);
                  client.sendit({ method: 'openserial', data: {} });
                } else {
                  //add existing serialPort to the client

                  serialPorts[portIndex].addClient(client);
                  client.openSerial(serialPorts[portIndex]);
                  client.sendit({ method: 'openserial', data: {} });
                }
              } else {
                serialPortsList.push(newPort);
                let newSerialPort = new SerialPort(
                  newPort,
                  newPortOptions,
                );
                serialPorts.push(newSerialPort);

                newSerialPort.addClient(client);
                client.openSerial(newSerialPort);
              }
            } else {
              //first serial connection
              serialPortsList.push(newPort);
              let newSerialPort = new SerialPort(
                newPort,
                newPortOptions,
              );
              serialPorts.push(newSerialPort);

              newSerialPort.addClient(client);
              client.openSerial(newSerialPort);
            }
          } else {
            logit("User didn't specify a port to open");
            client.sendit({
              method: 'error',
              data: 'You must specify a serial port to open',
            });
          }
        } else if (message.method === 'write') {
          client.write(message.data);
        } else if (message.method === 'close') {
          logit('message.method === close');

          for (let i = 0; i < client.serialPortsList.length; i++) {
            let portIndex = serialPortsList.indexOf(
              client.serialPortsList[i],
            );
            if (serialPorts[portIndex] != null) {
              serialPorts[portIndex].closeSerial();
              serialPorts.splice(portIndex, 1);
              serialPortsList.splice(portIndex, 1);
            }
          }
        }
      } else {
        console.log(
          'Not a message I understand: ' + JSON.stringify(message),
        );
      }
    });

    //check if this is called if browser closed
    //needs to be explicitly closed
    //other clients need to receive broadcast that it was closed
    ws.on('close', function () {
      logit(`ws.on close - ${clients.length} client left`);

      for (let c = 0; c < clients.length; c++) {
        if (clients[c].ws === ws) {
          logit('removing client from array');

          serialPorts.forEach((port) =>
            port.removeClient(clients[c]),
          );

          clients.splice(c, 1);

          logit(`clients.splice - ${clients.length} clients left`);
          break;
        }
      }

      if (clients.length === 0) {
        logit(
          'clients.length == 0 checking to see if we should close serial port',
        );

        // Should close serial ports
        for (let i = 0; i < serialPorts.length; i++) {
          serialPorts[i].closeSerial();
        }

        serialPorts = [];
        serialPortsList = [];
      }
    });
  });
};

/**
 * @function stop
 * @desc Stops web socket server after closing all {@link SerialPort SerialPort} connections and {@link Client Client} connections
 * */
let stop = function () {
  logit('stop()');

  for (let i = 0; i < serialPorts.length; i++) {
    if (
      serialPorts[i].serialPort != null &&
      typeof serialPorts[i].serialPort === 'object' &&
      serialPorts[i].serialPort.isOpen
    ) {
      logit('serialPort != null && serialPort.isOpen is true');
      logit('serialPort.flush, drain, close');

      serialPorts[i].serialPort.flush();
      serialPorts[i].serialPort.drain();
      serialPorts[i].serialPort.close(function (error) {
        if (error) {
          console.log('Serial Close Error: ' + error);
        }
      });

      serialPorts.splice(i, 1);
      serialPortsList.splice(i, 1);
    }
  }

  try {
    for (let c = 0; c < clients.length; c++) {
      if (clients[c] != null) {
        logit('clients[' + c + '] != null, close');

        clients[c].ws.close();
      }
    }
  } catch (e) {
    console.log('Client Close Error: ' + e);
  }

  if (wss != null) {
    logit('wss != null so wss.close()');
    wss.close();
  }

  // Let's try to close a different way
  for (let i = 0; i < serialPorts.length; i++) {
    if (
      serialPorts[i].serialPort != null &&
      typeof serialPorts[i].serialPort === 'object' &&
      serialPorts[i].serialPort.isOpen
    ) {
      logit(
        'serialPort != null && serialPort.isOpen is true so serialPort = null',
      );
      serialPorts[i].serialPort = null;
    }
  }
};

module.exports.start = start;
module.exports.stop = stop;
