
var receiver;
var transmitter ;
let pre_ambale= 123;
let post_ambale= 125;
let addr_d = 4;
let addr_s = 1;

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

let received_buf=[123,4,1,116,104,125,123,115,32,105,115,32,103,111,111,100,116,182,137,125,0,1,230,2,21,123,4,1,116,104,105,115,32,105,115,32,103,111,111,100,116,18,226,125,123,4,1,116,104,105,115,32,105,115,32,103,111,111,100,116,182,137,125]
//received_buf=[123,4,1,116,104,105,115,32,105,115,32,103,111,111,100,116,137,79,125,123]
//16362
while (1){
    console.log("start")
    console.log(received_buf)
   
    while (received_buf[0]!=pre_ambale && received_buf[1]!=addr_d && received_buf[2]!=addr_s){
        received_buf.splice(0,3)
    }

    //console.log(received_buf)
    var received_packet=[];
    for (var i = 13; i < received_buf.length-1 && i<102; ++i) {
        //console.log(received_buf[13])
        if (received_buf[i]==post_ambale && received_buf[i+1]==pre_ambale){
            console.log("start2")
            received_packet=received_buf.slice(0,i+1)
            received_buf.splice(0,received_packet.length)
            console.log(received_packet);
            var in_crc = (((received_packet.slice(-3,-2) & 0xff) << 8) | (received_packet.slice(-2,-1) & 0xff));
            
            console.log(received_packet.slice(1,-3))
            var crc = crc16(received_packet.slice(1,-3),0,received_packet.slice(1,-3).length);
            console.log(received_packet.slice(1,-3))
            console.log(in_crc);
            console.log(crc);
            if (in_crc === crc){
                console.log("true")
                console.log(received_packet);
            }
            
        }
    }
    //console.log(received_buf)
    //console.log(received_packet)
    
    var in_crc = (((received_packet.slice(-3,-2) & 0xff) << 8) | (received_packet.slice(-2,-1) & 0xff));
    
    var crc = crc16(received_packet.slice(1,-3),0,received_packet.slice(1,-3).length);
    
    if ((in_crc === crc)&&(pre_ambale==received_packet.slice(0,1))&&(post_ambale==received_packet.slice(-1))){
        console.log("true")
    } 
    console.log("end")
}

