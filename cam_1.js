// https://www.programiz.com/javascript/online-compiler/

var receiver;
var transmitter;
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
let received_buf=[123, 4, 1, 247, 252, 163, 56, 180, 98, 242, 207, 114, 148, 187, 174, 241, 15, 53, 178, 193, 194, 83, 69, 174, 244, 229, 38, 173, 223, 228, 188, 101, 167, 36, 187, 153, 154, 133, 129, 213, 101, 109, 122, 83, 180, 92, 115, 44, 253, 207, 232, 76, 136, 190, 162, 112, 26, 62, 53, 0, 164, 13, 137, 142, 195, 230, 36, 233, 82, 73, 193, 170, 200, 248, 85, 186, 148, 97, 193, 95, 130, 125, 123, 4, 1, 145, 114, 125, 107, 222, 189, 248, 152, 216, 78, 71, 128, 144, 235, 16, 0, 80, 91, 14, 142, 125, 123, 4, 1, 172, 248, 15, 104, 89, 209, 80, 29, 44, 240, 32, 240, 137, 4, 35, 217, 247, 52, 254, 92, 12, 127, 14, 220, 71, 97, 10, 95, 215, 213, 227, 251, 162, 31, 6, 57, 119, 213, 135, 93, 216, 158, 176, 188, 239, 11, 30, 185, 140, 191, 73, 35, 166, 68, 28, 17, 248, 46, 60, 207, 90, 77, 150, 167, 236, 90, 242, 178, 252, 177, 52, 27, 91, 37, 103, 104, 181, 214, 224, 221, 150, 57, 164, 78, 87, 214, 35, 202, 242, 11, 79, 125, 123, 4, 1, 110, 109, 70, 91, 106, 45, 143, 71, 198, 204, 124, 9, 177, 203, 142, 143, 248, 125, 209, 120, 113, 133, 224, 192, 226, 208, 230, 188, 125, 118, 120, 35, 218, 159, 13, 200, 5, 41, 244, 92, 77, 203, 229, 242, 226, 207, 197, 0, 200, 229, 119, 240, 5, 134, 78, 41, 232, 125, 123, 4, 1, 156, 129, 118, 250, 234, 21, 32, 46, 124, 23, 229, 49, 202, 117, 29, 92, 57, 74, 1, 77, 179, 39, 234, 219, 84, 245, 111, 253, 31, 56, 125, 28, 219, 116, 63, 192, 155, 158, 136, 205, 212, 78, 174, 110, 68, 204, 92, 107, 188, 18, 16, 32, 187, 140, 154, 63, 245, 117, 98, 96, 44, 160, 165, 92, 76, 190, 231, 143, 67, 109, 155, 10, 252, 118, 156, 153, 142, 101, 145, 50, 125]

function pocket_chek(received_buf){
    var n = 0;
    var k = 0;
    received_buf.push(pre_ambale)
    var trans_pockets=[]
    while (received_buf.length>14){
        
        if (received_buf.length>0){
            while (received_buf[0]!=pre_ambale ){
                received_buf.splice(0,1)
               //console.log("slice")
            }
            //console.log(received_buf)
            var received_packet=[];
            var flag=1;
            for (var i = 10; i < received_buf.length-1 && i<102; ++i) {
                //console.log(received_buf[13])
                if (received_buf[i]==post_ambale && received_buf[i+1]==pre_ambale){
                    received_packet=received_buf.slice(0,i+1)
                    received_buf.splice(0,received_packet.length)
                    flag=0
                    break;
                }
            }
            if (flag){
                received_buf.splice(0,1)
               // console.log("lol")
            }else{
                //console.log(received_buf)
                //console.log(received_packet)
                
                var in_crc = (((received_packet.slice(-3,-2) & 0xff) << 8) | (received_packet.slice(-2,-1) & 0xff));
                //console.log(in_crc)
                var crc = crc16(received_packet.slice(1,-3),0,received_packet.slice(1,-3).length);
                //console.log(crc)
                if ((in_crc === crc)&&(pre_ambale==received_packet.slice(0,1))&&(post_ambale==received_packet.slice(-1))){
                    n+=1
                    trans_pockets.push(received_packet)
                    
                } else{
                    k+=1
                }
                //console.log([n,k])
            }
        }
    }
    return [trans_pockets,n,k]
}
var a = pocket_chek(received_buf)
console.log(a[0][0])
console.log(a[1])
console.log(a[2])



