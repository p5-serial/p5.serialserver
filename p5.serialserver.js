/*
	p5.serialserver.js
*/

var LOGGING = false;

var wss = null;
var serialPort = null;
var serialPortName = "";
var clients = [];

var logit = function(mess) {
	if (LOGGING) {
		console.log(mess);
	}
};

var start = function () { 
	logit("start()");

	var SERVER_PORT = 8081;

	var WebSocketServer = require('ws').Server;
	wss = new WebSocketServer({port: SERVER_PORT});

	var SerialPort = require("serialport");
	//var serialPort = null;

	var openSerial = function(serialport, serialoptions) {
		logit("openSerial: " + serialport);

		if (serialPort == null || serialPort.isOpen() == false) {
			logit("serialPort == null || !serialPort.isOpen()");

			serialPortName = serialport;

			if (!serialoptions.hasOwnProperty('autoOpen')) {
				serialoptions.autoOpen = false;
			}

			serialPort = new SerialPort(serialport, serialoptions, 
				function(err) {
					if (err) {
						console.log(err);
						sendit({method:'error', data: err});
					}
				}
			);

			serialPort.on('data', function(incoming) {
				//{"type":"Buffer","data":[10]}
				for (var i = 0; i < incoming.length; i++) {
					sendit({method:'data',data:incoming[i]});	
				}
			});

			serialPort.on('close', function(data) {
				logit("serialPort.on close");
				sendit({method: 'close', data:data});
			});

			serialPort.on('error', function(data) {
				logit("serialPort.on error " + data, true);
				sendit({method: 'error', data:data});
			});				

			serialPort.open(function (err) {
				logit("serialPort.open");

				if ( err ) {
					console.log(err);
					sendit({method:'error', data:"Couldn't open port: " + serialport});
				} else {
					sendit({method:'openserial',data:{}});
				}
		    });

		} else {

			if (serialport == serialPortName) {

				sendit({method:'error', data:"Already open"});
				logit("serialPort is already open");
				sendit({method:'openserial',data:{}});

			} else {

				// Trying to open a second port
				sendit({method:'error', data:"Unsupported operation, "+serialPortName+" is already open. You will receive data from that port."});
				logit("Unsupported operation, "+serialPortName+" is already open.");
			}
		}
	};

	var closeSerial = function() {
		logit("closeSerial");
		if (serialPort != null && serialPort.isOpen()) {
			logit("serialPort != null && serialPort.isOpen so close");
			logit("serialPort.flush, drain, close");

			serialPort.flush();
			serialPort.drain();
			serialPort.close(
				function(error) {
					if (error) {
						sendit({method:'error', data:error});
						console.log(error);
					}
				}
			);
			serialPort = null;
		}

		// Let's try to close a different way
		if (serialPort != null && serialPort.isOpen()) {
			logit("serialPort != null && serialPort.isOpen() is true so serialPort = null");

			serialPort = null;
		}

	};


	var sendit = function(toSend) {

		var dataToSend = JSON.stringify(toSend);
		//console.log("sendit: " + dataToSend + " to " + clients.length + " clients");

		for (var c = 0; c < clients.length; c++) {
			try {
				clients[c].send(dataToSend);
			} catch (e) {
				//console.log("Error Sending: " + e);
			}
		}
	};

	wss.on('connection', function(ws) {
		logit("connection");

		// We have a connection
		//console.log("New Connection");
		clients.push(ws);

		SerialPort.list(function (err, ports) {
			var portNames = [];
			ports.forEach(function(port) {
				//console.log(port.comName);
				portNames.push(port.comName);
				//console.log(port.pnpId);
				//console.log(port.manufacturer);
			});

			sendit({method:'list', data:portNames});
		});

		ws.on('message', function(inmessage) {
			var message = JSON.parse(inmessage);
			//console.log("on message: " + JSON.stringify(message));

			if (typeof message !== "undefined" && typeof message.method !== "undefined" && typeof message.data !== "undefined") {
					if (message.method === "echo") {
						//console.log("echo " + message.data);
						sendit({method:'echo', data:message.data});
					} else if (message.method === "list") {
						SerialPort.list(function (err, ports) {
							var portNames = [];
							ports.forEach(function(port) {
								//console.log(port.comName);
								portNames.push(port.comName);
								//console.log(port.pnpId);
								//console.log(port.manufacturer);
							});

							sendit({method:'list', data:portNames});
						});
					} else if (message.method === "openserial") {	

						logit("message.method === openserial");
							
						// Open up
						if (typeof message.data.serialport === 'string') {
							logit("new SerialPort.SerialPort");

							openSerial(message.data.serialport, message.data.serialoptions);

						} else {
							logit("User didn't specify a port to open");
							sendit({method: 'error', data:"You must specify a serial port to open"});
						}

					} else if (message.method === "write") {
						
						serialPort.write(message.data);

					} else if (message.method === "close") {
						logit("message.method === close");
						closeSerial();
					}
			}
			else {
				console.log("Not a message I understand: " + JSON.stringify(message));
			}
		});

		ws.on('close', function() {
			logit("ws.on close - client left");

			for (var c = 0; c < clients.length; c++) {
				if (clients[c] === ws) {
					logit("removing client from array");

					clients.splice(c,1);

					logit(clients.length + " clients left");
					break;
				}
			}

			
			if (clients.length == 0) {
				logit("clients.length == 0 checking to see if we should close serial port")
				// Should close serial port
				closeSerial();
			}
		});
	});



	//console.log("Starting");
};

var stop = function() {
	logit("stop()");

	if (serialPort != null && serialPort.isOpen()) {
		logit("serialPort != null && serialPort.isOpen() is true");
		logit("serialPort.flush, drain, close");

		serialPort.flush();
		serialPort.drain();
		serialPort.close(
			function(error) {
				if (error) {
					console.log("Close Error: " + error);
				}
			}
		);
	}		

	try {
		for (var c = 0; c < clients.length; c++) {
			if (clients[c] != null) {
				logit("clients[" + c + "] != null, close");

				clients[c].close();
			}
		}
	} catch (e) {
		console.log("Error Closing: " + e);
	}

	if (wss != null) {
		logit("wss != null so wss.close()");

		wss.close();
	}
	
	// Let's try to close a different way
	if (serialPort != null && serialPort.isOpen()) {
		logit("serialPort != null && serialPort.isOpen() is true so serialPort = null");

		serialPort = null;
	}
}

module.exports.start = start;
module.exports.stop = stop;

//start();
