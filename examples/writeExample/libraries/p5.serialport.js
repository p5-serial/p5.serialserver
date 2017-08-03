/*! p5.serialport.js v0.0.1 2015-07-23 */
/**
 * @module p5.serialport
 * @submodule p5.serialport
 * @for p5.serialport
 * @main
 */
/**
 *  p5.serialport
 *  Shawn Van Every (Shawn.Van.Every@nyu.edu)
 *  ITP/NYU
 *  LGPL
 *  
 *  https://github.com/vanevery/p5.serialport
 *
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd)
    define('p5.serialport', ['p5'], function(p5) {
      (factory(p5));
    });
  else if (typeof exports === 'object')
    factory(require('../p5'));
  else
    factory(root['p5']);
}(this, function(p5) {

  // =============================================================================
  //                         p5.SerialPort
  // =============================================================================


  /**
   * Base class for a serial port. Creates an instance of the serial library and prints "hostname":"serverPort" in the console.
   *
   * @class p5.SerialPort
   * @constructor
   * @param {String} [hostname] Name of the host. Defaults to 'localhost'.
   * @param {Number} [serverPort] Port number. Defaults to 8081.
   * @example
   * 	var portName = '/dev/cu.usbmodem1411'; //enter your portName
   *  		
   *	function setup() {
   *		 createCanvas(400, 300);
   *		 serial = new p5.SerialPort()
   *		 serial.open(portName);
   *	}
   */
  p5.SerialPort = function(_hostname, _serverport) {

    var self = this;

    this.bufferSize = 1; // How much to buffer before sending data event
    this.serialBuffer = [];
    //this.maxBufferSize = 1024;

    this.serialConnected = false; // Is serial connected?

    this.serialport = null;
    this.serialoptions = null;
    
    this.emitQueue = [];

    this.serialportList = [];

    if (typeof _hostname === 'string') {
      this.hostname = _hostname;
    } else {
      //console.log("typeof _hostname " + typeof _hostname + " setting to locahost");
      this.hostname = "localhost";
    }

    if (typeof _serverport === 'number') {
      this.serverport = _serverport;
    } else {
      //console.log("typeof _serverport " + typeof _serverport + " setting to 8081");
      this.serverport = 8081;
    }

    try {
      this.socket = new WebSocket("ws://" + this.hostname + ":" + this.serverport);
      console.log(("ws://" + this.hostname + ":" + this.serverport));
    } catch (err) {
      //console.log(err + "\n" + "Is the p5.serialserver running?");
      if (typeof self.errorCallback !== "undefined") {
        self.errorCallback("Couldn't connect to the server, is it running?");
      }
    }

    this.socket.onopen = function(event) {
      console.log('opened socket');
      serialConnected = true;

      if (typeof self.connectedCallback !== "undefined") {
        self.connectedCallback();
      }
      
      if (self.emitQueue.length > 0) {
        for (var i = 0; i < self.emitQueue.length; i ++){
          //console.log("queue: " + self.emitQueue[i]);
          self.emit(self.emitQueue[i]);
        }
        self.emitQueue = [];
      }
      
      /* Now handled by the queue
      if (self.serialport && self.serialoptions) {
        // If they have asked for a connect, these won't be null and we should try the connect now
        // Trying to hide the async nature of the server connection and just deal with the async nature of serial for the end user
        self.emit({
          method: 'openserial',
          data: {
            serialport: self.serialport,
            serialoptions: self.serialoptions
          }
        });
      }
      */
    };

    this.socket.onmessage = function(event) {
      //console.log("socketOnMessage");
      //console.log(event);

      var messageObject = JSON.parse(event.data);

      // MESSAGE ROUTING
      if (typeof messageObject.method !== "undefined") {
        if (messageObject.method == 'echo') {
          //console.log("echo: " + messageObject.data);
        } else if (messageObject.method === "openserial") {
          if (typeof self.openCallback !== "undefined") {
            self.openCallback();
          }
        } else if (messageObject.method === "data") {
          // Add to buffer, assuming this comes in byte by byte
          //console.log("data: " +  JSON.stringify(messageObject.data));
          self.serialBuffer.push(messageObject.data);
          
          //console.log(self.serialBuffer.length);

          if (typeof self.dataCallback !== "undefined") {
            // Hand it to sketch
            if (self.serialBuffer.length >= self.bufferSize) {
              self.dataCallback();
            }
            //console.log(self.serialBuffer.length);
          }

          if (typeof self.rawDataCallback !== "undefined") {
            self.rawDataCallback(messageObject.data);
          }
        } else if (messageObject.method === 'list') {
          
          self.serialportList = messageObject.data;

          if (typeof self.listCallback !== "undefined") {
            self.listCallback(messageObject.data);
          }
        } else if (messageObject.method === "write") {
          // Success Callback?
        } else if (messageObject.method === "error") {
          //console.log(messageObject.data);

          if (typeof self.errorCallback !== "undefined") {
            // Hand it to sketch
            self.errorCallback(messageObject.data);
          }
        } else {
          // Got message from server without known method
          console.log("Unknown Method: " + messageObject);
        }
      } else {
        console.log("Method Undefined: " + messageObject);
      }
    };

    this.socket.onclose = function(event) {
      //console.log("socketOnClose");
      //console.log(event);

      if (typeof self.closeCallback !== "undefined") {
        self.closeCallback();
      }
    };

    this.socket.onerror = function(event) {
      //console.log("socketOnError");
      //console.log(event);

      if (typeof self.errorCallback !== "undefined") {
        self.errorCallback();
      }
    };

  };

