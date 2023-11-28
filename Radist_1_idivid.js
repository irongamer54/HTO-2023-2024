'use strict';


var receiver
var transmitter 
let pre_post_ambale= 126

function crc16(data, offset, length) {
  if (data == null || offset < 0 || offset > data.length - 1 || offset + length > data.length) {
      return 0;
  }
  
  crc = 0xFFFF;
  for (i = 0; i < length; ++i) {
      crc ^= data[offset + i] << 8;
      for (j = 0; j < 8; ++j) {
          crc = (crc & 0x8000) > 0 ? (crc << 1) ^ 0x1021 : crc << 1;
      }
  }
  return crc & 0xFFFF;
}

function setup() {
  receiver = spacecraft.devices[1].functions[0];
  transmitter = spacecraft.devices[0].functions[0];
}


function loop() {
   let received_packet = receiver.receive(262);

   var in_crc = (((received_packet.slice(-3,-2) & 0xff) << 8) | (received_packet.slice(-2,-1) & 0xff));

   var crc = crc16(received_packet.slice(1,-3),0,received_packet.slice(1,-3).length);

   if (in_crc === crc){
    transmitter.transmit(received_packet);
   } 
}

