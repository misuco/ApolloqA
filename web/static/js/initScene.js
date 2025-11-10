/*

ApolloqA - Sound Co-Lab 

Sound generator:
by c1Audio

3D World:
Based on series of articles at https://medium.com/@joelmalone
and GFX by https://quaternius.com/packs/ultimatespacekit.html
*/

// Get a reference to the <canvas>
const canvas = document.querySelector(".apolloqa");
// Bind to the window's resize DOM event, so that we can update the <canvas> dimensions to match;
// this is needed because the <canvas> render context doesn't automaticaly update itself
const onWindowResize = () => {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
};
// You can see the problem if you disable this next line, and then resize the window - the scene will become pixelated
window.addEventListener("resize", onWindowResize);

const engine = new Engine(canvas, true);

const createScene = async function () {
    // Create a BabylonJS engine

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

    const havokInstance = await HavokPhysics();
    const hk = new BABYLON.HavokPlugin(true, havokInstance);
    var gravityVector = new BABYLON.Vector3(0, 0, 0);
    scene.enablePhysics(gravityVector, hk);
    console.log("physics created");

    /*
    scene.debugLayer.show({
      embedMode: true,
    });
    */

    const audioEngine = await BABYLON.CreateAudioEngineAsync();
    //await audioEngine.unlockAsync();
    console.log("audioEngine ready")
    
    return scene;
}

let scene = null;

async function boot() {
    console.log("boot: createScene");
    scene = await createScene();
    console.log("boot: initColors");
    initColors();
    console.log("boot: initCamera");
    initCamera();
    console.log("boot: initStarfield");
    initStarfield();
    console.log("boot: initObjects");
    initObjects();
    console.log("boot: initAnimation");
    initAnimation();
    console.log("boot: initMediaRecorder");
    initMediaRecorder();
    
    aqa.htmlGui=new aqa_menu();
    aqa.htmlGui.updateHeader();
    
    console.log("boot: initMultiuser");
    initMultiuser();

    // Start a render loop 
    // - basically, this will instruct BabylonJS to continuously re-render the scene
    engine.runRenderLoop(() => {
        scene.render();
    });    
}

boot();




