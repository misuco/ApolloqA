/// Object state variables
var orbiter = [];
var orbitertrack = [];
var orbitertrackUrl = [];
var orbiteranalyzer = [];
var orbitertrackVolume = [];
var orbitertrackMute = [];
var orbitertrackCalc = [];
var orbitertrackObserver = [];

for (let i = 0; i < aqa.nTracks; i++) {
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
            const trackUrl=this.response + ".ogg";
            orbitertrackUrl[trackId]=trackUrl;
            playTrack(trackUrl, trackId);
            if(trackId<aqa.nTracks) {
                sendTrackList(orbitertrackUrl);
            }
            for (let i = 0; i < 16; i++) {
                orbiter[trackId][i].isVisible = true;
            }
        }
    });

    let quantize_selected = aqa.htmlGui.quantize(trackId);
    let quantize_real = Math.pow(2,quantize_selected);
    
    let len_selected = aqa.htmlGui.len();
    let len_real = Math.pow(2,len_selected);
    
    console.log("trigger new sound trackId " + trackId + " quantize " + quantize_selected + " " + quantize_real );
    var queryId = trackId + "_" + aqa.tempo + "_" + Date.now();
    oReq.open("GET", aqa.baseUrl + "newclip"
    + "?id=" + queryId 
    + "&tempo=" + aqa.tempo 
    + "&chords=" + aqa.htmlGui.chords
    + "&instrument=" + aqa.htmlGui.instrument(trackId)
    + "&len=" + len_real
    + "&quantize=" + quantize_real
    + "&density=" + aqa.htmlGui.density(trackId)
    + "&sessionId=" + aqa.sessionId);

    oReq.send();
};
