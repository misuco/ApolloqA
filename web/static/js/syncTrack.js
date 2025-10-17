//// OBJECTS
var readyTack = [false,false,false,false];
var readyAnalyzer = [false,false,false,false];

var syncTrackRunning = false;
let tTarget=0;
let tJitter=0;
let tRec=0;
let tRecMax=4;

var syncTrackTimer = function() {
    let tCycle=6e4 / aqa.tempo;
    if(syncTrackRunning===false) {
        syncTrackRunning = true;
        tTarget=Date.now();
    } else {
        aqa.cycleNr++;
        if(aqa.cycleNr>4) {
            aqa.cycleNr=1;
        }
        updateNetHeaderBar();
        tTarget+=tCycle;
    }
    
    let now=Date.now();
    let nextSyncInMs = tTarget-now;
    tJitter=nextSyncInMs-tCycle;
    
    if(aqa.cycleNr===1) {
        if(aqa.recording) {
            tRec++;
        }
        if(aqa.recArmed) {
            aqa.mediaRecorder.start();
            console.log("Recorder started.");
            record.style.background = "red";
            aqa.recArmed=false;
            aqa.recording=true;
            tRec=0;
        }
        if(aqa.stopArmed) {
            aqa.mediaRecorder.stop();
            console.log(aqa.mediaRecorder.state);
            console.log("Recorder stopped.");
            stop.style.background = "green";
            aqa.stopArmed=false;
            aqa.recording=false;
        }
        
        if(aqa.recording && tRec+1>=tRecMax) {
            aqa.stopArmed=true;
            record.style.background = "";
            record.style.color = "";
            stop.disabled = true;
            record.disabled = false;
            stop.style.background = "orange";
        }
        
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
    }
    
    //console.log("time:"+tTarget+" next sync in " + nextSyncInMs + " ms jitter: "+tJitter);
    setTimeout(syncTrackTimer, nextSyncInMs);
};
