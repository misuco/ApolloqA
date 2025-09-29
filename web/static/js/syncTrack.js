//// OBJECTS
var readyTack = [false,false,false,false];
var readyAnalyzer = [false,false,false,false];

var syncTrackRunning = false;

var syncTrackTimer = function() {
    syncTrackRunning = true;
    let nextSyncInMs = 6e4 * 4 / aqa.tempo;
    for(let i=0;i<4;i++) {
        if(readyTack[i] && readyAnalyzer[i]) {
            orbitertrack[i].outBus=orbiteranalyzer[i];
            orbitertrack[i].play({
                loop: true
            });
            readyTack[i]=false;
            readyAnalyzer[i]=false;
            orbitertrackCalc[i] = false;
            aqa.calcButton[i].color = "#FFFFFFFF";
            console.log("playing track " + i);
        }
    }
    console.log("next sync in " + nextSyncInMs + " ms");
    setTimeout(syncTrackTimer, nextSyncInMs);
};
