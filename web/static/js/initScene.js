/*

Fly a spaceship in BabylonJS - Part 3

Read the full series of articles at https://medium.com/@joelmalone

Barbara the Bee spaceship model comes from Quaternius' Ultimate Space Kit:

https://quaternius.com/packs/ultimatespacekit.html

For this scene, we need to load two BabylonJS scripts:

 * Babylon.js Core - the core runtime
 * Babylon.js All Official Loaders (OBJ, STL, glTF) - because we're loading a GLTF

The BabylonJS scripts are loaded from CDN, though we use jsdelivr rather than BabylonJS' own CDN because jsdelivr allows us to lock to a specific version.

See here for details on loading BabylonJS scripts:

https://doc.babylonjs.com/setup/frameworkPackages/CDN

*/

// First identify user
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

const nickname = getCookie("nickname");
if (!nickname) {
    window.location.href = 'checkin';
}

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
  Vector3
} = BABYLON;

// Get a reference to the <canvas>
const canvas = document.querySelector(".apolloqa");
// Create a BabylonJS engine
const engine = new Engine(canvas, true);

// Create a BabylonJS scene
const scene = new Scene(engine);
// And also, let's set the scene's "clear colour" to black
scene.clearColor = "black";

// Create an ambient light with low intensity, so the dark parts of the scene aren't pitch black
var ambientLight = new BABYLON.HemisphericLight(
  "ambient light",
  new BABYLON.Vector3(0, 0, 0),
  scene
);
ambientLight.intensity = 0.25;

// Create a light to simulate the sun's light
const sunLight = new DirectionalLight("sun light", new Vector3(1, -1, -1));
sunLight.intensity = 5;


// Bind to the window's resize DOM event, so that we can update the <canvas> dimensions to match;
// this is needed because the <canvas> render context doesn't automaticaly update itself
const onWindowResize = () => {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
};
// You can see the problem if you disable this next line, and then resize the window - the scene will become pixelated
window.addEventListener("resize", onWindowResize);

/*
scene.debugLayer.show({
  embedMode: true,
});
*/

(async () => {
    const audioEngine = await BABYLON.CreateAudioEngineAsync();
    await audioEngine.unlockAsync();
    console.log("audioEngine ready")
})();

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

const aqa={};
aqa.nickname=nickname;
aqa.uploadId=0;
aqa.nTracks=4;
aqa.tempo=140;
aqa.basenote=0;
aqa.scale=0;
aqa.sampleRate=48000;
aqa.calcButton=[];
aqa.levelBars=[];
aqa.windowUrl = window.location;
aqa.sessionId = uuidv4();
aqa.baseUrl = aqa.windowUrl.protocol + "//" + aqa.windowUrl.host + "/";
aqa.wsUrl = "wss://ws.apolloqa.net/"

aqa.avatarId=getRandomInt(9);
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

