const clients = new Map();
const clientSockets = [];

const WebSocket = require('ws');

// Create a WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

console.log('WebSocket server is running on ws://localhost:8080');

// Connection event handler
wss.on('connection', (ws,req) => {
  console.log('New client connected from '+req.socket.remoteAddress);
  
  // Message event handler
  ws.on('message', (message) => {
      const m=JSON.parse(message);
      const t=Date.now();
      //console.log('Received: '+message);
      if(m.sessionId) {
          if(m.trackList) {
              console.log('Received trackList: '+m.trackList);
              clientSockets.forEach((socket) => {
                  socket.send(JSON.stringify(m));
              });
          } else {
              clients.set(m.sessionId,{"x":m.x,"y":m.y,"z":m.z,"rx":m.rx,"ry":m.ry,"rz":m.rz,"avatarId":m.avatarId,"t":t});
          }
      }
      ws.send(JSON.stringify(Array.from(clients.entries())));
  });

  // Close event handler
  ws.on('close', () => {
    console.log('Client disconnected');
  });
  
  // Send a welcome message to the client
  ws.send(JSON.stringify(Array.from(clients.entries())));
  clientSockets.push(ws);
}); 

let removeInactiveClients = function() {
    const t=Date.now();
    //console.log("removeInactiveClients @"+t);
    clients.forEach((value, key) => {
        let inactiveSince=t-value.t;
        console.log("- "+key+" "+inactiveSince);
        if(inactiveSince>10000) {
            console.log("-> deleted");
            clients.delete(key);
        }
    });
    setTimeout(removeInactiveClients, 1000);
}

setTimeout(removeInactiveClients, 1000);