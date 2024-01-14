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


class retr_sat{
    pre_ambale = 126;
    post_ambale = 126;
    addr_source = 1;
    addr_dest = [0,1,2];
    simulation_start=0;
    flight_time=0;
    last_send=0;
    last_h_send=0;

    flag_1=1;
    flag=0;
    hz_flag=0;

    n_pck=0;

    st_count=0;

    pocket=[];
    checked=[];
    received_buf=[];

    start_t=[
        [2,11120],
        [0,24187],
        [0,46897],
        [1,55310],
        [2,60321],
        [1,78373]
    ]
    stop_t=[
        11953,
        25925,
        49145,
        56059,
        61554,
        80576
    ]

    constructor(simulation_start){
        this.simulation_start=simulation_start;
        
    }

    pocket_check(received_buf,n_g){
        var n = 0;
        var k = 0;
        var end_flag=0;
        received_buf.push(this.pre_ambale);
        var trans_pockets = [];
        //console.log(received_buf)
        while (received_buf.length > 14){
            
                while (received_buf[0] != this.pre_ambale ){
                    received_buf.splice(0,1);
                }
    
                var received_packet = [];
                var flag=1;
                //console.log(received_buf)
                for (var i = 12; i < received_buf.length+1 && i < 130; ++i) {
                    if (received_buf[i] == this.post_ambale && received_buf[i+1] == this.pre_ambale){
                        received_packet=received_buf.slice(0,i+1);
                        var in_crc = (((received_packet.slice(-3,-2) & 0xff) << 8) | (received_packet.slice(-2,-1) & 0xff));
    
                        var crc = crc16(received_packet.slice(1,-3),0,received_packet.slice(1,-3).length);
    
                        if ((in_crc == crc) && (this.pre_ambale == received_packet.slice(0,1)) && (this.post_ambale == received_packet.slice(-1))){
                            received_packet[1]=this.addr_dest[n_g];
                            received_packet[2]=this.addr_source;
                            crc = crc16(received_packet.slice(1,-3),0,received_packet.slice(1,-3).length);
                            let lowcrc = (crc & 0xff);
                            let highcrc = ((crc >> 8) & 0xff);
                            received_packet[received_packet.length-2]=lowcrc;
                            received_packet[received_packet.length-3]=highcrc;
                            end_flag=1;
                            n+=1;
                            trans_pockets.push(received_packet);
                            received_buf.splice(0,received_packet.length);
                            flag=0;
                            break;
                        } else{
                            k+=1;
                        }
                    }
                    //console.log(received_packet)
                }
                //console.log(received_packet)
                if (flag){
                    received_buf.splice(0,1);
            }
        }
        return [trans_pockets,end_flag];
    }

    loop(in_buf){
        this.received_buf.push(...in_buf)
        this.flight_time+=0.1;
        if(this.flight_time > 49000 && this.flag==0){
            this.checked=this.pocket_check(this.received_buf,this.start_t[this.st_count][0]);
            if(this.checked[1]){
                //a=b[125];
                this.pocket=this.checked[0];
                if(this.pocket.length>3000){
                    //a=b[125];
                }
                this.flag=1;
            }
        }
        if (this.flight_time > this.start_t[this.st_count][1] && this.flight_time < this.stop_t[this.st_count]){

            this.hz_flag=1;
            //this.n_pck=0;
        }
        if (this.flight_time > this.stop_t[this.st_count] && this.st_count < this.stop_t.length-1 && this.hz_flag){
            this.st_count+=1;
            this.hz_flag=0;
        }
        if (this.flight_time>this.last_h_send+1 && this.flag==1 && this.hz_flag==1){

            this.last_h_send=this.flight_time;

            if (this.n_pck<this.pocket.length-1){
                var to_send=this.pocket[this.n_pck];
                to_send[1]=this.start_t[this.st_count][0];
                crc = crc16(to_send.slice(1,-3),0,to_send.slice(1,-3).length);
                let lowcrc = (crc & 0xff);
                let highcrc = ((crc >> 8) & 0xff);
                to_send[to_send.length-2]=lowcrc;
                to_send[to_send.length-3]=highcrc;
                this.n_pck+=1;
                //console.log(to_send)
                return to_send;
        }
        }
        
    }
}


class nauch_sat{
    pre_ambale = 126;
    post_ambale = 126;
    addr_source = 1;
    addr_dest = 0;
    
    simulation_start=0;
    flight_time=0;
    flag=0;
    last_get=0;
    last_h_send=0;
    pocket=[];


    constructor(simulation_start){
        this.simulation_start=simulation_start;
    }
    get_data(){
        let location=[42.4543,54.21321];
        let datetimes = (new Date((this.simulation_start+ this.flight_time)*1000)).toISOString();
        let cords = location[0].toFixed(2)+ ';' +location[1].toFixed(2);
        let packet = new Uint8Array([...datetimes.split("").map(x => x.charCodeAt()), cords.length, ...cords.split("").map(x => x.charCodeAt()), Math.floor(Math.random() * 255)]);
        return packet;
    }
    new_pocket(){
        let load = this.get_data()
        if(load.length>5){
            let pocket=[this.pre_ambale]
            let data=[0,this.addr_source,...load]
            let crc=crc16(data,0,data.length)
            let lowcrc = (crc & 0xff)
            let highcrc = ((crc >> 8) & 0xff)
            pocket.push(...data,highcrc,lowcrc,this.post_ambale)
            return pocket
        }
    }
    loop(){
        this.flight_time+=0.1;

        if (this.flight_time>this.last_get+1){
            this.pocket.push(...this.new_pocket());
            //console.log(this.pocket)
            this.last_get=this.flight_time;
        }
        if(this.flight_time>30797 && this.flight_time<48472){
            if(this.pocket.length>0){
                if(this.flight_time>this.last_h_send+1){
                    this.last_h_send=this.flight_time
                    var to_send=this.pocket.splice(0,10);
                    //console.log("212",to_send)
                    to_send=new Uint8Array(to_send);
                    return to_send;
                }
            }
        }
        return []
    }
}
var n =0;
var n_0 =0;
var n_1 =0;
var n_2 =0;
var n_sat = new nauch_sat(1733011200);
var r_sat = new retr_sat(1733011200);
while(n_sat.flight_time<86400){
    var a=r_sat.loop(n_sat.loop())
    if (typeof a!="undefined"){
        var in_crc = (((a.slice(-3,-2) & 0xff) << 8) | (a.slice(-2,-1) & 0xff));
        var crc = crc16(a.slice(1,-3),0,a.slice(1,-3).length);
        if (a[1]==0){
            n_0++;
        }
        if (a[1]==1){
            n_1++;
        }
        if (a[1]==2){
            n_2++;
        }
        console.log(a,in_crc==crc,n_sat.flight_time)
        n+=1
    }
}
console.log(n_0,n_1,n_2,n)
//console.log(r_sat.pocket_chek(n_sat.pocket,1))