/** 
 *
 * @method emit
 * @private
 * @return
 * @example
 * 
 */
  p5.SerialPort.prototype.emit = function(data) {
    if (this.socket.readyState == WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      this.emitQueue.push(data);
    }
  };

/**
 * Tells you whether p5 is connected to the serial port. 
 *
 * @method isConnected
 * @return {Boolean} true or false
 * @example
 * 		var serial; // variable to hold an instance of the serialport library
 * 		var portName = '/dev/cu.usbmodem1411';
 * 		
 * 		function setup() {
 * 			createCanvas(400, 300);
 *	 		serial = new p5.SerialPort();
 *	 		serial.open(portName);
 *	 		println(serial.isConnected());
 * 		}
 */
  p5.SerialPort.prototype.isConnected = function() {
    if (self.serialConnected) { return true; }
    else { return false; }
  };

/**
 * Lists serial ports available to the server.
 * Synchronously returns cached list, asynchronously returns updated list via callback.
 * Must be called within the p5 setup() function.
 * Doesn't work with the p5 editor's "Run in Browser" mode.
 *
 * @method list
 * @return {Array} array of available serial ports
 * @example
 * 		function setup() {
 * 		createCanvas(windowWidth, windowHeight);
 * 		serial = new p5.SerialPort();
 * 		serial.list();
 * 		serial.open("/dev/cu.usbmodem1411");
 * 		}
 *
 * For full example: <a href="https://itp.nyu.edu/physcomp/labs/labs-serial-communication/two-way-duplex-serial-communication-using-p5js/">Link</a>
 * @example
 * 		function printList(portList) {
 * 		  // portList is an array of serial port names
 * 		  for (var i = 0; i < portList.length; i++) {
 * 		    // Display the list the console:
 * 		    println(i + " " + portList[i]);
 * 		  }
 * 		}
 */
  p5.SerialPort.prototype.list = function(cb) {
    if (typeof cb === 'function') {
      this.listCallback = cb;
    }
    this.emit({
      method: 'list',
      data: {}
    });

    return this.serialportList;
  };

/**
 * Opens the serial port to enable data flow.
 * Use the {[serialOptions]} parameter to set the baudrate if it's different from the p5 default, 9600.
 * 
 * @method open
 * @param  {String} serialPort Name of the serial port, something like '/dev/cu.usbmodem1411'
 * @param  {Object} [serialOptions] Object with optional options as {key: value} pairs.
 *                                Options include 'baudrate'.
 * @param  {Function} [serialCallback] Callback function when open completes
 * @example
 * 		// Change this to the name of your arduino's serial port
 * 		serial.open("/dev/cu.usbmodem1411");
 *
 * @example
 * 		// All of the following are valid:
 *		serial.open(portName);
 *		serial.open(portName, {}, onOpen);
 *		serial.open(portName, {baudrate: 9600}, onOpen)
 *		
 *		function onOpen() {
 *		  print('opened the serial port!');
 *		}
 */
  p5.SerialPort.prototype.open = function(_serialport, _serialoptions, cb) {

    if (typeof cb === 'function') {
      this.openCallback = cb;
    }

    this.serialport = _serialport;

    if (typeof _serialoptions === 'object') {
      this.serialoptions = _serialoptions;
    } else {
      //console.log("typeof _serialoptions " + typeof _serialoptions + " setting to {}");
      this.serialoptions = {};
    }
    // If our socket is connected, we'll do this now, 
    // otherwise it will happen in the socket.onopen callback
    this.emit({
      method: 'openserial',
      data: {
        serialport: this.serialport,
        serialoptions: this.serialoptions
      }
    });
  };

