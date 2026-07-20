const http = require('http');
const crypto = require('crypto');

const server = http.createServer((req, res) => {
  res.writeHead(404);
  res.end();
});

server.on('upgrade', (req, socket, head) => {
  const key = req.headers['sec-websocket-key'];
  const acceptKey = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  
  socket.write('HTTP/1.1 101 Switching Protocols\r\n' +
               'Upgrade: websocket\r\n' +
               'Connection: Upgrade\r\n' +
               'Sec-WebSocket-Accept: ' + acceptKey + '\r\n\r\n');

  socket.on('data', (buffer) => {
    try {
      // Very basic websocket frame parsing
      if (buffer.length < 2) return;
      let payloadLength = buffer[1] & 0x7F;
      let offset = 2;
      let maskKey = null;
      if (buffer[1] & 0x80) {
        if (payloadLength === 126) offset += 2;
        else if (payloadLength === 127) offset += 8;
        maskKey = buffer.slice(offset, offset + 4);
        offset += 4;
      }
      
      let payload = buffer.slice(offset);
      if (maskKey) {
        for (let i = 0; i < payload.length; i++) {
          payload[i] ^= maskKey[i % 4];
        }
      }
      
      const str = payload.toString('utf8');
      if (str.includes('okx-a2a.health')) {
        const idMatch = str.match(/"id"\s*:\s*([^,}]+)/);
        const id = idMatch ? Number(idMatch[1]) : 1;
        const resp = JSON.stringify({ jsonrpc: "2.0", id: id, result: { ok: true, ready: true } });
        
        const respBuf = Buffer.alloc(2 + Buffer.byteLength(resp));
        respBuf[0] = 0x81;
        respBuf[1] = Buffer.byteLength(resp);
        respBuf.write(resp, 2);
        socket.write(respBuf);
      }
    } catch(e) {}
  });
});

server.listen(18789, '127.0.0.1', () => {
  console.log('Mock WS running on 18789');
});
