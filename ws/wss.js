const fs = require('fs')

const clients = new Map();
const clientTrackLists = new Map();
const clientSockets = new Map();

const pastClients = new Map();
const pastTrackLists = new Map();

const WebSocket = require('ws');

// Create a WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });
console.log('WebSocket server is running on ws://localhost:8080');

// Prepare session dir
if(fs.existsSync("sessions")) {console.log("Found sessions dir");}
else {fs.mkdirSync("sessions"); console.log("Made sessions dir");}

// Read past clients
var files = fs.readdirSync('sessions/');
console.log("Reading past clients");
files.forEach(file => { 
    //console.log(file);
    const client = JSON.parse(fs.readFileSync("sessions/"+file+"/client.json"));
    pastClients.set(file,client);
});
//console.log(pastClients);


// Connection event handler
wss.on('connection', (ws,req) => {
  console.log('New client connected from '+req.socket.remoteAddress);
  
  // Message event handler
  ws.on('message', (message) => {
      const m=JSON.parse(message);
      const t=Date.now();
      //console.log('Received ip: '+wsIp+' msg: '+message);
      if(m.sessionId) {
          if(clientSockets.has(m.sessionId)===false){
              console.log("Adding client socket for "+m.sessionId);
              clientSockets.set(m.sessionId,ws);
          }
          if(m.trackList) {
              console.log('Received trackList: '+m.trackList);
              clientTrackLists.set(m.sessionId,m.trackList);
              clientSockets.forEach((socket,key) => {
                  if(key!==m.sessionId) {
                      console.log("forwarding trackList to "+key);
                      socket.send(JSON.stringify(m));
                  }
              });
          } else {
              clients.set(m.sessionId,{"x":m.x,"y":m.y,"z":m.z,"rx":m.rx,"ry":m.ry,"rz":m.rz,"avatarId":m.avatarId,"nickname":m.nickname,"t":t});
          }
      }
      ws.send(JSON.stringify(Array.from(clients.entries())));
  });

  // Close event handler
  ws.on('close', () => {
    console.log('Client disconnected '+req.socket.remoteAddress);
  });
  
  // Send as a welcome
  // - list of clients
  console.log('Sending clients list');
  ws.send(JSON.stringify(Array.from(clients.entries())));
  
  // - list of past clients
  console.log('Sending past clients list');
  ws.send('{"pastClients":'+JSON.stringify(Array.from(pastClients.entries()))+'}');
});

let removeInactiveClients = function() {
    const t=Date.now();
    //console.log("removeInactiveClients @"+t);
    clients.forEach((value, key) => {
        let inactiveSince=t-value.t;
        //console.log("- "+key+" "+inactiveSince);
        if(inactiveSince>10000) {
            fs.mkdirSync("sessions/"+key);
            console.log("Storing "+JSON.stringify(clients.get(key)));
            fs.writeFileSync("sessions/"+key+'/client.json', JSON.stringify(clients.get(key)));
            fs.writeFileSync("sessions/"+key+'/trackList.json', JSON.stringify(clientTrackLists.get(key)));
            
            // add to past clients list
            pastClients.set(key,clients.get(key));
            
            // update the other clients
            const pastClientsUpdate=new Map();
            pastClientsUpdate.set(key,clients.get(key))
            
            clientSockets.delete(key);
            clientSockets.forEach((socket,socketKey) => {
                console.log("forwarding trackList to "+socketKey);
                socket.send('{"pastClients":'+JSON.stringify(Array.from(pastClientsUpdate.entries()))+'}');
            });
            
            clients.delete(key);
            clientTrackLists.delete(key);
            console.log("deleted session "+key);
        }
    });
    setTimeout(removeInactiveClients, 1000);
}

setTimeout(removeInactiveClients, 1000);