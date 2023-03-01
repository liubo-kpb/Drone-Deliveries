import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8080');

ws.on('error', console.error);

ws.on('open', function open() {
  ws.send('Received new order');
});

ws.on('message', function message(data) {
  console.log('received: %s', data);
});
