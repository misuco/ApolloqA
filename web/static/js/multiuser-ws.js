/// Multiuser Websocket Feature
let otherUsers = new Map();
var allUsers;
let messageCount=0;
let sessionCount=0;

// holds to be loaded pastClient arrays [path,x,y,z]
let pastClientLoader = [];

// holds loaded pastClient objects {x:x,y:y....}
let pastClients = new Map();

// Connect to the WebSocket server
console.log("Connecting ws to "+aqa.wsUrl)

function initMultiuser() {
    aqa.ws = new WebSocket(aqa.wsUrl);
    
    // Connection opened
    aqa.ws.onopen = () => {
        console.log("Connected to server");
    };
    
    // Listen for messages
    aqa.ws.onmessage = (event) => {
    
        //console.log("onmessage");
        messageCount++;
        aqa.htmlGui.updateNetStatus(messageCount);
    
        const m=JSON.parse(event.data);
    
        if(m.pastClients) {
            //console.log("onmessage: "+event.data);
            m.pastClients.forEach((client)=> {
                const clientId=client[0];
                //console.log("Received past client i: "+clientId);
                const x=client[1].x;
                const y=client[1].y;
                const z=client[1].z;
                const a=client[1].avatarId;
                if( x && y && z && !pastClients.has(clientId) ) {
                    pastClientLoader.push(["obj/Planet_"+(a+1)+".gltf",x,y,z]);
                    pastClients.set(clientId,client[1]);
                }
            });
            loadPastClientMeshes();
            sendPosition();
            return;
        }
    
        if(!aqa.spaceshipMesh) {
            sendPosition();
            return;
        }
    
        if(m.trackList) {
            console.log("onmessage: tracklist "+m.trackList);
            if(m.sessionId!==aqa.sessionId) {
                for(let i=0;i<aqa.nTracks;i++) {
                    const trackUrl=m.trackList[i];
                    if(trackUrl) {
                        if(orbitertrackUrl[i]!==trackUrl) {
                            orbitertrackUrl[i]=trackUrl;
                            playTrack(trackUrl,i);
                            console.log("playTrack: "+trackUrl);
                        } else {
                            console.log("already playing: "+trackUrl);
                        }
                    }
                }
            }
            sendPosition();
            return;
        }
    
        allUsers = new Map(m);
        let iOtherUser=0;
    
        allUsers.forEach((value, key) => {
            if(key==aqa.sessionId) {
                return;
            }
    
            let otherUser=otherUsers.get(key);
    
            if(otherUser) {
                if(otherUser.position) {
                    otherUser.position.x = value.x;
                    otherUser.position.y = value.y;
                    otherUser.position.z = value.z;
                    otherUser.rotation.x = value.rx;
                    otherUser.rotation.y = value.ry;
                    otherUser.rotation.z = value.rz;
                }
            } else {
                otherUsers.set(key,{});
    
                let spaceshipUrl=aqa.avatarUrl(value.avatarId);
    
                SceneLoader.ImportMeshAsync(
                  null,
                  spaceshipUrl,
                  null,
                  scene
                ).then(({ meshes }) => {
                  console.log("New user created "+value.nickname+" "+key);
                  scene.stopAllAnimations();
                  const newUser = meshes[0];
                  newUser.position.x = value.x;
                  newUser.position.y = value.y;
                  newUser.position.z = value.z;
                  newUser.rotation = new BABYLON.Vector3(value.rx,value.ry,value.rz);
                  otherUsers.set(key,newUser);
                  aqa.htmlGui.setNetSessionEntry(key,value.nickname);
                  sessionCount++;
                });
            }
        });
        sendPosition();
    };
    
    // Handle errors
    aqa.ws.onerror = (error) => {
        console.log("WS Error "+error);
    };
    
    // Handle connection close
    aqa.ws.onclose = () => {
        console.log("DISConnected from server");
    };
    
    setTimeout(removeInactiveClients, 1000);

}

function loadPastClientMeshes() {
    /*
    if(!aqa.spaceshipMesh) {
        console.log("retry loadPastClientMeshes");
        setTimeout(loadPastClientMeshes,1000);
        return;
    }
    */
    
    const data=pastClientLoader.pop();
    if(data) {
        let planetUrl=data[0];
        let x=data[1];
        let y=data[2];
        let z=data[3];
        //console.log("Loading "+planetUrl + " x:" + x + " y:" + y + " z:" + z);
        BABYLON.ImportMeshAsync(planetUrl,scene)
        .then((result) => {
              //console.log("New planet created "+planetUrl);
              const planet = result.meshes[0];
              planet.position.x = x;
              planet.position.y = y;
              planet.position.z = z;
              const planetAggregate = new BABYLON.PhysicsAggregate(planet, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, restitution: 1 }, scene);
              //const planetAggregate = new BABYLON.PhysicsAggregate(planet, BABYLON.PhysicsShapeType.CONVEX_HULL, { mass: 1, restitution: 0.75 }, scene);
              loadPastClientMeshes();
        });
    }
}
// Send own position to web socket server
function sendPosition() {
    if(aqa.spaceshipMesh) {
        let rq=aqa.spaceshipMesh.rotationQuaternion.toEulerAngles();
        let x = aqa.spaceshipMesh.position.x;
        let y = aqa.spaceshipMesh.position.y;
        let z = aqa.spaceshipMesh.position.z;
        let message=JSON.stringify({"sessionId":aqa.sessionId,"nickname":aqa.nickname,"x":x,"y":y,"z":z,"rx":rq.x,"ry":rq.y,"rz":rq.z,"avatarId":aqa.avatarId});
        aqa.ws.send(message);
    } else {
        aqa.ws.send("{}");
    }
}

function sendTrackList(list) {
    let message=JSON.stringify({"sessionId":aqa.sessionId,"trackList":list});
    //console.log("sendTrackList "+message);
    aqa.ws.send(message);
}

function removeInactiveClients() {
    //console.log("removeInactiveClients")
    otherUsers.forEach((value, key) => {
        //console.log("- "+key);
        let otherUser=allUsers.get(key);
        if(!otherUser) {
            console.log("-> removeInactiveClient "+key);
            otherUsers.delete(key);
            sessionCount--;
            aqa.htmlGui.deleteNetSessionEntry(key);
            value.dispose();
        }
    });
    setTimeout(removeInactiveClients, 1000);
}
