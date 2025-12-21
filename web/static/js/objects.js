function initObjects(userId,parent) {
    console.log("initObjects "+userId)
    let orbiter = {};
    orbiter.pivot = [];
    orbiter.track = [];
    orbiter.trackUrl = [];
    orbiter.analyzer = [];
    orbiter.trackVolume = [];
    orbiter.trackMute = [];
    orbiter.trackObserver = [];
    orbiter.trackCalc = [];

    for (let i = 0; i < aqa.nTracks; i++) {
        orbiter[i] = [];
        orbiter.pivot[i] = [];
        orbiter.pivot[i] = new BABYLON.TransformNode("transformNode_"+userId+"_"+i);
        orbiter.pivot[i].parent=parent;

        orbiter.trackVolume[i] = .9;
        orbiter.trackMute[i] = false;
        orbiter.trackCalc[i] = false;
        for (let j = 0; j < 16; j++) {
            /*
            orbiter[i][j] = BABYLON.MeshBuilder.CreateSphere("orbiter" + i, {
                diameter: 1
            }, scene);
            */
            orbiter[i][j] = BABYLON.MeshBuilder.CreateBox("orbiter" + i, {
                width: 1, depth: 1, height: 1
            }, scene);

            orbiter[i][j].isVisible = true;
            orbiter[i][j].material = aqa.chanColor[i];
            orbiter[i][j].parent = orbiter.pivot[i];
        }
    }

    aqa.orbiter.set(userId,orbiter);
    aqa.readyTrack.set(userId,[]);
    aqa.readyAnalyzer.set(userId,[]);
}

var playTrack = function(userId, trackUrl, trackId) {
    console.log("play track " + userId + " url: " + trackUrl + " id: " + trackId );

    let orbiter=aqa.orbiter.get(userId);
    let readyTrack=aqa.readyTrack.get(userId);
    let readyAnalyzer=aqa.readyAnalyzer.get(userId);

    BABYLON.CreateSoundAsync(trackUrl, trackUrl, {
        spatialEnabled: true,
        spatialMaxDistance: 20
    }).then(track => {
        console.log("track ready "+ trackId );

        track.spatial.attach(orbiter[trackId][0]);

        if(orbiter.trackMute[trackId]==true) {
            track.setVolume(0);
        } else {
            track.setVolume(orbiter.trackVolume[trackId]);
        }

        readyTrack[trackId] = track;

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

        readyAnalyzer[trackId] = bus;

        console.log("analyzer bus ready: " + trackUrl);

    }).catch(err => {
        console.error("cannot analyze sound:" + trackUrl + " " + err);
    });
};

var triggerNewSound = function(trackId) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function() {
        if (this.response.includes("Error")) {
            console.log("server error!!!");
        } else {
            const trackUrl=this.response + ".ogg";
            aqa.myOrbiter.trackUrl[trackId]=trackUrl;
            playTrack(aqa.sessionId, trackUrl, trackId);
            if(trackId<aqa.nTracks) {
                sendTrackList(aqa.myOrbiter.trackUrl);
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
