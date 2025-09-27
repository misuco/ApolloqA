
// Create a UniversalCamera that we will ue as a "chase cam"
const camera = new UniversalCamera(
  "UniversalCamera",
  new Vector3(0, 0, 0),
  scene
);
// Because our starfield is 10000 units away, we'll need to tweak
// the camera so it will render things that far away. Note that this
// is sometimes a bad idea and can cause "z-fighting," but yolo
camera.maxZ = 11000;

// Define some references for the chase cam; these are in-scene objects
// that will be set later, when the spaceship mesh is loaded
let chaseCameraPosition = null; // The position we want to place the camera
let chaseCameraLookAt = null; // The position we want the camera to look at

// We will use this to refer to our spaceship mesh in the
// scene, but we need to wait until it's loaded
let spaceshipMesh = null;

// Load the spaceship mesh asynchronously.
// Note that we are loading a GLTF, which isn't supported by the core BabylonJS runtime, se we need to add the babylonjs.loaders.js script from CDN in the CodePen settings.
// The mesh comes from Quaternius' excellent Ultimate Space Kit and I've uploaded it to Dropbox:
// https://quaternius.com/packs/ultimatespacekit.html
SceneLoader.ImportMeshAsync(
  null,
  // This link was copied from the Dropbox "Share" panel, but the domain needs to be changed to dl.dropboxusercontent.com to avoid issues with CORS
  //"obj/12150_Christmas_Tree_V2_L2.obj",
  "obj/Spaceship_BarbaraTheBee.gltf",
  //"obj/Flakes1_Classic.obj",
  //"obj/Logo-C_001.obj",
  null,
  scene
).then(({ meshes }) => {
  // We now have our spaceship loaded into the scene!

  // Set spaceshipMesh to the first mesh in the array: this is correct
  // for our spaceship, but really depends on the mesh you loaded
  spaceshipMesh = meshes[0];

/*
  spaceshipMesh.scaling.x = 0.1;
  spaceshipMesh.scaling.y = 0.1;
  spaceshipMesh.scaling.z = 0.1;
*/
  // To allow working with rotationQuaternion, which is
  // null by default, we need to give it a value
  spaceshipMesh.rotationQuaternion = Quaternion.Identity();

  // Attach some "chase camera rig points" to the spaceship
  // mesh. These are invisible in-scene objects that are
  // parented to the spaceship, meaning they will always
  // "follow along" with it
  chaseCameraPosition = new TransformNode("chaseCameraPosition", scene);
  chaseCameraPosition.parent = spaceshipMesh;
  // Position this one behind and up a bit; the XYZ are in local coords
  chaseCameraPosition.position = new Vector3(0, 4, -15);
  chaseCameraLookAt = new TransformNode("chaseCameraLookAt", scene);
  chaseCameraLookAt.parent = spaceshipMesh;
  // Position this one in front and up a bit; the XYZ are in local coords
  chaseCameraLookAt.position = new Vector3(0, 2, 10);
  // Now that chaseCameraPosition and chaseCameraLookAt are set, the
  // chase camera code can will it's thing (see code above)
  
  scene.audioListenerPositionProvider = () => {
    // Returns a static position
    return spaceshipMesh.absolutePosition;
  };
  
});







// We fly the spaceship by dragging the mouse, with the drag direction
// translating to the Yaw and Pitch changes to the spaceship, and thrust
// being applied at 100% whenever the mouse is held down.

// We use the onPointerObservable event to capture mouse drag info into
// mouseState. Later on, we read mouseState to compute the changes to the
// ship.
let mouseState = null;
scene.onPointerObservable.add((pointerInfo) => {
  switch (pointerInfo.type) {
    case PointerEventTypes.POINTERDOWN:
      // POINTERDOWN: capture the current mouse position as the `down` property
      // Also capture it as the `last` property (effectively a drag of 0 pixels)
      mouseState = { down: pointerInfo.event, last: pointerInfo.event };
      break;

    case PointerEventTypes.POINTERUP:
      // POINTERUP: drag has finished, so clear the mouse state
      mouseState = null;
      break;

    case PointerEventTypes.POINTERMOVE:
      // POINTERMOVE: while dragging, keep the `down` drag position
      // but continuously update the `last` drag position
      if (mouseState) {
        mouseState.last = pointerInfo.event;
      }
      break;
  }
});

