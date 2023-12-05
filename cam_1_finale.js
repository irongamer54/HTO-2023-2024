//cum_1_finale
'use strict';

///////Device///////
var wheels_bus;
var gyros;
var nav;
var transmitter;
var receiver;

///////TIME///////
var start_t = [13170,22765,33465,44084]; // прописать
var stop_t = [14530,24075,35185,46035]; // прописать

///////CONST///////
var pre_ambale = 123;
var post_ambale = 125;

var P = 0.12;
var I = 0.005;
var D = 0.48;
var dt = 0.01; 

///////variables///////
var e_prev=0;
var integral=0;

var st_count = 0;

var received_buf = [];
var send_pockets = [];
var transmited_counts = 0;
function crc16(data, offset, length) {
  if (data == null || offset < 0 || offset > data.length - 1 || offset + length > data.length) {
      return 0;
  }
  
  var crc = 0xFFFF;
  for (var i = 0; i < length; ++i) {
      crc ^= data[offset + i] << 8;
      for (var j = 0; j < 8; ++j) {
          crc = (crc & 0x8000) > 0 ? (crc << 1) ^ 0x1021 : crc << 1;
      }
  }
  return crc & 0xFFFF;
}

function pocket_chek(received_buf){
    var n = 0;
    var k = 0;

    received_buf.push(pre_ambale);
    var trans_pockets = [];

    while (received_buf.length > 14){
        
        if (received_buf.length > 0){

            while (received_buf[0] != pre_ambale ){
                received_buf.splice(0,1);
            }

            var received_packet = [];
            var flag=1;

            for (var i = 10; i < received_buf.length - 1 && i < 102; ++i) {

                if (received_buf[i] == post_ambale && received_buf[i+1] == pre_ambale){
                    received_packet=received_buf.slice(0,i+1);
                    received_buf.splice(0,received_packet.length);
                    flag=0;
                    break;
                }
            }

            if (flag){
                received_buf.splice(0,1);
            }else{

                var in_crc = (((received_packet.slice(-3,-2) & 0xff) << 8) | (received_packet.slice(-2,-1) & 0xff));

                var crc = crc16(received_packet.slice(1,-3),0,received_packet.slice(1,-3).length);

                if ((in_crc === crc)&&(pre_ambale == received_packet.slice(0,1)) && (post_ambale == received_packet.slice(-1))){
                    n+=1;
                    trans_pockets.push(received_packet);
                } else{
                    k+=1;
                }
            }
        }
    }
    return trans_pockets
}

function stabilize(){
    wheels_bus.enable();

    let e = gyros.functions[0].angular_velocity;

    integral = I * dt * e + integral;

    var data = new Float32Array([((e) * P + (e - e_prev) / dt * D + integral)]);
    var byteView = new Uint8Array(data.buffer);
    wheels_bus.transmit(byteView);

    e_prev = e;
}

function setup() {
    transmitter = spacecraft.devices[0].functions[0];
    receiver = spacecraft.devices[1].functions[0];
    gyros = spacecraft.devices[2];
    nav = spacecraft.devices[3];
    wheels_bus = spacecraft.devices[4].functions[0];    
    wheels_bus.disable();
}

function loop() {
    stabilize();

    if (spacecraft.flight_time > stop_t && st_count < stop_t.length-1){
        st_count+=1;

        //send_pockets=[];
        transmited_counts=0;

        send_pockets=pocket_chek(received_buf)
    }

    if (spacecraft.flight_time > start_t[st_count]){
        var pkt=receiver.receive(20);
        received_buf.push(...pkt);

        if(transmited_counts<send_pockets.length){
            transmitter.transmit(send_pockets[transmited_counts])
            transmited_counts ++;
        }

    }

}



