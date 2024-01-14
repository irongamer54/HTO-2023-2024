'use strict';

var transmitter;
var science;

var pre_ambale = 126;
var post_ambale = 126;
var addr_source = 1;



var flag=0;
var last_send=0;
var last_h_send=0;
var pocket=[];

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

function new_pocket(){
        let pockett=[pre_ambale];
        let data=[0,addr_source,...science.read(40)];
        let crc=crc16(data,0,data.length);
        let lowcrc = (crc & 0xff);
        let highcrc = ((crc >> 8) & 0xff);
        pockett.push(...data,highcrc,lowcrc,post_ambale);
        return pockett;
}

function setup() {
    transmitter = spacecraft.devices[0].functions[0];
    science = spacecraft.devices[1].functions[0];
}


function loop() {

    if (spacecraft.flight_time>last_send+5 && flag==0){
        pocket=new_pocket();
        last_send=spacecraft.flight_time;
        flag=1;
    }

    if(flag){
        if(pocket.length>0){
            if(spacecraft.flight_time>last_h_send+1){
                last_h_send=spacecraft.flight_time;
                var to_send=pocket.splice(0,10);
                transmitter.transmit(to_send);
            }
        }else{
            flag=0;
        }
    }
}
    