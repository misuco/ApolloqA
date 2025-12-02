const fs = require('fs')

const clients = new Map();
const clientTrackLists = new Map();
const clientSockets = new Map();

const pastClients = new Map();
const pastTrackLists = new Map();

const WebSocket = require('ws');

// Create a WebSocket server on port 3038 
const wss = new WebSocket.Server({ port: 3038 });
console.log('WebSocket server is running on ws://localhost:3038');

// Prepare session dir
if(fs.existsSync("sessions")) {console.log("Found sessions dir");}
else {fs.mkdirSync("sessions"); console.log("Made sessions dir");}

// Read past clients
var files = fs.readdirSync('sessions/');
console.log("Reading past clients");
files.forEach(file => { 
    //console.log(file);
    const trackListFile="sessions/"+file+"/trackList.json";
    if(fs.existsSync(trackListFile)) {
        const trackList = fs.readFileSync(trackListFile);
        if(trackList) {
            const client = JSON.parse(fs.readFileSync("sessions/"+file+"/client.json"));
            console.log("active tracklist by "+client.nickname);
            pastClients.set(file,client);
        }
    }
});
//console.log(pastClients);


// Connection event handler
wss.on('connection', (ws,req) => {
  console.log('New client connected from '+req.socket.remoteAddress);
  
  // Message event handler
  ws.on('message', (message) => {
      let m=JSON.parse(message);
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
              m.t=t;
              clients.set(m.sessionId,m);
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
        if(inactiveSince>3000) {
            let sessionDir="sessions/"+key;
            if(fs.existsSync(sessionDir)) { console.log("Found sessions dir "+sessionDir); }
            else { fs.mkdirSync(sessionDir);console.log("Cerated sessions dir "+sessionDir); }
            console.log("Storing "+JSON.stringify(clients.get(key)));
            fs.writeFileSync(sessionDir+'/client.json', JSON.stringify(clients.get(key)));
            const trackList=clientTrackLists.get(key);
            if(trackList){
                console.log("Storing "+JSON.stringify(trackList));
                fs.writeFileSync(sessionDir+'/trackList.json', JSON.stringify(trackList));
            }
            
            // add to past clients list
            pastClients.set(key,clients.get(key));
            
            // update the other clients
            const pastClientsUpdate=new Map();
            pastClientsUpdate.set(key,clients.get(key))
            
            clientSockets.delete(key);
            clientSockets.forEach((socket,socketKey) => {
                console.log("past client update to "+socketKey);
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
