let sp = require("serialport");

module.exports = class SerialPort {

    constructor(serialport, serialoptions) {

        this.LOGGING = true;

        this.serialPortName = serialport;
        this.serialOptions = serialoptions;

        this.serialPort = null;

        this.messageListeners = [];

        this.openSerial();

        this.logit(`initialize with serial port ${this.serialPortName}`);
    }

    addClient(client){
        this.messageListeners.push(client);

        console.log(`total number of ${this.messageListeners.length} clients subscribed`);
    }

    removeClient(client){
        this.messageListeners = this.messageListeners.filter(clientToRemove => clientToRemove !== client);
    }

    onMessage(msg){
        this.messageListeners.forEach(client => client.sendit(msg));
    }

    //below necessary?
    // list() {
    //     sp.list(function (err, ports) {
    //         let portNames = [];
    //
    //         ports.forEach(function (port) {
    //             portNames.push(port.comName);
    //         });
    //
    //         this.onMessage({method: 'list', data: portNames});
    //     });
    // }


    openSerial(){
       let self = this;

        if(!self.serialOptions.hasOwnProperty('autoOpen')){
            self.serialOptions.autoOpen = false;
        }

        self.serialPort = new sp(self.serialPortName, self.serialOptions,
            function (err) {
                if (err) {
                    console.log(err);
                    self.onMessage({method: 'error', data: err});
                }
            }
        );

        self.serialPort.on('data', function(incoming){
            for(let i = 0; i < incoming.length; i++){
                self.onMessage({method: 'data', data: incoming[i]});
            }
        });

        self.serialPort.on('close', function(data){
            self.logit("serialPort.on close");
            self.onMessage({method: 'close', data: data});
        });

        self.serialPort.on('error', function(data){
            self.logit("serialPort.on error " + data, true);
            self.onMessage({method: 'error', data: data});
        });

        self.serialPort.open(function(err){
            self.logit("serialPort.open");

            if(err){
                console.log(err);
                self.onMessage({method: 'error', data: "Couldn't open port: " + this.serialport});
            }else{
                self.onMessage({method: 'openserial', data: {}});
            }
        });
    }

    closeSerial(){

        let self = this;

        self.logit(`closeSerial for ${self.serialPortName}`);

        console.log(self.serialPort.isOpen);

        if(self.serialPort != null && typeof self.serialPort === "object" && self.serialPort.isOpen){
            self.logit("serialPort != null && serialPort.isOpen so close");
            self.logit("serialPort.flush, drain, close");

            self.serialPort.flush();
            self.serialPort.drain();
            self.serialPort.close(
                function(error) {
                    if (error) {
                        self.onMessage({method:'error', data:error});
                        console.log(error);
                    }
                }
            );

            self.serialPort = null;
        }

        // if (self.serialPort != null && typeof self.serialPort === "object" && self.serialPort.isOpen) {
        //     self.logit("serialPort != null && serialPort.isOpen is true so serialPort = null");
        //
        //     self.serialPort = null;
        // }

        self.logit("serialPort closed");
    }

    logit(mess){
        if(this.LOGGING){
            console.log(mess);
        }
    }


};