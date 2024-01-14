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

var lt=0;
var flag=0;
var hz_flag=0;

var n_pck=0;

var st_count=0;

var pocket=[];

var received_buf=[];

var P = 0.12;
var I = 0.005;
var D = 0.48;
var dt = 0.01; 

var e_prev_x = 0;
var integral_x = 0;

var e_prev_y = 0;
var integral_y = 0;

var e_prev_z = 0;
var integral_z = 0;

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

function pocket_check(received_buf1,n_g){
    var n = 0;
    var k = 0;
    var end_flag=0;
    var received_buff= received_buf1;
    received_buff.push(pre_ambale);
    var trans_pockets = [];
    //console.log(received_buf)
    //a=b[125];
    while (received_buff.length > 14){
        
            while (received_buff[0] != pre_ambale ){
                received_buff.splice(0,1);
            }

            var received_packet = [];
            var flagg=1;
            //a=b[125];
            //console.log(received_buff)
            for (var i = 5; i < received_buff.length+1 && i < 60; ++i) {
                //a=b[125];
                if (received_buff[i] == post_ambale && received_buff[i+1] == pre_ambale){
                    received_packet=received_buff.slice(0,i+1);
                    var in_crc = (((received_packet.slice(-3,-2) & 0xff) << 8) | (received_packet.slice(-2,-1) & 0xff));

                    var crc = crc16(received_packet.slice(1,-3),0,received_packet.slice(1,-3).length);

                    if ((in_crc == crc) && (pre_ambale == received_packet.slice(0,1)) && (post_ambale == received_packet.slice(-1))){
                        //a=b[125]
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
                        received_buff.splice(0,received_packet.length);
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
                received_buff.splice(0,1);
        }
    }
    return [trans_pockets,end_flag];
}

buf=[126,0,1,50,48,50,52,45,49,50,45,48,49,84,48,48,58,51,48,58,49,48,46,48,48,48,90,11,54,49,46,50,48,59,56,49,46,51,57,175,145,202,126,126,0,1,50,48,50,52,45,49,50,45,48,49,84,48,48,58,51,48,58,49,49,46,48,48,48,90,11,54,49,46,49,56,59,56,49,46,52,48,74,238,200,126,126,0,1,50,48,50,52,45,49,50,45,48,49,84,48,48,58,51,48,58,49,50,46,48, 48,48,90,11,54,49,46,49,55,59,56,49,46,52,49,10,62,255,126,126,0,1,50,48,50,52,45,49,50,45,48,49,84,48,48,58,51,48,58,49, 51,46,48,48,48,90,11,54,49,46, 49,54,59,56,49,46,52,49,155,52,171,126,126,0,1,50,48,50,52,45, 49,50,45,48,49,84,48,48,58,51, 48,58,49,52,46,48,48,48,90,11,54,49,46,49,52,59,56,49,46,52, 50,225,11,156,126,126,0,1,50,48, 50,52,45,49,50,45,48,49,84,48, 48,58,51,48,58,49,53,46,48,48, 48,90,11,54,49,46,49,51,59,56, 49,46,52,51,162,89,13,126,126,0, 1,50,48,50,52,45,49,50,45,48, 49,84,48,48,58,51,48,58,49,54, 46,48,48,48,90,11,54,49,46,49, 50,59,56,49,46,52,52,58,247,248]

checked=pocket_check(buf,start_t[st_count][0]);
//console.log(pocket)
if(checked[1]){
    //a=b[125];
    pocket=checked[0];
    console.log(pocket)
    flag=1;
}
var flight_time=0;
while(1){
        if (flight_time > start_t[st_count][1] && flight_time < stop_t[st_count]){
            hz_flag=1;
        }
        if (flight_time > stop_t[st_count] && st_count < stop_t.length-1){
            st_count+=1;
            hz_flag=0;
        }
        if (flight_time>last_h_send+2 && flag==1 &&hz_flag==1){

            last_h_send=flight_time;

            if (n_pck<pocket.length-1){
                var to_send=new Uint8Array(pocket[n_pck]);
                n_pck+=1;
                to_send[1]=start_t[st_count][0];
                var crc = crc16(to_send.slice(1,-3),0,to_send.slice(1,-3).length);
                let lowcrc = (crc & 0xff);
                let highcrc = ((crc >> 8) & 0xff);
                to_send[to_send.length-2]=lowcrc;
                to_send[to_send.length-3]=highcrc;
                console.log(to_send);
                console.log(start_t[st_count][0]);
                if(n_pck>2800){
                    //a=b[125];
                }
            }
        }
    
    if (flight_time>80600){
        break
    }
    flight_time+=0.5;
}