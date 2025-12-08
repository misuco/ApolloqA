
function initObjects(userId,parent) {
    aqa.orbiter[userId] = [];
    aqa.orbiterPivot[userId] = [];
    aqa.orbitertrack[userId] = [];
    aqa.orbitertrackUrl[userId] = [];
    aqa.orbiteranalyzer[userId] = [];
    aqa.orbitertrackVolume[userId] = [];
    aqa.orbitertrackMute[userId] = [];
    aqa.orbitertrackObserver[userId] = [];
    aqa.orbitertrackCalc[userId] = [];
    aqa.readyTrack[userId] = [];
    aqa.readyAnalyzer[userId] = [];
    for (let i = 0; i < aqa.nTracks; i++) {
        aqa.orbiter[userId][i] = [];
        aqa.orbiterPivot[userId][i] = [];
        aqa.orbiterPivot[userId][i] = new BABYLON.TransformNode("transformNode_"+userId+"_"+i);
        aqa.orbiterPivot[userId][i].parent=parent;

        aqa.orbitertrackVolume[userId][i] = .9;
        aqa.orbitertrackMute[userId][i] = false;
        aqa.orbitertrackCalc[userId][i] = false;
        for (let j = 0; j < 16; j++) {
            /*
            aqa.orbiter[userId][i][j] = BABYLON.MeshBuilder.CreateSphere("orbiter" + i, {
                diameter: 1
            }, scene);
            */
            aqa.orbiter[userId][i][j] = BABYLON.MeshBuilder.CreateBox("orbiter" + i, {
                width: 1, depth: 1, height: 1
            }, scene);
            
            aqa.orbiter[userId][i][j].isVisible = true;
            aqa.orbiter[userId][i][j].material = aqa.chanColor[i];
            aqa.orbiter[userId][i][j].parent = aqa.orbiterPivot[userId][i];
        }
    }
}

var playTrack = function(userId, trackUrl, trackId) {
    console.log("play track " + userId + " url: " + trackUrl + " id: " + trackId );

    BABYLON.CreateSoundAsync(trackUrl, trackUrl, {
        spatialEnabled: true,
        spatialMaxDistance: 20
    }).then(track => {
        console.log("track ready "+ trackId );

        track.spatial.attach(aqa.orbiter[userId][trackId][0]);

        if(aqa.orbitertrackMute[userId][trackId]==true) {
            track.setVolume(0);
        } else {
            track.setVolume(aqa.orbitertrackVolume[userId][trackId]);
        }

        aqa.readyTrack[userId][trackId] = track;
        
        if (aqa.syncTrackRunning === false) {
            aqa.syncTrackTimer();
        }

    }).catch(err => {
        console.error("cannot play sound:" + trackUrl + " " + err);
    });

    BABYLON.CreateAudioBusAsync(trackUrl, {
        analyzerEnabled: true
    }).then(bus => {
        bus.analyzer.fftSize=128;
        aqa.orbiteranalyzer[userId][trackId] = bus;
        aqa.readyAnalyzer[userId][trackId] = true;
        console.log("analyzer bus ready: " + trackUrl);

        aqa.orbitertrackObserver[userId][trackId] = scene.onBeforeRenderObservable.add(() => {
            try {
                console.log("orbitertrackObserver user "+userId+" trackId "+trackId);
                const frequencies = bus.analyzer.getByteFrequencyData();
                //const frequencies = aqa.orbiteranalyzer[userId][trackId].analyzer.getFloatFrequencyData();
                //console.log("frequencies: "+frequencies);
                for (let i = 0; i < 16; i++) {
                    let scaling = frequencies[i]/255;
                    if(i==0) {scaling=1;}
                    aqa.orbiter[userId][trackId][i].scaling.x = scaling;
                    aqa.orbiter[userId][trackId][i].scaling.y = scaling;
                    aqa.orbiter[userId][trackId][i].scaling.z = scaling;
                }
            } catch(err) {
                console.log("Analyzer error:" + err);
            }
        });

        console.log("added analyzer observer:" + aqa.orbitertrackObserver[userId][trackId]);
        console.log("analyzing sound:" + trackUrl);
    }).catch(err => {
        console.error("cannot alanyze sound:" + trackUrl + " " + err);
    });
};

var triggerNewSound = function(userId,trackId) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function() {
        if (this.response.includes("Error")) {
            console.log("server error!!!");
        } else {
            const trackUrl=this.response + ".ogg";
            aqa.orbitertrackUrl[userId][trackId]=trackUrl;
            playTrack(userId, trackUrl, trackId);
            if(trackId<aqa.nTracks) {
                sendTrackList(aqa.orbitertrackUrl[userId]);
            }
        }
    });

    let quantize_selected = aqa.htmlGui.quantize(trackId);
    let quantize_real = Math.pow(2,quantize_selected);

    let len_selected = aqa.htmlGui.len();
    let len_real = Math.pow(2,len_selected);

    console.log("trigger new sound userId " + userId + " trackId " + trackId + " quantize " + quantize_selected + " " + quantize_real );
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