/**
 * Sends a byte to a webSocket server which sends the same byte out through a serial port.
 * @method write
 * @param  {String, Number, Array} Data Writes bytes, chars, ints, bytes[], and strings to the serial port.
 * @example
 * You can use this with the included Arduino example called PhysicalPixel.
 * Works with P5 editor as the socket/serial server, version 0.5.5 or later.
 * Written 2 Oct 2015 by Tom Igoe. For full example: <a href="https://github.com/vanevery/p5.serialport/tree/master/examples/writeExample">Link</a>
 * 		
 * 		function mouseReleased() {
 *	  		  serial.write(outMessage);
 *			  if (outMessage === 'H') {
 *			    outMessage = 'L';
 *			  } else {
 *			    outMessage = 'H';
 *			  }
 *		}
 *
 * For full example: <a href="https://itp.nyu.edu/physcomp/labs/labs-serial-communication/lab-serial-output-from-p5-js/">Link</a>
 * @example		
 * 		function mouseDragged() {
 *   		  // map the mouseY to a range from 0 to 255:
 *			  outByte = int(map(mouseY, 0, height, 0, 255));
 *			  // send it out the serial port:
 *			  serial.write(outByte);
 *		}
 */
  p5.SerialPort.prototype.write = function(data) {
    //Writes bytes, chars, ints, bytes[], Strings to the serial port
    var toWrite = null;
    if (typeof data == "number") {
      // This is the only one I am treating differently, the rest of the clauses are meaningless
      toWrite = [data];
    } else if (typeof data == "string") {
      toWrite = data;
    } else if (Array.isArray(data)) {
      toWrite = data;
    } else {
      toWrite = data;
    }

    this.emit({
      method: 'write',
      data: toWrite
    });
  };

/**
 * Returns a number between 0 and 255 for the next byte that's waiting in the buffer. 
 * Returns -1 if there is no byte, although this should be avoided by first checking available() to see if data is available.
 *
 * @method read
 * @return {Number} Value of the byte waiting in the buffer. Returns -1 if there is no byte.
 * @example
 * 		function serialEvent() {
 *   		inByte = int(serial.read());
 *			byteCount++;
 *		}
 *
 * @example
 * 		function serialEvent() {
 *	  		// read a byte from the serial port:
 *			var inByte = serial.read();
 *			// store it in a global variable:
 *			inData = inByte;
 *		}
 */
  p5.SerialPort.prototype.read = function() {
    if (this.serialBuffer.length > 0) {
      return this.serialBuffer.shift();
    } else {
      return -1;
    }
  };

/**
 * Returns the next byte in the buffer as a char. 
 * 
 * @method readChar
 * @return {String} Value of the Unicode-code unit character byte waiting in the buffer, converted from bytes. Returns -1 or 0xffff if there is no byte.
 * @example
 * 		var inData;
 *		
 *		function setup() {
 *		  // callback for when new data arrives
 *		  serial.on('data', serialEvent); 
 *		  
 *		function serialEvent() {
 *		  // read a char from the serial port:
 *		  inData = serial.readChar();
 *		}
 */
  p5.SerialPort.prototype.readChar = function() {
    if (this.serialBuffer.length > 0) {
      /*var currentByte = this.serialBuffer.shift();
      console.log("p5.serialport.js: " + currentByte);
      var currentChar = String.fromCharCode(currentByte);
      console.log("p5.serialport.js: " + currentChar);
      return currentChar;
      */
      return String.fromCharCode(this.serialBuffer.shift());
    } else {
      return -1;
    }
  };

/**
 * Returns a number between 0 and 255 for the next byte that's waiting in the buffer, and then clears the buffer of data. Returns -1 if there is no byte, although this should be avoided by first checking available() to see if data is available.
 * @method readBytes
 * @return {Number} Value of the byte waiting in the buffer. Returns -1 if there is no byte.
 * @example
 * 		var inData;
 *		
 *		function setup() {
 *		  // callback for when new data arrives
 *		  serial.on('data', serialEvent); 
 *		  
 *		function serialEvent() {
 *		  // read bytes from the serial port:
 *		  inData = serial.readBytes();
 *		}
 */
  p5.SerialPort.prototype.readBytes = function() {
    if (this.serialBuffer.length > 0) {
      var returnBuffer = this.serialBuffer.slice();

      // Clear the array
      this.serialBuffer.length = 0;

      return returnBuffer;
    } else {
      return -1;
    }
  };

