// From aiming direction and state, compute a desired velocity
// That velocity depends on current state (in air, on ground, jumping, ...) and surface properties
var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
var inputDirection = new BABYLON.Vector3(0,0,0);
var onGroundSpeed = 10.0;

/*
var getDesiredVelocity = function(deltaTime, supportInfo, characterOrientation, currentVelocity) {

    let upWorld = aqa.spaceshipGravity.normalizeToNew();
    upWorld.scaleInPlace(-1.0);
    let forwardWorld = forwardLocalSpace.applyRotationQuaternion(characterOrientation);

    // Move character relative to the surface we're standing on
    // Correct input velocity to apply instantly any changes in the velocity of the standing surface and this way
    // avoid artifacts caused by filtering of the output velocity when standing on moving objects.
    let desiredVelocity = inputDirection.scale(onGroundSpeed).applyRotationQuaternion(characterOrientation);

    let outputVelocity = aqa.spaceshipController.calculateMovement(deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity, supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld);
    // Horizontal projection
    {
        outputVelocity.subtractInPlace(supportInfo.averageSurfaceVelocity);
        let inv1k = 1e-3;
        if (outputVelocity.dot(upWorld) > inv1k) {
            let velLen = outputVelocity.length();
            outputVelocity.normalizeFromLength(velLen);

            // Get the desired length in the horizontal direction
            let horizLen = velLen / supportInfo.averageSurfaceNormal.dot(upWorld);

            // Re project the velocity onto the horizontal plane
            let c = supportInfo.averageSurfaceNormal.cross(outputVelocity);
            outputVelocity = c.cross(upWorld);
            outputVelocity.scaleInPlace(horizLen);
        }
        outputVelocity.addInPlace(supportInfo.averageSurfaceVelocity);
        return outputVelocity;
    }
    return Vector3.Zero();
}
*/