// Read the current values of mouseState and use it to compute the
// steering input for the ship, in terms of thrust, yaw and pitch.
function getSpaceshipInputFromMouse() {
  // If the mouse isn't being pressed, return null, which means "no input"
  if (!mouseState) {
    return null;
  }

  // Get the smallest of the screen's width or height
  const screenSize = Math.min(
    scene.getEngine().getRenderWidth(),
    scene.getEngine().getRenderHeight()
  );

  // From the screen size, define a box that is 25% of the size
  // of the screen - this is effectively the max drag range of
  // the mouse drag, from the start point, in all 4 directions
  const dragSize = 0.25 * screenSize;

  // Compute the drag difference from the starting position of the drag
  const dragX = mouseState.last.clientX - mouseState.down.clientX;
  // Note: +X maps to +Yaw, but +Y maps to -Pitch, so invert Y:
  const dragY = mouseState.down.clientY - mouseState.last.clientY;

  // Normalised the values to [-1, 1] and map them like this:
  // * X maps to yaw (turn left/right)
  // * Y maps to pitch (turn up/down)
  const yaw = Scalar.Clamp(dragX / dragSize, -1, 1);
  const pitch = Scalar.Clamp(dragY / dragSize, -1, 1);

  // Finally, return the mouse state in terms of spaceship controls
  return {
    thrust: 1,
    yaw,
    pitch
  };
}

// The following values can be tweaked until they "feel right"

// Our maximum acceleration (units per second per second)
const MaxThrust = 10;
// Our maximum turn speed (radians per second)
const TurnSpeed = 4;
// The drag coefficient; roughly, how much velocity we will
// lose per second. Lower values means less drag and a more
// realistic "newtonian physics" feel, but may not be great
// for gameplay.
const DragCoefficient = 0.25;

// The ship's current velocity
const velocity = new Vector3();
// Use the onBeforeRenderObservable event to get the player input
// and compute the spaceship's physics, and ultimately move the
// spaceship
scene.onBeforeRenderObservable.add(() => {
  // If the ship hasn't been loaded yet, we can't do anything
  if (!spaceshipMesh) {
    return;
  }

  // Compute the "time slice" in seconds; we need to know this so
  // we can apply the correct amount of movement
  const deltaSecs = scene.deltaTime / 1000;

  // Get the input form the mouse; the input is returned in terms
  // of steering a spaceship, i.e.:
  //  * thrust: how much forward thrust to apply
  //  * yaw: how much to turn left or right
  //  * pitch: how much to turn up or down
  // Note that input values are normalised from -1 to 1.
  const input = getSpaceshipInputFromMouse();

  // If we have input, then we can compute the turn
  if (input) {
    // Convert Yaw and Pitch to a rotation in quaternion form
    const turn = Quaternion.RotationYawPitchRoll(
      input.yaw * deltaSecs * TurnSpeed,
      input.pitch * deltaSecs * TurnSpeed,
      0
    );
    // Apply the rotation to our current rotation
    spaceshipMesh.rotationQuaternion.multiplyInPlace(turn);
  }

  // If we have input, compute acceleration, otherwise it's zero
  const acceleration = input
    ? spaceshipMesh.forward.scale(input.thrust * MaxThrust * deltaSecs)
    : Vector3.Zero();

  // Now apply the various physics forces to move the spaceship

  // Apply acceleration to velocity
  velocity.addInPlace(acceleration);
  // Apply drag to dampen velocity
  velocity.scaleInPlace(1 - DragCoefficient * deltaSecs);
  // Apply velocity to position
  spaceshipMesh.position.addInPlace(velocity.scale(deltaSecs));

  //console.log("spaceship "+spaceshipMesh.position);
});

// Use the onBeforeRenderObservable event to move the
// camera into position and face the correct way
scene.onBeforeRenderObservable.add(() => {
  if (chaseCameraPosition) {
    // Smoothly interpolate the camera's current position towards the calculated camera position
    camera.position = Vector3.Lerp(
      camera.position,
      chaseCameraPosition.getAbsolutePosition(),
      (scene.deltaTime / 1000) * 3
    );
    // Note: you can tweak the 3 above to get a snappier
    // or sloppier camera-follow

    // We always want to align the camera's "up" with the spaceship's
    // "up." this gives us a nice fully-3d space feel
    camera.upVector = chaseCameraPosition.up;
  }

  // Turn the camera to always face the look-at position
  if (chaseCameraLookAt) {
    camera.target = chaseCameraLookAt.getAbsolutePosition();
  }
});
