'use strict';


var receiver
var transmitter 


function setup() {
  receiver = spacecraft.devices[1].functions[0];
  transmitter = spacecraft.devices[0].functions[0];
}


function loop() {
   let received_packet = receiver.receive(10);
   transmitter.transmit(received_packet);
}

