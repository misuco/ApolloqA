function newSoundMesh(x,y,z,trackUrl) {
    console.log("newSoundMesh")
    
    let worldObject = {};
    worldObject.trackUrl=trackUrl;
    
    let mesh = BABYLON.MeshBuilder.CreateSphere("worldObject", {
        diameter: 1.5
    }, scene);

    mesh.position.x=x;
    mesh.position.y=y;
    mesh.position.z=z;
    
    worldObject.mesh = mesh;
    
    BABYLON.CreateSoundAsync(trackUrl, trackUrl, {
        spatialEnabled: true,
        spatialMaxDistance: 20
    }).then(track => {
        const currentTime = track.engine.currentTime;
        const nextCycleTime = (Math.floor(currentTime / aqa.cycleTime) + 1)*aqa.cycleTime
        const waitTime = nextCycleTime - currentTime;
        console.log("track ready "+ trackUrl + " at " + currentTime + " next cycle " + nextCycleTime + " wait " + waitTime );
        track.spatial.attach(worldObject.mesh);
        track.play({
            loop: true,
            waitTime: waitTime
        });
        worldObject.track=track;
        //generateNewSound();
    }).catch(err => {
        console.error("cannot play sound:" + trackUrl + " " + err);
        //generateNewSound();
    });
    
    BABYLON.CreateAudioBusAsync(trackUrl, {
        analyzerEnabled: true
    }).then(bus => {
        bus.analyzer.fftSize=128;
        worldObject.analyzer = bus;
        console.log("analyzer bus ready: " + trackUrl);
    }).catch(err => {
        console.error("cannot analyze sound:" + trackUrl + " " + err);
    });
}

var generateNewSound = function() {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function() {
        if (this.response.includes("Error")) {
            console.log("server error!!!");
        } else {
            const trackUrl=this.response + ".ogg";
            let randX = aqa.spaceshipMesh.position.x + Math.random() * 20 - 10;
            let randY = aqa.spaceshipMesh.position.y + Math.random() * 20 - 10;
            let randZ = aqa.spaceshipMesh.position.z + Math.random() * 10;
            let soundMesh = newSoundMesh(randX,randY,randZ,trackUrl);
        }
    });

    let quantize_selected = aqa.htmlGui.quantize(0);
    let quantize_real = Math.pow(2,quantize_selected);

    let len_selected = aqa.htmlGui.len();
    let len_real = Math.pow(2,len_selected);

    let trackId=0;
    
    const sf2Nr = aqa.htmlGui.instrument(0);
    const sf2Json = aqa.instruments[sf2Nr];
    const sf2File = sf2Json.soundfont;
    const instrumentPresCount = sf2Json.presets.length;
    if(instrumentPresCount<=0) {
        console.log("Instrument preset count <=0");
        return;
    }
    
    const presetJson = sf2Json.presets[aqa.getRandomInt(instrumentPresCount-1)];
    
    console.log("presetJson.name " + presetJson.name + " presetJson.nr " + presetJson.nr + " presetJson.bank " + presetJson.bank);
    console.log("trigger new sound trackId " + trackId + " quantize " + quantize_selected + " " + quantize_real );
    
    var queryId = trackId + "_" + aqa.tempo + "_" + Date.now();
    oReq.open("GET", aqa.baseUrl + "newclip"
    + "?id=" + queryId
    + "&tempo=" + aqa.tempo
    + "&chords=" + aqa.htmlGui.chords
    + "&sf2file=" + encodeURIComponent(sf2File)
    + "&presetNr=" + encodeURIComponent(presetJson.nr)
    + "&presetName=" + encodeURIComponent(presetJson.name)
    + "&presetBank=" + encodeURIComponent(presetJson.bank)
    + "&len=" + len_real
    + "&quantize=" + quantize_real
    + "&density=" + aqa.htmlGui.density(0)
    + "&sessionId=" + aqa.sessionId);

    oReq.send();
};
