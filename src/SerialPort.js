/**
 * @fileOverview SerialPort class that gets created when new serial port is opened. Maintains list of connected Client objects to forward data received from the serial port.
 *
 * @author Shawn Van Every
 * @author Jiwon Shin
 *
 * @requires NPM:serialport
 * */

let sp = require('serialport');

/**
 * Represents a serialport object. Maintains an array of {@link Client Client} objects subscribed to the serial port.
 * @see https://www.npmjs.com/package/serialport
 * */
class SerialPort {
  /**
   * creates a SerialPort object
   * @constructor
   * @param {serialport} serialport - serialport object
   * @param {Object} serialoptions - JSON object of options for the serialport object
   * @property {Boolean} LOGGING - sets whether to console.log detailed information
   * @property {String} serialPortName - name of the connected serialport
   * @property {Object} serialOptions - JSON array of options for the serialport
   * @property {Client[]} messageListeners - array of subscribed {@link Client Client} objects
   * */
  constructor(serialport, serialoptions) {
    this.LOGGING = true;

    this.serialPortName = serialport;
    this.serialOptions = serialoptions;

    this.serialPort = null;

    this.messageListeners = [];

    this.openSerial();

    this.logit(`initialize with serial port ${this.serialPortName}`);
  }

  /**
   * add a web client to messageListeners array
   * @param {Client} client - {@link Client Client} object subscribing to the SerialPort
   * */
  addClient(client) {
    this.messageListeners.push(client);

    console.log(
      `total number of ${this.messageListeners.length} clients subscribed`,
    );
    //this.onMessage({method: 'clientNumber', data: this.messageListeners.length});
  }

  /**
   * remove client from messageListeners array to unsubscribe client
   * @param {Client} client - {@link Client Client} object unsubscribing to the SerialPort
   * */
  removeClient(client) {
    this.messageListeners = this.messageListeners.filter(
      (clientToRemove) => clientToRemove !== client,
    );
    console.log(
      `removeClient - total number of ${this.messageListeners.length} clients subscribed`,
    );
  }

  /**
   * Forwards message emitted by SerialPort events to the susbscribed clients in the messageListeners array
   * @param {Object} msg - JSON object containing message method and data
   * */
  onMessage(msg) {
    this.messageListeners.forEach((client) => client.sendit(msg));
  }

  /**
   * Opens SerialPort of serialPortName with serialOptions.
   * Sets serialport event listeners of method 'data', 'close' and 'error' and sends messages to the client via onMessage function
   * */
  openSerial() {
    let self = this;

    if (!self.serialOptions.hasOwnProperty('autoOpen')) {
      self.serialOptions.autoOpen = false;
    }

    self.serialPort = new sp(
      self.serialPortName,
      self.serialOptions,
      function (err) {
        if (err) {
          console.log(err);
          self.onMessage({ method: 'error', data: err });
        }
      },
    );

    self.serialPort.on('data', function (incoming) {
      for (let i = 0; i < incoming.length; i++) {
        self.onMessage({ method: 'data', data: incoming[i] });
      }
    });

    self.serialPort.on('close', function (data) {
      self.logit('serialPort.on close');
      self.onMessage({ method: 'close', data: data });

      for (let i = 0; i < self.messageListeners.length; i++) {
        let serialIndex = self.messageListeners[
          i
        ].serialPortsList.indexOf(self.serialPortName);

        console.log(
          'need to take out ' +
            self.serialPortName +
            ' from client at index ' +
            serialIndex,
        );

        self.messageListeners[i].serialPorts.splice(serialIndex, 1);
        self.messageListeners[i].serialPortsList.splice(
          serialIndex,
          1,
        );
      }

      self.closeSerial();
    });

    self.serialPort.on('error', function (data) {
      self.logit('serialPort.on error ' + data, true);
      self.onMessage({ method: 'error', data: data });
    });

    self.serialPort.open(function (err) {
      self.logit('serialPort.open');

      if (err) {
        console.log(err);
        self.onMessage({
          method: 'error',
          data: "Couldn't open port: " + this.serialport,
        });
      } else {
        self.onMessage({ method: 'openserial', data: {} });
      }
    });
  }

  /**
   * closes the serialport connection and sends message to the connected clients that the serialport is closed.
   * */
  closeSerial() {
    let self = this;

    //need to emit back to client that this port was forcefully closed

    self.logit(`closeSerial for ${self.serialPortName}`);

    if (
      self.serialPort != null &&
      typeof self.serialPort === 'object' &&
      self.serialPort.isOpen
    ) {
      self.logit('serialPort != null && serialPort.isOpen so close');
      self.logit('serialPort.flush, drain, close');

      self.serialPort.flush();
      self.serialPort.drain();
      self.serialPort.close(function (error) {
        if (error) {
          self.onMessage({ method: 'error', data: error });
          console.log(error);
        }
      });

      self.onMessage({
        method: 'close',
        data: `${self.serialPort} is closed`,
      });

      self.serialPort = null;
    }

    // if (self.serialPort != null && typeof self.serialPort === "object" && self.serialPort.isOpen) {
    //     self.logit("serialPort != null && serialPort.isOpen is true so serialPort = null");
    //
    //     self.serialPort = null;
    // }

    self.logit('serialPort closed');
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
}

module.exports = SerialPort;
