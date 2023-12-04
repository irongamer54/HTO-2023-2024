// Online Javascript Editor for free
// Write, Edit and Run your Javascript code using JS Online Compiler

var receiver;
var transmitter ;
let pre_ambale= 123;
let post_ambale= 125;
var n =0;

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
let received_buf=[123, 4, 1, 101, 157, 32, 72, 37, 140, 133, 153, 223, 89, 135, 39, 72, 112, 221, 92, 103, 211, 191, 153, 193, 155, 174, 173, 6, 37, 204, 251, 34, 49, 101, 83, 111, 3, 124, 242, 22, 175, 91, 62, 37, 124, 78, 145, 42, 229, 15, 120, 187, 172, 221, 178, 69, 0, 173, 164, 237, 201, 12, 103, 248, 121, 99, 80, 240, 253, 214, 29, 228, 167, 171, 98, 5, 11, 130, 42, 32, 16, 235, 19, 148, 125, 123, 4, 1, 124, 182, 235, 248, 107, 137, 43, 36, 58, 249, 240, 106, 180, 61, 31, 135, 69, 200, 21, 88, 141, 173, 106, 81, 223, 185, 228, 57, 214, 78, 180, 217, 137, 225, 136, 237, 74, 167, 186, 228, 176, 237, 242, 114, 126, 239, 148, 243, 123, 146, 152, 249, 159, 42, 147, 53, 148, 196, 125, 123, 4, 1, 73, 50, 251, 90, 41, 150, 155, 194, 23, 0, 61, 191, 133, 105, 230, 144, 156, 82, 9, 118, 41, 9, 142, 73, 84, 169, 62, 195, 164, 209, 9, 74, 37, 158, 241, 183, 7, 62, 217, 22, 181, 82, 35, 31, 218, 112, 18, 129, 234, 46, 105, 206, 128, 140, 10, 33, 180, 201, 177, 149, 155, 128, 98, 22, 229, 186, 144, 217, 22, 153, 179, 54, 106, 68, 107, 82, 125, 123, 4, 1, 186, 47, 31, 112, 62, 96, 135, 19, 157, 236, 49, 119, 103, 172, 72, 195, 195, 152, 155, 145, 77, 144, 213, 22, 36, 97, 231, 146, 36, 147, 127, 248, 21, 163, 171, 68, 212, 140, 25, 55, 49, 120, 151, 41, 122, 127, 204, 115, 40, 81, 37, 145, 25, 29, 44, 209, 247, 48, 201, 37, 206, 182, 63, 214, 242, 2, 87, 212, 222, 153, 67, 125, 123, 4, 1, 154, 20, 220, 217, 126, 35, 181, 58, 197, 44, 87, 125]
//&& received_buf.length>0
pocket_chek(received_buf)
function pocket_chek(received_buf){
    received_buf.push(pre_ambale)
    while (1){
        
        if (received_buf.length>0){
            while (received_buf[0]!=pre_ambale ){
                received_buf.splice(0,1)
               console.log("slice")
            }
            console.log(received_buf)
            var received_packet=[];
            for (var i = 10; i < received_buf.length-1 && i<102; ++i) {
                //console.log(received_buf[13])
                if (received_buf[i]==post_ambale && received_buf[i+1]==pre_ambale){
                    received_packet=received_buf.slice(0,i+1)
                    received_buf.splice(0,received_packet.length)
                    break;
                    
                }
            }
            //console.log(received_buf)
            console.log(received_packet)
            
            var in_crc = (((received_packet.slice(-3,-2) & 0xff) << 8) | (received_packet.slice(-2,-1) & 0xff));
            console.log(in_crc)
            var crc = crc16(received_packet.slice(1,-3),0,received_packet.slice(1,-3).length);
            console.log(crc)
            if ((in_crc === crc)&&(pre_ambale==received_packet.slice(0,1))&&(post_ambale==received_packet.slice(-1))){
                console.log("true")
                n+=1
            } 
            console.log(n)
            console.log("end")
        }
    }
}


