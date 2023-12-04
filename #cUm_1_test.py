#cUm_1_test
import random

PMH_ON = 0
VER=100
COUNT=5

def crc16(data : bytearray, offset , length):
    if data is None or offset < 0 or offset > len(data)- 1 and offset+length > len(data):
        return 0
    crc = 0xFFFF
    for i in range(0, length):
        crc ^= data[offset + i] << 8
        for j in range(0,8):
            if (crc & 0x8000) > 0:
                crc =(crc << 1) ^ 0x1021
            else:
                crc = crc << 1
    return crc & 0xFFFF

buf=[]
b=0
for i in range(COUNT):

    pre_ambale= 123
    post_ambale= 125
    addr_dest = 4
    addr_sor = 1

    pocket=[pre_ambale]
    data=[addr_dest,addr_sor]
    for i in range(random.randint(8, 98)):
        data.append(random.randint(0, 254))
    crc=crc16(data,0,len(data))
    lowcrc = (crc & 0xff)
    highcrc = ((crc >> 8) & 0xff)
    incrc=((highcrc & 0xff) << 8) | (lowcrc & 0xff)
    pocket+=data+[highcrc,lowcrc,post_ambale]
    print(crc,incrc)
    flag=0
    for i in range(len(pocket)):
        if random.randint(0, VER)<PMH_ON:
            pocket[i]+=1
            flag=1
    b+=flag
    print(lowcrc)
    print(highcrc)
    print(pocket)
    buf+=pocket
print(buf)
print(COUNT-b,b)
f=open('output.txt', 'w') 
f.write(str(buf))







