#!/usr/bin/env node

/**
 * @fileOverview start p5.serialserver by calling start() function in {@link p5.serialserver.js p5.serialserver.js}
 *
 * @author Shawn Van Every
 * @author Jiwon Shin
 *
 * @requires 	p5.serialserver.js
 */


let serialserver = require('./p5.serialserver');
serialserver.start(8081);

console.log("p5.serialserver is running");
