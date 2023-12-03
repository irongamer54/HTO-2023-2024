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
let received_buf=[123, 4, 1, 208, 249, 161, 84, 58, 56, 104, 112, 148, 45, 8, 215, 67, 71, 37, 227, 73, 214, 222, 82, 8, 74, 27, 168, 228, 148, 187, 107, 3, 108, 207, 138, 126, 0, 223, 56, 83, 123, 109, 119, 220, 103, 123, 140, 39, 146, 237, 132, 184, 216, 139, 238, 12, 160, 207, 160, 113, 181, 71, 65, 201, 194, 227, 81, 105, 199, 158, 25, 37, 138, 194, 218, 78, 158, 127, 21, 66, 240, 238, 160, 124, 106, 195, 242, 159, 20, 225, 220, 113, 217, 208, 206, 245, 50, 0, 169, 125, 123, 4, 1, 31, 185, 113, 241, 80, 192, 26, 35, 209, 139, 123, 68, 16, 180, 48, 168, 177, 214, 113, 198, 72, 76, 36, 149, 248, 236, 38, 34, 175, 125, 123, 4, 1, 224, 12, 69, 196, 96, 93, 20, 138, 12, 49, 186, 70, 120, 131, 219, 51, 149, 34, 212, 26, 133, 238, 48, 82, 0, 201, 201, 126, 16, 198, 194, 13, 237, 173, 143, 138, 201, 69, 180, 73, 109, 160, 248, 244, 190, 135, 90, 156, 174, 42, 29, 118, 40, 41, 201, 231, 171, 48, 111, 80, 170, 218, 147, 137, 41, 162, 1, 130, 108, 140, 125, 123, 4, 1, 133, 61, 207, 45, 243, 192, 90, 209, 18, 237, 253, 182, 194, 3, 28, 122, 226, 116, 211, 254, 116, 119, 28, 14, 52, 242, 246, 23, 254, 72, 244, 147, 204, 225, 70, 207, 124, 8, 219, 130, 221, 231, 31, 202, 205, 132, 157, 50, 32, 56, 196, 140, 63, 156, 209, 57, 251, 217, 231, 92, 228, 150, 97, 201, 57, 185, 154, 180, 164, 166, 174, 125, 123, 4, 1, 122, 244, 125, 219, 126, 239, 87, 164, 58, 149, 28, 70, 145, 23, 147, 147, 63, 169, 151, 48, 237, 52, 177, 154, 182, 180, 17, 188, 208, 82, 208, 91, 227, 209, 234, 208, 190, 109, 152, 42, 155, 155, 153, 166, 240, 88, 90, 239, 19, 141, 198, 126, 220, 123, 61, 92, 132, 155, 228, 246, 247, 205, 137, 127, 17, 145, 59, 24, 1, 51, 37, 136, 125]
while (1){
while (received_buf[0]!=pre_ambale){
    received_buf.splice(0,1)
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


