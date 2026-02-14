import http.client
import json

print("Testing login with email...")
conn = http.client.HTTPConnection("localhost", 8000)
headers = {'Content-type': 'application/json'}
payload = json.dumps({"email": "epsshahid@gmail.com", "password": "password123"})
conn.request("POST", "/api/v1/auth/login/", payload, headers)
res = conn.getresponse()
data = res.read()
print(res.status, res.reason)
print(data.decode("utf-8"))
