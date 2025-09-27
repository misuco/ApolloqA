/// Colors
var mRed = new BABYLON.StandardMaterial("m4", scene);
mRed.diffuseColor = new BABYLON.Color3(1, 0, 0);
mRed.alpha = .5;
mRed.freeze();

var mGreen = new BABYLON.StandardMaterial("m5", scene);
mGreen.diffuseColor = new BABYLON.Color3(0, 1, 0);
mGreen.freeze();

var mYellow = new BABYLON.StandardMaterial("m3", scene);
mYellow.diffuseColor = new BABYLON.Color3(1, 1, 0);
mYellow.alpha = .5;
mYellow.freeze();

/// Object state variables
var nOrbiter = 4;
var orbiter = [];
var orbitertrack = [];
var orbitertrackVolume = [];
var orbitertrackMute = [];
var orbitertrackCalc = [];
var orbitertrackObserver = [];

for (let i = 0; i < nOrbiter; i++) {
    orbiter[i] = [];
    orbitertrackVolume[i] = .9;
    orbitertrackMute[i] = false;
    orbitertrackCalc[i] = false;
    for (let j = 0; j < 16; j++) {
        orbiter[i][j] = BABYLON.MeshBuilder.CreateSphere("orbiter" + i, {
            diameter: 1
        }, scene);
        orbiter[i][j].isVisible = false;
        orbiter[i][j].material = mGreen;
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

let sessionId = 0;

var playTrack = function(trackUrl, trackId) {
    console.log("play track: " + trackUrl);
    if (syncTrackRunning === false) {
        syncTrackTimer();
    }

    if (orbitertrack[trackId]) {
        console.log("Cleanup track "+trackId);
        console.log("Cleanup analyzer observer:" + orbitertrackObserver[trackId]);
        scene.onBeforeRenderObservable.remove(orbitertrackObserver[trackId]);
        orbitertrack[trackId].stop();
        orbitertrack[trackId].dispose();
    }

    BABYLON.CreateSoundAsync(trackUrl, trackUrl, {
        spatialEnabled: true
    }).then(track => {
        console.log("music 1 ready... play " + trackUrl);
        track.spatial.attach(orbiter[trackId][0]);
        track.trackId=trackId;
        track.setVolume(orbitertrackVolume[trackId]);
        readyTacks.push(track);
        orbitertrack[trackId] = track;

        orbitertrackObserver[trackId] = scene.onBeforeRenderObservable.add(() => {
            console.log("Analyzer call");
            try {
                const frequencies = track.analyzer.getFloatFrequencyData();
                for (let i = 0; i < 16; i++) {
                    let scaling = frequencies[i];
                    orbiter[trackId][i].scaling.x = scaling;
                    orbiter[trackId][i].scaling.y = scaling;
                    orbiter[trackId][i].scaling.z = scaling;
                }
            } catch(err) {
                console.log("Analyzer error");
            }
        });

        console.log("added analyzer observer:" + orbitertrackObserver[trackId]);
        console.log("playing sound:" + trackUrl);
    }).catch(err => {
        console.error("cannot play sound:" + trackUrl + " " + err);
    });
    
};

var triggerNewSound = function(trackId) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function() {
        if (this.response.includes("Error")) {
            console.log("server error!!!");
            triggerNewSound(trackId);
        } else {
            playTrack(this.response + ".mp3", trackId);
            for (let i = 0; i < 16; i++) {
                orbiter[trackId][i].isVisible = true;
            }
        }
    });
    var getUrl = window.location;
    var baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
    console.log("trigger new sound trackId " + trackId);
    var queryId = trackId + "_" + aqa.tempo + "_" + Date.now();
    oReq.open("GET", baseUrl + "newclip?id=" + queryId + "&tempo=" + aqa.tempo + "&sessionId=" + sessionId);
    oReq.send();
};
