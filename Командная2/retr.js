'use strict';

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

var pre_ambale = 126;
var post_ambale = 126;
var addr_source = 1;
var addr_dest = [0,1,2];
var flight_time=0;

var last_h_send=0;


var flag=0;
var hz_flag=0;

var n_pck=0;

var st_count=0;

var pocket=[];

var received_buf=[];

var start_t=[
    [2,11120],
    [0,24187],
    [0,46897],
    [1,55310],
    [2,60321],
    [1,78373]
];

var stop_t=[
    11953,
    25925,
    49145,
    56059,
    61554,
    80576
];

function pocket_check(received_buf,n_g){
        var n = 0;
        var k = 0;
        var end_flag=0;
        received_buf.push(pre_ambale);
        var trans_pockets = [];
        //console.log(received_buf)
        while (received_buf.length > 14){
            
                while (received_buf[0] != pre_ambale ){
                    received_buf.splice(0,1);
                }
    
                var received_packet = [];
                var flagg=1;
                //console.log(received_buf)
                for (var i = 12; i < received_buf.length+1 && i < 130; ++i) {
                    if (received_buf[i] == post_ambale && received_buf[i+1] == pre_ambale){
                        received_packet=received_buf.slice(0,i+1);
                        var in_crc = (((received_packet.slice(-3,-2) & 0xff) << 8) | (received_packet.slice(-2,-1) & 0xff));
    
                        var crc = crc16(received_packet.slice(1,-3),0,received_packet.slice(1,-3).length);
    
                        if ((in_crc == crc) && (pre_ambale == received_packet.slice(0,1)) && (post_ambale == received_packet.slice(-1))){
                            received_packet[1]=addr_dest[n_g];
                            received_packet[2]=addr_source;
                            crc = crc16(received_packet.slice(1,-3),0,received_packet.slice(1,-3).length);
                            let lowcrc = (crc & 0xff);
                            let highcrc = ((crc >> 8) & 0xff);
                            received_packet[received_packet.length-2]=lowcrc;
                            received_packet[received_packet.length-3]=highcrc;
                            end_flag=1;
                            n+=1;
                            trans_pockets.push(received_packet);
                            received_buf.splice(0,received_packet.length);
                            flagg=0;
                            break;
                        } else{
                            k+=1;
                        }
                    }
                    //console.log(received_packet)
                }
                //console.log(received_packet)
                if (flagg){
                    received_buf.splice(0,1);
            }
        }
        return [trans_pockets,end_flag];
    }




var receiver;
var transmitter;

function setup() {
    receiver = spacecraft.devices[1].functions[0];
    transmitter = spacecraft.devices[0].functions[0];
}


function loop() {
    var in_buf=receiver.receive(20);
    received_buf.push(...in_buf);
        if (spacecraft.flight_time > start_t[st_count][1] && spacecraft.flight_time < stop_t[st_count]&&flag==0){
            flag=1;
            hz_flag=1;
            n_pck=0;
            let checked=pocket_check(received_buf,start_t[st_count][0]);
            received_buf=[];
            if(checked[1]){
                pocket=checked[0];
            }
        }
        if (spacecraft.flight_time > stop_t[st_count] && st_count < stop_t.length-1 && hz_flag){
            st_count+=1;
            hz_flag=0;
        }
        if (spacecraft.flight_time>last_h_send+1 && flag==1){

            last_h_send=flight_time;

            if (n_pck<pocket.length-1){
                var to_send=pocket[n_pck];
                n_pck+=1;
                transmitter.transmit(to_send);
            }else{
                flag=0;
            }
        }
    
}
    