// Read the current values of mouseState and use it to compute the
// steering input for the ship, in terms of thrust, yaw and pitch.
function getSpaceshipInputFromMouse() {
    // If the mouse isn't being pressed, return null, which means "no input"
    if (!aqa.mouseState) {
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
    const dragX = aqa.mouseState.last.clientX - aqa.mouseState.down.clientX;
    // Note: +X maps to +Yaw, but +Y maps to -Pitch, so invert Y:
    const dragY = aqa.mouseState.down.clientY - aqa.mouseState.last.clientY;

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
const MaxThrust = 5;
// Our maximum turn speed (radians per second)
const TurnSpeed = 5;
// The drag coefficient; roughly, how much velocity we will
// lose per second. Lower values means less drag and a more
// realistic "newtonian physics" feel, but may not be great
// for gameplay.
const DragCoefficient = 1;

// The ship's current velocity
const velocity = new Vector3();
// Use the onBeforeRenderObservable event to get the player input
// and compute the spaceship's physics, and ultimately move the
// spaceship

async function initCamera() {
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

    // Load the spaceship mesh asynchronously.
    // Note that we are loading a GLTF, which isn't supported by the core BabylonJS runtime, se we need to add the babylonjs.loaders.js script from CDN in the CodePen settings.
    // The mesh comes from Quaternius' excellent Ultimate Space Kit and I've uploaded it to Dropbox:
    // https://quaternius.com/packs/ultimatespacekit.html

    let spaceshipUrl=aqa.avatarUrl(aqa.avatarId);

    let result = await BABYLON.ImportMeshAsync(
        spaceshipUrl,
        scene
    )
    // We now have our spaceship loaded into the scene!

    // Set spaceshipMesh to the first mesh in the array: this is correct
    // for our spaceship, but really depends on the mesh you loaded
    scene.stopAllAnimations();
    aqa.spaceshipMesh = result.meshes[0];
    console.log("spaceshipMesh size "+result.meshes.length);
    console.log("spaceship animationGroup size "+result.animationGroups.length);

    aqa.spaceshipPosition = new BABYLON.Vector3(0,0,0);
    //aqa.spaceshipController = new BABYLON.PhysicsCharacterController(aqa.spaceshipPosition, {capsuleHeight: 1, capsuleRadius: 1}, scene);
    //aqa.spaceshipGravity = new BABYLON.Vector3(0.1,0.1,0.1);

    // To allow working with rotationQuaternion, which is
    // null by default, we need to give it a value
    // aqa.spaceshipMesh.rotationQuaternion = Quaternion.Identity();

    // Attach some "chase camera rig points" to the spaceship
    // mesh. These are invisible in-scene objects that are
    // parented to the spaceship, meaning they will always
    // "follow along" with it
    aqa.chaseCameraPosition = new TransformNode("aqa.chaseCameraPosition", scene);
    aqa.chaseCameraPosition.parent = aqa.spaceshipMesh;
    // Position this one behind and up a bit; the XYZ are in local coords
    aqa.chaseCameraPosition.position = new Vector3(0, 4, -15);
    aqa.chaseCameraLookAt = new TransformNode("aqa.chaseCameraLookAt", scene);
    aqa.chaseCameraLookAt.parent = aqa.spaceshipMesh;
    // Position this one in front and up a bit; the XYZ are in local coords
    aqa.chaseCameraLookAt.position = new Vector3(0, 2, 10);
    // Now that aqa.chaseCameraPosition and aqa.chaseCameraLookAt are set, the
    // chase camera code can will it's thing (see code above)

    /*
    //After physics update, compute and set new velocity, update the character controller state
    scene.onAfterPhysicsObservable.add((_) => {
        if (scene.deltaTime == undefined) return;
        let dt = scene.deltaTime / 1000.0;
        if (dt == 0) return;

        let freeSpace = new BABYLON.Vector3(0, 0, 0);
        let support = aqa.spaceshipController.checkSupport(dt, freeSpace);

        //BABYLON.Quaternion.FromEulerAnglesToRef(0,camera.rotation.y, 0, aqa.spaceshipMesh.rotationQuaternion);
        //let desiredLinearVelocity = getDesiredVelocity(dt, support, aqa.spaceshipMesh.rotationQuaternion, aqa.spaceshipController.getVelocity());
        //aqa.spaceshipController.setVelocity(desiredLinearVelocity);

        let forwardWorld = inputDirection.applyRotationQuaternion(aqa.spaceshipMesh.rotationQuaternion);

        aqa.spaceshipController.setVelocity(forwardWorld);
        aqa.spaceshipController.integrate(dt, support, aqa.spaceshipGravity);

        //console.log("onAfterPhysicsObservable Q:" + aqa.spaceshipMesh.rotationQuaternion + " Q2E:" + aqa.spaceshipMesh.rotationQuaternion.toRotationMatrix() + " " + inputDirection.z + " dt: " + dt + " pos: " + aqa.spaceshipController.getPosition());
    });
    */


    // We use the onPointerObservable event to capture mouse drag info into
    // mouseState. Later on, we read mouseState to compute the changes to the
    // ship.
    scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:
            // POINTERDOWN: capture the current mouse position as the `down` property
            // Also capture it as the `last` property (effectively a drag of 0 pixels)
            aqa.mouseState = { down: pointerInfo.event, last: pointerInfo.event };
            inputDirection.z = -1;
            break;

            case PointerEventTypes.POINTERUP:
            // POINTERUP: drag has finished, so clear the mouse state
            aqa.mouseState = null;
            inputDirection.z = 0;
            break;

            case PointerEventTypes.POINTERMOVE:
            // POINTERMOVE: while dragging, keep the `down` drag position
            // but continuously update the `last` drag position
            if (aqa.mouseState) {
                aqa.mouseState.last = pointerInfo.event;
            }
            break;
        }
    });


    scene.onBeforeRenderObservable.add(() => {

        // If the ship hasn't been loaded yet, we can't do anything
        if (!aqa.spaceshipMesh) {
            return;
        }

        /*
        aqa.spaceshipMesh.position.copyFrom(aqa.spaceshipController.getPosition());
        */

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
            aqa.spaceshipMesh.rotationQuaternion.multiplyInPlace(turn);
        }
        /*
        else if (aqa.autoplay) {
            // Convert Yaw and Pitch to a rotation in quaternion form
            const turn = Quaternion.RotationYawPitchRoll(
                deltaSecs,
                0,
                0
            );
            // Apply the rotation to our current rotation
            aqa.spaceshipMesh.rotationQuaternion.multiplyInPlace(turn);
        }
        */
        
        // If we have autoplay, constant acceleration
        // If we have input, compute acceleration
        // otherwise it's zero
        const acceleration = 
        aqa.speed>0 ? aqa.spaceshipMesh.forward.scale(MaxThrust * aqa.speed * deltaSecs) :
        input ? aqa.spaceshipMesh.forward.scale(input.thrust * MaxThrust * deltaSecs)
        : Vector3.Zero();
        
        // Now apply the various physics forces to move the spaceship

        // Apply acceleration to velocity
        velocity.addInPlace(acceleration);
        // Apply drag to dampen velocity
        velocity.scaleInPlace(1 - DragCoefficient * deltaSecs);


        // Apply velocity to position
        aqa.spaceshipMesh.position.addInPlace(velocity.scale(deltaSecs));

        //console.log("spaceship pos: " + aqa.spaceshipMesh.position);

    });

    // Use the onBeforeRenderObservable event to move the
    // camera into position and face the correct way
    scene.onBeforeRenderObservable.add(() => {
        if (aqa.chaseCameraPosition) {
            // Smoothly interpolate the camera's current position towards the calculated camera position
            camera.position = Vector3.Lerp(
                camera.position,
                aqa.chaseCameraPosition.getAbsolutePosition(),
                (scene.deltaTime / 1000) * 3
            );
            // Note: you can tweak the 3 above to get a snappier
            // or sloppier camera-follow

            // We always want to align the camera's "up" with the spaceship's
            // "up." this gives us a nice fully-3d space feel
            camera.upVector = aqa.chaseCameraPosition.up;
        }

        // Turn the camera to always face the look-at position
        if (aqa.chaseCameraLookAt) {
            camera.target = aqa.chaseCameraLookAt.getAbsolutePosition();
        }
    });
}

// We fly the spaceship by dragging the mouse, with the drag direction
// translating to the Yaw and Pitch changes to the spaceship, and thrust
// being applied at 100% whenever the mouse is held down.
