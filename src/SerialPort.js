const sp = require('serialport');

class SerialPort {
  constructor(serialport, serialoptions) {
    this.LOGGING = true;

    this.serialPortName = serialport;
    this.serialOptions = serialoptions;

    this.serialPort = null;

    this.messageListeners = [];

    this.openSerial();

    this.logit(`initialize with serial port ${this.serialPortName}`);
  }

  addClient(client) {
    this.messageListeners.push(client);

    console.log(
      `total number of ${this.messageListeners.length} clients subscribed`,
    );
    //this.onMessage({method: 'clientNumber', data: this.messageListeners.length});
  }

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
