/*
	p5.serialserver.js
*/

var start = function () { 

	var SERVER_PORT = 8081;

	var WebSocketServer = require('ws').Server;
	var wss = new WebSocketServer({port: SERVER_PORT});

	var SerialPort = require("serialport");
	var serialPort = null;

	var serialBuffer = [];
	var bufferSize = 8;

	wss.on('connection', function(ws) {
		// We have a connection
		console.log("New Connection");

		ws.sendit = function(toSend) {

			console.log("sendit: " + JSON.stringify(toSend));
			try {
				ws.send(JSON.stringify(toSend));
			} catch (e) {
				console.log("Error Sending: " + e);
			}
		}

		ws.on('message', function(inmessage) {
			var message = JSON.parse(inmessage);
			console.log("on message: " + JSON.stringify(message));

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
						//try {
							serialPort = new SerialPort.SerialPort(message.data.serialport, message.data.serialoptions, false, 
								function(err) {
									console.log("Special Error: " + err);
								});
							serialPort.open(function (err) {
								if ( err ) {
									console.log(err);
									ws.sendit({method:'error', data:"Couldn't open port: " + message.data.serialport});

								} else {
									ws.sendit({method:'openserial',data:{}});

									serialPort.on('data', function(data) {
										ws.sendit({method:'data',data:data});	

										/*
										if (typeof data == 'object') {
											serialBuffer = serialBuffer.concat(data);
										} else {
											serialBuffer.push(data);											
										}
	
										if (serialBuffer.length > bufferSize) {
											ws.sendit({method:'data',data:serialBuffer});	
											serialBuffer.length = 0;
										}
										*/
									});

									serialPort.on('close', function(data) {
										ws.sendit({method: 'close', data:data});
									});

									serialPort.on('error', function(data) {
										ws.sendit({method: 'error', data:data});
									});	
								}
						    });					
						//} catch (err) {
						 //	console.log(err);
						 //	ws.sendit({method: 'error', data:err});
						//}
						//ws.send() // Send confirmation back
					} else if (message.method === "write") {
						serialPort.write(message.data);
					} else if (message.method === "close") {
						console.log("close");
						if (serialPort.isOpen()) {
							existingConnection = false;
							serialPort.close(
								function(error) {
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
	});
}

module.exports.start = start;

//start();
