let sp = require('serialport');

let SerialPort = require("./SerialPort");
let WebSocketServer = require('ws').Server;

module.exports = class Client{
    constructor(ws){
        this.LOGGING = true;

        //websocket object for this client
        this.ws = ws;
        //list of serial ports that this client has opened
        this.serialPorts = [];
        this.serialPortsList = [];

        this.clientID = Math.floor(Math.random() * 100);

        this.ws.clientData = {
            /*
            origin: ws.upgradeReq.headers['origin'],
            id: ws.upgradeReq.headers['sec-websocket-key']
            */
        };
    }

    echo(msg){
        this.sendit({method:'echo', data: msg});
    }

    registerClient(){
        this.sendit({method: 'registerClient', data: this.ws.clientData});
    }

    list(){
        let self = this;

        sp.list(function (err, ports){
            let portNames = [];
            ports.forEach(function(port){
                portNames.push(port.comName);
            });

            self.sendit({method: 'list', data: portNames});
        })
    }

    openSerial(port){
        this.serialPortsList.push(port.serialPortName);
        this.serialPorts.push(port);

        // this.serialPorts.forEach(port => port.onMessage = (msg) => {
        //     console.log(this.clientID + " message received");
        //
        //     this.sendit(msg);
        // });
    }

    write(msg){
        for(let i = 0; i < this.serialPorts.length; i++){
            this.serialPorts[i].serialPort.write(msg);
        }
    }

    close(){
        //this needs to be updated per port
        //also with client-side library
        this.serialPorts = [];
        this.serialPortsList = [];

        //close message via sendit?
        //close ws?
        this.sendit()
    }

    logit(mess){
        if(this.LOGGING){
            console.log(mess);
        }
    }

    sendit(toSend){
        let dataToSend = JSON.stringify(toSend);

        try{
            this.ws.send(dataToSend);
        }catch(error){
            console.log("Error sending: " , error);
        }
    }
};