/**
 * Returns all of the data available, up to and including a particular character.
 * If the character isn't in the buffer, 'null' is returned. 
 * The version without the byteBuffer parameter returns a byte array of all data up to and including the interesting byte. 
 * This is not efficient, but is easy to use. 
 * 
 * The version with the byteBuffer parameter is more efficient in terms of time and memory. 
 * It grabs the data in the buffer and puts it into the byte array passed in and returns an integer value for the number of bytes read. 
 * If the byte buffer is not large enough, -1 is returned and an error is printed to the message area. 
 * If nothing is in the buffer, 0 is returned.
 *
 * @method readBytesUntil
 * @param {[byteBuffer]} 
 * @return {[Number]} [Number of bytes read]
 * @example
 *		// All of the following are valid:
 *		charToFind.charCodeAt();
 *		charToFind.charCodeAt(0);
 *		charToFind.charCodeAt(0, );
 */
  p5.SerialPort.prototype.readBytesUntil = function(charToFind) {
    console.log("Looking for: " + charToFind.charCodeAt(0));
    var index = this.serialBuffer.indexOf(charToFind.charCodeAt(0));
    if (index !== -1) {
      // What to return
      var returnBuffer = this.serialBuffer.slice(0, index + 1);
      // Clear out what was returned
      this.serialBuffer = this.serialBuffer.slice(index, this.serialBuffer.length + index);
      return returnBuffer;
    } else {
      return -1;
    }
  };

/**
 * Returns all the data from the buffer as a String. 
 * This method assumes the incoming characters are ASCII. 
 * If you want to transfer Unicode data: first, convert the String to a byte stream in the representation of your choice (i.e. UTF8 or two-byte Unicode data). 
 * Then, send it as a byte array.
 *
 * @method readString
 * @return
 * @example
 * 
 *
 *
 * 
 */
  p5.SerialPort.prototype.readString = function() {
    //var returnBuffer = this.serialBuffer;
    var stringBuffer = [];
    //console.log("serialBuffer Length: " + this.serialBuffer.length);
    for (var i = 0; i < this.serialBuffer.length; i++) {
      //console.log("push: " + String.fromCharCode(this.serialBuffer[i]));
      stringBuffer.push(String.fromCharCode(this.serialBuffer[i]));
    }
    // Clear the buffer
    this.serialBuffer.length = 0;
    return stringBuffer.join("");
  };

/**
 * Returns all of the data available as an ASCII-encoded string.
 *
 * @method readStringUntil
 * @param {String} stringToFind String to read until.
 * @return {String} ASCII-encoded string until and not including the stringToFind.
 * @example
 *
 * For full example: <a href="https://github.com/tigoe/p5.serialport/blob/master/examples/twoPortRead/sketch.js">Link</a>
 * 		 
 * 		 var serial1 = new p5.SerialPort();
 *		 var serial2 = new p5.SerialPort();
 *		 var input1 = '';
 *		 var input2 = '';
 *		
 *		 function serialEvent(){
 *		 		data = serial1.readStringUntil('\r\n');
 *				if (data.length > 0){
 *				input1 = data;
 *				}
 *		 }
 *		 
 *		 function serial2Event() {
 *		 		var data = serial2.readStringUntil('\r\n');
 *				if (data.length > 0){
 *				input2 = data;
 *				}
 *		 }
 */
  p5.SerialPort.prototype.readStringUntil = function(stringToFind) {

    var stringBuffer = [];
    //console.log("serialBuffer Length: " + this.serialBuffer.length);
    for (var i = 0; i < this.serialBuffer.length; i++) {
      //console.log("push: " + String.fromCharCode(this.serialBuffer[i]));
      stringBuffer.push(String.fromCharCode(this.serialBuffer[i]));
    }
    stringBuffer = stringBuffer.join("");
    //console.log("stringBuffer: " + stringBuffer);

    var returnString = "";
    var foundIndex = stringBuffer.indexOf(stringToFind);
    //console.log("found index: " + foundIndex);
    if (foundIndex > -1) {
      returnString = stringBuffer.substr(0, foundIndex);
      this.serialBuffer = this.serialBuffer.slice(foundIndex + stringToFind.length);
    }
    //console.log("Sending: " + returnString);
    return returnString;
  };


