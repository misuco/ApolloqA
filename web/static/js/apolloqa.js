const {
  Color4,
  DirectionalLight,
  Engine,
  ParticleSystem,
  PointerEventTypes,
  Quaternion,
  Scalar,
  Scene,
  SceneLoader,
  Texture,
  TransformNode,
  UniversalCamera,
  Vector3,
  HavokPlugin
} = BABYLON;

const aqa={};

aqa.uuidv4 = function() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

aqa.getRandomInt = function(max) {
    return Math.floor(Math.random() * max);
}

aqa.htmlGui={};     // guiHtml.js
aqa.sessionId = aqa.uuidv4();

// camera.js
aqa.spaceshipMesh = null;
aqa.spaceshipPosition = null;
aqa.spaceshipController = null;
aqa.spaceshipGravity = null;
aqa.chaseCameraPosition = null;
aqa.chaseCameraLookAt = null;
aqa.mouseState = null;

// multiuser-ws.js
aqa.ws = null;
aqa.otherUsers = new Map();
aqa.wsUrl = "ws://192.168.0.10:3038/"
//aqa.wsUrl = "wss://ws.apolloqa.net/"

// syncTrack.js
aqa.syncTrackTimer = null;
aqa.syncTrackRunning = false;

// objects.js
aqa.orbiter = new Map();
aqa.myOrbiter = null;

// syncTrack.js
aqa.readyTrack = new Map();
aqa.readyAnalyzer = new Map();

// animation.js
aqa.startTime = Date.now();

aqa.nickname=nickname;
aqa.uploadId=0;
aqa.nTracks=4;
aqa.tempo=140;
aqa.cycleNr=0;
aqa.recTrackId=0;
aqa.recArmed=false;
aqa.stopArmed=false;
aqa.recording=false;
aqa.mediaRecorder={};
aqa.autoplay=false;
aqa.basenote=0;
aqa.scale=0;
aqa.sampleRate=48000;
aqa.calcButton=[];
aqa.levelBars=[];
aqa.chanColor=[];
aqa.windowUrl = window.location;
aqa.baseUrl = aqa.windowUrl.protocol + "//" + aqa.windowUrl.host + "/";

aqa.avatarId=aqa.getRandomInt(9);
aqa.avatarUrl=function(id) {
    switch(id) {
        case 0:
            return "obj/Spaceship_FinnTheFrog.gltf";
            break;
        case 1:
            return "obj/Spaceship_FernandoTheFlamingo.gltf";
            break;
        case 2:
            return "obj/Spaceship_BarbaraTheBee.gltf";
            break;
        case 3:
            return "obj/Astronaut_BarbaraTheBee.gltf";
            break;
        case 4:
            return "obj/Astronaut_FernandoTheFlamingo.gltf";
            break;
        case 5:
            return "obj/Astronaut_FinnTheFrog.gltf";
            break;
        case 6:
            return "obj/Astronaut_RaeTheRedPanda.gltf";
            break;
        case 7:
            return "obj/Mech_BarbaraTheBee.gltf";
            break;
        case 8:
            return "obj/Mech_FernandoTheFlamingo.gltf";
            break;
        default:
            return "obj/Spaceship_RaeTheRedPanda.gltf";
            break;
    }
}
