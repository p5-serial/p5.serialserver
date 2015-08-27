/*
	p5.serialserver.js
*/

var start = function () { 

	var SERVER_PORT = 8081;

	var WebSocketServer = require('ws').Server;
	var wss = new WebSocketServer({port: SERVER_PORT});

	var SerialPort = require("serialport");
	var serialPort = null;

	// This is a single user server at the moment
	var existingConnection = false;

	wss.on('connection', function(ws) {
		// We have a connection
		console.log("New Connection");

		if (!existingConnection) {
			console.log("No existing connection found");

			existingConnection = true;

			ws.sendit = function(toSend) {

				console.log("sendit: " + JSON.stringify(toSend));
				ws.send(JSON.stringify(toSend));
			}

			ws.on('message', function(inmessage) {
				var message = JSON.parse(inmessage);
				console.log(JSON.stringify(message));

				if (typeof message !== "undefined" && typeof message.method !== "undefined" && typeof message.data !== "undefined") {
						if (message.method === "echo") {
							console.log("echo " + message.data);
							ws.sendit({method:'echo', data:message.data});
						} else if (message.method === "list") {
							SerialPort.list(function (err, ports) {
								var portNames = [];
								ports.forEach(function(port) {
									console.log(port.comName);
									portNames.push(port.comName);
									//console.log(port.pnpId);
									//console.log(port.manufacturer);
								});

								ws.sendit({method:'list', data:portNames});
							});
						} else if (message.method === "openserial") {
							console.log("openserial " + message.method);
								
							try {
								serialPort = new SerialPort.SerialPort(message.data.serialport, message.data.serialoptions);
								serialPort.open(function (error) {
									if ( error ) {
										console.log(error);
										ws.sendit({method:'error', data:error});
									} else {
										console.log('open');
										ws.sendit({method:'openserial',data:{}});

										serialPort.on('data', function(data) {
											console.log('data received: ' + data);
											ws.sendit({method:'data',data:data});
										});

										serialPort.on('close', function(data) {
											console.log('close ' + data);
											ws.sendit({method: 'close', data:data});
											// Do I want to close the connection?
										});

										serialPort.on('error', function(data) {
											console.log('error ' + data);
											ws.sendit({method: 'error', data:data});
										});	
									}
							    });					
							} catch (er) {
							  	console.log(er);
							  	ws.sendit({method: 'error', data:er});
							}
							//ws.send() // Send confirmation back
						} else if (message.method === "write") {
							console.log("write " + message.data);
							serialPort.write(message.data);
						} else if (message.method === "close") {
							console.log("close");
							if (serialPort.isOpen()) {
								existingConnection = false;
								serialPort.close(
									function(error) {
										console.log("Close Error: " + error);
										ws.sendit({method:'error', data:error});
									}
								);
								ws.sendit({method: 'close', data:{}});
							}
						}
				}
				else {
					console.log("Not a message I understand: " + JSON.stringify(message));
				}
			});

			ws.on('close', function() {
				existingConnection = false;
				if (serialPort !== null && serialPort.isOpen()) {
					serialPort.close(
						function(error) {
							console.log("Close Error: " + error);
							ws.sendit({method:'error', data:error});
						}
					);
				}		
				ws.sendit({method: 'close', data:{}});		
			});
		} // existingConnection
		else
		{
			// Already have an existing connection
			console.log("Already have a connection!");
			ws.sendit({method: 'error', data: "Already bound to a client, please close existing connection first."});
			ws.close();
		}
	});
}

module.exports.start = start;

start();