/**
 * Returns all of the data available as an ASCII-encoded string until a line break is encountered.
 * 
 * @method readLine
 * @return {String} ASCII-encoded string
 * @example
 * 
 * You can use this with the included Arduino example called AnalogReadSerial.
 * Works with P5 editor as the socket/serial server, version 0.5.5 or later.
 * Written 2 Oct 2015 by Tom Igoe. For full example: <a href="https://github.com/vanevery/p5.serialport/tree/master/examples/readAndAnimate">Link</a>
 * 		
 * 		function gotData() {
 *   		  var currentString = serial.readLine();  // read the incoming data
 *			  trim(currentString);                    // trim off trailing whitespace
 *			
 *			  if (!currentString) return; {            // if the incoming string is empty, do no more 
 *			    console.log(currentString);
 *			    }
 *			    
 *			  if (!isNaN(currentString)) {  // make sure the string is a number (i.e. NOT Not a Number (NaN))
 *			    textXpos = currentString;   // save the currentString to use for the text position in draw()
 *			    }
 *			}
 */
  p5.SerialPort.prototype.readLine = function() {
    return this.readStringUntil("\r\n");
  }; 

/**
 * Returns the number of bytes available.
 *
 * @method available
 * @return {Number} The length of the serial buffer array, in terms of number of bytes in the buffer.
 * @example
 *		function draw() {
 *			// black background, white text:
 *			background(0);
 *			fill(255);
 *			// display the incoming serial data as a string:
 *			var displayString = "inByte: " + inByte + "\t Byte count: " + byteCount;
 *			displayString += "  available: " + serial.available();
 *			text(displayString, 30, 60);
 *			}
 * */
  p5.SerialPort.prototype.available = function() {
    return this.serialBuffer.length;
  };

/**
 * Returns the last byte of data from the buffer.
 *
 * @method last
 * @return {Number}
 * @example
 * 
 * */
  p5.SerialPort.prototype.last = function() {
    //Returns last byte received
    var last = this.serialBuffer.pop();
    this.serialBuffer.length = 0;
    return last;
  };

/**
 * Returns the last byte of data from the buffer as a char.
 *
 * @method lastChar
 * @example
 * 
 * */
  p5.SerialPort.prototype.lastChar = function() {
    return String.fromCharCode(this.last());
  };

/**
 * Clears the underlying serial buffer.
 *
 * @method clear
 * @example
 */
  p5.SerialPort.prototype.clear = function() {
    //Empty the buffer, removes all the data stored there.
    this.serialBuffer.length = 0;
  };

/**
 * Stops data communication on this port. 
 * Use to shut the connection when you're finished with the Serial.
 *
 * @method stop
 * @example
 * 
 */
  p5.SerialPort.prototype.stop = function() {
  };

/**
 * Tell server to close the serial port. This functions the same way as serial.on('close', portClose).
 * 
 * @method close
 * @param {String} name of callback
 * @example
 *		
 *		var inData;
 *		
 *		function setup() {
 *		  serial.open(portOpen);
 *		  serial.close(portClose); 
 *		}
 *  	
 *  	function portOpen() {
 *		  println('The serial port is open.');
 *		}  
 *		 
 *		function portClose() {
 *		  println('The serial port closed.');
 *		}  
 */
  p5.SerialPort.prototype.close = function(cb) {
    // 
    if (typeof cb === 'function') {
      this.closeCallback = cb;
    }
    this.emit({
      method: 'close',
      data: {}
    });
  };

/**
 * // Register callback methods from sketch
 * 
 */
  p5.SerialPort.prototype.onData = function(_callback) {
    this.on('data',_callback);
  };

  p5.SerialPort.prototype.onOpen = function(_callback) {
    this.on('open',_callback);
  };

  p5.SerialPort.prototype.onClose = function(_callback) {
    this.on('close',_callback);
  };

  p5.SerialPort.prototype.onError = function(_callback) {
    this.on('error',_callback);
  };

  p5.SerialPort.prototype.onList = function(_callback) {
    this.on('list',_callback);
  };

  p5.SerialPort.prototype.onConnected = function(_callback) {
    this.on('connected',_callback);
  };

  p5.SerialPort.prototype.onRawData = function(_callback) {
    this.on('rawdata',_callback);
  };

  // Version 2
  p5.SerialPort.prototype.on = function(_event, _callback) {
    if (_event == 'open') {
      this.openCallback = _callback;
    } else if (_event == 'data') {
      this.dataCallback = _callback;
    } else if (_event == 'close') {
      this.closeCallback = _callback;
    } else if (_event == 'error') {
      this.errorCallback = _callback;
    } else if (_event == 'list') {
      this.listCallback = _callback;
    } else if (_event == 'connected') {
      this.connectedCallback = _callback;
    } else if (_event == 'rawdata') {
      this.rawDataCallback = _callback;
    }
  };
}));

// EOF
