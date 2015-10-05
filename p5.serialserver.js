/*
	p5.serialserver.js
*/

var wss = null;
var serialPort = null;
var clients = [];

var start = function () { 

	var SERVER_PORT = 8081;

	var WebSocketServer = require('ws').Server;
	wss = new WebSocketServer({port: SERVER_PORT});

	var SerialPort = require("serialport");
	//var serialPort = null;

	wss.on('connection', function(ws) {
		// We have a connection
		//console.log("New Connection");
		clients.push(ws);

		ws.sendit = function(toSend) {

			var dataToSend = JSON.stringify(toSend);
			//console.log("sendit: " + dataToSend + " to " + clients.length + " clients");

			try {
				for (var c = 0; c < clients.length; c++) {
					clients[c].send(dataToSend);
				}
			} catch (e) {
				//console.log("Error Sending: " + e);
			}
		}

		SerialPort.list(function (err, ports) {
							var portNames = [];
							ports.forEach(function(port) {
								//console.log(port.comName);
								portNames.push(port.comName);
								//console.log(port.pnpId);
								//console.log(port.manufacturer);
							});

							ws.sendit({method:'list', data:portNames});
						});

		ws.on('message', function(inmessage) {
			var message = JSON.parse(inmessage);
			//console.log("on message: " + JSON.stringify(message));

			if (typeof message !== "undefined" && typeof message.method !== "undefined" && typeof message.data !== "undefined") {
					if (message.method === "echo") {
						//console.log("echo " + message.data);
						ws.sendit({method:'echo', data:message.data});
					} else if (message.method === "list") {
						SerialPort.list(function (err, ports) {
							var portNames = [];
							ports.forEach(function(port) {
								//console.log(port.comName);
								portNames.push(port.comName);
								//console.log(port.pnpId);
								//console.log(port.manufacturer);
							});

							ws.sendit({method:'list', data:portNames});
						});
					} else if (message.method === "openserial") {							
						//try {
							if (serialPort != null && serialPort.isOpen()) {

								// If we are already open, don't open again
								ws.sendit({method:'error', data:"Already open, to open again, close first, here comes an open event so you can pretend you opened it"});
								
								//console.log("Already open");

								// Send the open event
								ws.sendit({method:'openserial',data:{}});

							} else {
							
								// Open up
								if (typeof message.data.serialport === 'string') {
									serialPort = new SerialPort.SerialPort(message.data.serialport, message.data.serialoptions, false, 
										function(err) {
											console.log("Special Error: " + err);
										}
									);

									serialPort.open(function (err) {
										if ( err ) {
											console.log(err);
											ws.sendit({method:'error', data:"Couldn't open port: " + message.data.serialport});

										} else {
											ws.sendit({method:'openserial',data:{}});

											serialPort.on('data', function(incoming) {
												//{"type":"Buffer","data":[10]}
												
												for (var i = 0; i < incoming.length; i++) {
													ws.sendit({method:'data',data:incoming[i]});	
												}
											});

											serialPort.on('close', function(data) {
												ws.sendit({method: 'close', data:data});
												serialPort = null;
											});

											serialPort.on('error', function(data) {
												console.log(data);
												ws.sendit({method: 'error', data:data});
											});	
										}
								    });	
								} else {
									ws.sendit({method: 'error', data:"You must specify a serial port to open"});
								}

								
						    }				
						//} catch (err) {
						 //	console.log(err);
						 //	ws.sendit({method: 'error', data:err});
						//}
						//ws.send() // Send confirmation back
					} else if (message.method === "write") {
						
						serialPort.write(message.data);

					} else if (message.method === "close") {
						
						if (serialPort.isOpen()) {
							existingConnection = false;
							serialPort.close(
								function(error) {
									ws.sendit({method:'error', data:error});
									console.logo(error);
								}
							);
						}
					}
			}
			else {
				console.log("Not a message I understand: " + JSON.stringify(message));
			}
		});

		ws.on('close', function() {
			for (var c = 0; c < clients.length; c++) {
				if (clients[c] === ws) {
					//console.log("found client to remove");
					clients.splice(c,1);
					break;
				}
			}
			if (clients.length == 0) {
				// Should close serial port
				if (serialPort !== null && serialPort.isOpen()) {
					serialPort.close( 
						function(error) {
							console.log(error);		
						}
					);
					serialPort = null;
				}
			}
		});
	});

	//console.log("Starting");
};

var stop = function() {
	if (serialPort !== null && serialPort.isOpen()) {
		serialPort.close(
			function(error) {
				console.log("Close Error: " + error);
			}
		);
	}		

	try {
		for (var c = 0; c < clients.length; c++) {
			if (clients[c] != null) {
				clients[c].close();
			}
		}
	} catch (e) {
		console.log("Error Closing: " + e);
	}

	//console.log("Stopping");
}

module.exports.start = start;
module.exports.stop = stop;

//start();
