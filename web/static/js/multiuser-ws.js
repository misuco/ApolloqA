/// Multiuser Websocket Feature
let otherUsers = new Map();
var allUsers;

// Connect to the WebSocket server
console.log("Connecting ws to "+aqa.wsUrl)
const ws = new WebSocket(aqa.wsUrl);

// Connection opened
ws.onopen = () => {
    console.log("Connected to server");
};

// Listen for messages
ws.onmessage = (event) => {
    
    if(!spaceshipMesh) {
        sendMessage();
        return;
    }
    
    //console.log("onmessage: "+event.data);
    
    allUsers = new Map(JSON.parse(event.data));

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
            SceneLoader.ImportMeshAsync(
              null,
              "obj/Spaceship_BarbaraTheBee.gltf",
              null,
              scene
            ).then(({ meshes }) => {
              console.log("New user created "+key);
              const newUser = meshes[0];
              newUser.position.x = value.x;
              newUser.position.y = value.y;
              newUser.position.z = value.z;
              newUser.rotation = new BABYLON.Vector3(value.rx,value.ry,value.rz);
              otherUsers.set(key,newUser);
            });
        }
    });

    sendMessage();
};

// Handle errors
ws.onerror = (error) => {
    console.log("WS Error "+error);
};

// Handle connection close
ws.onclose = () => {
    console.log("DISConnected from server");
};

// Send own position to web socket server
function sendMessage() {
    if(spaceshipMesh) {
        let rq=spaceshipMesh.rotationQuaternion.toEulerAngles();
        let x = spaceshipMesh.position.x;
        let y = spaceshipMesh.position.y;
        let z = spaceshipMesh.position.z;
        let message=JSON.stringify({"sessionId":aqa.sessionId,"x":x,"y":y,"z":z,"rx":rq.x,"ry":rq.y,"rz":rq.z});
        ws.send(message);
    } else {
        ws.send("{}");
    }
}

let removeInactiveClients = function() {
    //console.log("removeInactiveClients")
    otherUsers.forEach((value, key) => {
        //console.log("- "+key);
        let otherUser=allUsers.get(key);
        if(!otherUser) {
            console.log("-> delete"+key);
            value.dispose();
            otherUsers.delete(key);
        }
    });
    setTimeout(removeInactiveClients, 1000);
}

setTimeout(removeInactiveClients, 1000);
