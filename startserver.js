const p5SerialServer = require('./src/p5.serialserver.js');

p5SerialServer.start(8081);

console.log('p5.serialserver is running!');
