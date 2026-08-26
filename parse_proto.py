import sys
with open('encrypted.bin', 'rb') as f:
    data = f.read()

# Very basic protoc parser
def parse_proto(data):
    i = 0
    while i < len(data):
        tag_type = data[i]
        tag = tag_type >> 3
        wire_type = tag_type & 7
        i += 1
        print(f"Tag: {tag}, Wire type: {wire_type}")
        if wire_type == 2: # length-delimited
            length = data[i]
            i += 1
            if length > 127:
                length = (length & 0x7F) | (data[i] << 7)
                i += 1
            print(f"Length: {length}")
            val = data[i:i+length]
            print(f"Value hex: {val.hex()}")
            i += length
            
parse_proto(data)
