
// The starfield is a BabylonJS ParticleSystem, with a particle limit of 10000
const starfield = new ParticleSystem("starfield", 10000, scene);
// We want to emit the particles on the surface of a sphere 10000 in radius
starfield.createSphereEmitter(10000, 0);
// We want to emit all of the particles at once, to immiediately fill the scene
starfield.manualEmitCount = 100000;
// We want the stars to live forever
starfield.minLifeTime = Number.MAX_VALUE;
starfield.maxLifeTime = Number.MAX_VALUE;
// We want the stars to vary in size
starfield.minSize = 0.1 * 1000;
starfield.maxSize = 0.25 * 1000;
// We don't want the stars to move
starfield.minEmitPower = 0;
starfield.maxEmitPower = 0;
starfield.gravity = new Vector3(0, 0, 0);
// Star colours will pick from somewhere between these two colours
starfield.color1 = new Color4(1, 0.8, 0.8, 1.0);
starfield.color2 = new Color4(1, 1, 1, 1.0);
// Load a star texture; the image is tiny, so let's just use a data URL.
// I used this online service to convert from a star.png image to a data URL:
// https://jpillora.com/base64-encoder/
starfield.particleTexture = new Texture(
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADNJREFUOE9jZKAQMFKon2HUAAYah8H/////g2KJkZERZ2DjjQWKDSAmjYymA1qnA2JiAQB3SAgRq6BZyAAAAABJRU5ErkJggg==",
  scene
);
// Finally, we need to start emitting particles
starfield.start();
