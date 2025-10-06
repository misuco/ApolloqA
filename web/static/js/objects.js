/// Object state variables
var nOrbiter = 4;
var orbiter = [];
var orbitertrack = [];
var orbiteranalyzer = [];
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
        orbiter[i][j].material = chanColor[i];
    }
}

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
        track.spatial.attach(orbiter[trackId][0]);
        if(orbitertrackMute[trackId]==true) {
            track.setVolume(0);
        } else {
            track.setVolume(orbitertrackVolume[trackId]);
        }
        orbitertrack[trackId] = track;
        readyTack[trackId]=true;
        //console.log("track ready: " + trackUrl);
    }).catch(err => {
        console.error("cannot play sound:" + trackUrl + " " + err);
    });
    
    BABYLON.CreateAudioBusAsync(trackUrl, {
        analyzerEnabled: true
    }).then(bus => {
        orbiteranalyzer[trackId] = bus;
        readyAnalyzer[trackId] = true;
        //console.log("analyzer bus ready: " + trackUrl);

        orbitertrackObserver[trackId] = scene.onBeforeRenderObservable.add(() => {
            try {
                const frequencies = bus.analyzer.getByteFrequencyData();
                for (let i = 0; i < 16; i++) {
                    let scaling = frequencies[i]/255;
                    orbiter[trackId][i].scaling.x = scaling;
                    orbiter[trackId][i].scaling.y = scaling;
                    orbiter[trackId][i].scaling.z = scaling;
                    
                    aqa.levelBars[trackId][i].top = 960 - scaling*200 + "px";
                    aqa.levelBars[trackId][i].height = scaling*200 + "px";
                }
            } catch(err) {
                console.log("Analyzer error:" + err);
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
    console.log("trigger new sound trackId " + trackId);
    var queryId = trackId + "_" + aqa.tempo + "_" + Date.now();
    oReq.open("GET", aqa.baseUrl + "newclip?id=" + queryId + "&tempo=" + aqa.tempo + "&basenote=" + aqa.basenote + "&scale=" + aqa.scale + "&sessionId=" + aqa.sessionId);
    oReq.send();
};
