import app from './app';
import config from './config/config';
import { WebSocketServer, WebSocket } from 'ws';
import * as fs from 'fs';
import { execSync } from 'child_process';

type WorldTrack = {
    x: number
    y: number
    z: number
    trackUrl: string
    trackName: string
    creator: string
}

// Create WebSocket server
const wsServer = new WebSocketServer({port: config.port_ws});

const worldTrackList = new Map();

const clients = new Map();
const clientSockets = new Map();

// Prepare session dir
if(fs.existsSync("sessions")) {console.log("Found sessions dir");}
else {fs.mkdirSync("sessions"); console.log("Made sessions dir");}

// Connection event handler
wsServer.on('connection', (ws,req) => {
  console.log('New client connected from '+req.socket.remoteAddress);

  // Message event handler
  ws.on('message', (message, isBinary) => {
      const msgAsString = message.toString('utf-8');
      const m = JSON.parse(msgAsString);
      const t=Date.now();

      //console.log('Received msg: '+msgAsString);

      if(m.sessionId) {
          //console.log('Received msg sessionId: '+m.sessionId);
          if(clientSockets.has(m.sessionId)===false) {
              console.log("Adding client socket for "+m.sessionId);
              clientSockets.set(m.sessionId,ws);
          } else {
              m.t=t;
              clients.set(m.sessionId,m);
          }
      }

      if(m.trackList) {
          console.log('Received trackList: '+m.trackList);

          let trackListItem=m.trackList[0];
          let track: WorldTrack = trackListItem[1];

          if(worldTrackList.has(m.worldId)===false) {
              worldTrackList.set(m.worldId,new Map());
          }

          let worldMap = worldTrackList.get(m.worldId);
          worldMap.set(track.trackUrl,track);

          // worldTrackList.set(track.trackUrl,track);
          console.log('Set trackList: '+track.trackUrl);

          let result = execSync(`mkdir -p ${config.web_path}/loops/${m.worldId}`);
          fs.writeFileSync(config.web_path+'/loops/'+m.worldId+'/worldTrackList.json', JSON.stringify(Array.from(worldMap.entries()),null,'\t'));

          clientSockets.forEach((socket,key) => {
              if(key!==m.sessionId) {
                  console.log("forwarding trackList to "+key);
                  socket.send(JSON.stringify(m));
              }
          });
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

  // - list of clients
  console.log('Sending world track list');
  //ws.send(JSON.stringify({"sessionId":"","trackList":Array.from(worldTrackList.entries())}));

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

            clientSockets.delete(key);
            clients.delete(key);
            console.log("deleted session "+key);
        }
    });
    setTimeout(removeInactiveClients, 1000);
}

setTimeout(removeInactiveClients, 1000);

// start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
