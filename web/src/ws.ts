import config from './config/config';
import { WebSocketServer, WebSocket } from 'ws';
import fs from 'node:fs';
import { execSync } from 'child_process';
import { WorldObject } from './models/worldObject';

// Create WebSocket server
const wsServer = new WebSocketServer({port: config.port_ws});

const worldObjects = new Map();
const worldConfigs = new Map();
const clients = new Map();
const clientSockets = new Map();

export default function initWs() {

    // Prepare session dir
    if(fs.existsSync("sessions")) {console.log("Found sessions dir");}
    else {fs.mkdirSync("sessions"); console.log("Made sessions dir");}

    // Init worldObjects
    let dir=fs.readdirSync(config.web_path+'/loops');
    console.log(dir);
    dir.forEach((worldId,i) => {
        let configFileName=config.web_path+'/loops/'+worldId+"/worldObjects.json";
        console.log(configFileName);

        if(fs.existsSync(configFileName)) {
            const data = fs.readFileSync(configFileName, 'utf8');
            const dataJson = JSON.parse(data);
            console.log("exists: "+JSON.stringify(dataJson));
            let dataMap = new Map();
            dataJson.forEach( (worldObject : WorldObject ) => {
                console.log(" - add worldObject " + worldObject.url + " " +worldObject);
                dataMap.set(worldObject.url,worldObject);
            });
            worldObjects.set(worldId,dataMap);
            console.log("created worldObject: "+worldObjects.get(worldId));
            console.log("from map: "+JSON.stringify(dataMap));
        }

        configFileName=config.web_path+'/loops/'+worldId+"/worldConfig.json";
        console.log(configFileName);
        if(fs.existsSync(configFileName)) {
            const data = fs.readFileSync(configFileName, 'utf8');
            const dataJson = JSON.parse(data);
            console.log("exists: "+dataJson);
            worldConfigs.set(worldId,dataJson);
            console.log("created worldConfigs: "+JSON.stringify(worldConfigs.get(worldId)));
        }
    });

    // Connection event handler
    wsServer.on('connection', (ws,req) => {
      console.log('New client connected from '+req.socket.remoteAddress);

      // Message event handler
      ws.on('message', (message, isBinary) => {
          const msgAsString = message.toString('utf-8');
          const m = JSON.parse(msgAsString);

          if(m.trackList) {
              console.log('Received trackList: '+m.trackList);

              let track: WorldObject = m.trackList[0];

              if(worldObjects.has(m.worldId)===false) {
                  worldObjects.set(m.worldId,new Map());
              }

              let worldMap = worldObjects.get(m.worldId);
              worldMap.set(track.url,track);

              console.log('Set trackList: '+track.url);

              let result = execSync(`mkdir -p ${config.web_path}/loops/${m.worldId}`);
              fs.writeFileSync(config.web_path+'/loops/'+m.worldId+'/worldObjects.json', JSON.stringify(Array.from(worldMap.values()),null,'\t'));

              clientSockets.forEach((socket,key) => {
                  if(key!==m.sessionId) {
                      console.log("forwarding trackList to "+key);
                      socket.send(JSON.stringify(m));
                  }
              });
          } else if(m.sessionId) {
                //console.log('Received msg sessionId: '+m.sessionId);
                if(clientSockets.has(m.sessionId)) {
                    m.t=Date.now();
                    clients.set(m.sessionId,m);
                } else {
                    console.log("Adding client socket for "+m.sessionId);
                    clientSockets.set(m.sessionId,ws);

                    // - list of clients
                    let worldId = m.worldId;
                    let worldMap = worldObjects.get(worldId);
                    console.log('Sending world track list '+worldId);
                    if(worldMap) {
                        ws.send(JSON.stringify({"sessionId":"","worldId":worldId,"trackList":Array.from(worldMap.values())}));
                    }

                    let worldConfig = worldConfigs.get(worldId);
                    console.log('Sending world config list '+worldConfig);
                    if(worldConfig) {
                        ws.send(JSON.stringify(worldConfig));
                    }
                }
              ws.send(JSON.stringify(Array.from(clients.entries())));
          } else if(m.chords) {
              let result = execSync(`mkdir -p ${config.web_path}/loops/${m.worldId}`);
              worldConfigs.set(m.worldId,m);
              fs.writeFileSync(config.web_path+'/loops/'+m.worldId+'/worldConfig.json', JSON.stringify(m, null,'\t'));
          }
      });

      // Close event handler
      ws.on('close', () => {
        console.log('Client disconnected '+req.socket.remoteAddress);
      });

      // Send as a welcome
      // - list of clients
      console.log('Sending clients list');
      ws.send(JSON.stringify(Array.from(clients.entries())));

    });

    setTimeout(removeInactiveClients, 1000);
    console.log("wsServer started");
}

function removeInactiveClients() {
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
