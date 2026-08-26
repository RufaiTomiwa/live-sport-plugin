import requests

url = 'https://embed.st/fetch'
headers = {
    'accept': '*/*',
    'content-type': 'application/x-protobuf',
    'origin': 'https://embed.st',
    'referer': 'https://embed.st/embed/admin/admin-tennis-channel/1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
}

# The protobuf we discovered:
# Field 1 (string): "admin"
# Field 2 (string): "admin-tennis-channel"
# Field 3 (string): "1"
payload = b'\x0A\x05admin\x12\x14admin-tennis-channel\x1A\x011'

r = requests.post(url, headers=headers, data=payload)
print(f"Status: {r.status_code}")
print(f"Response length: {len(r.content)}")

with open('encrypted.bin', 'wb') as f:
    f.write(r.content)
print("Saved to encrypted.bin")
