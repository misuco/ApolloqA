//// OBJECTS
var readyTack = [false,false,false,false];
var readyAnalyzer = [false,false,false,false];

const autoplayButton = document.querySelector("#autoplay");
autoplayButton.onclick = function () {
    aqa.autoplay=!aqa.autoplay;
    if(aqa.autoplay===true) {
        autoplayButton.style.background = "orange";
    } else {
        autoplayButton.style.background = "gray";
    }
}

let tTarget=0;
let tJitter=0;
let tRec=0;
let tRecMax=4;
let nextAutoTriger=0;

aqa.syncTrackTimer = function() {
    aqa.htmlGui.updateHeader();
    if(aqa.cycleNr===0) {
        
        if(aqa.recording) {
            tRec++;
        }
        
        if(aqa.recArmed) {
            aqa.mediaRecorder.start();
            console.log("Recorder started.");
            aqa.recArmed=false;
            aqa.recording=true;
            tRec=0;
            mic_record_button[aqa.recTrackId].style.background = "red";
        }
        
        if(aqa.stopArmed) {
            aqa.mediaRecorder.stop();
            console.log(aqa.mediaRecorder.state);
            console.log("Recorder stopped.");
            mic_stop_button.style.background = "";
            aqa.stopArmed=false;
            aqa.recording=false;
            for(let i=0;i<4;i++) {
                mic_record_button[i].style.background = "";
                mic_record_button[i].disabled = false;
            }
        }

        // stop after max rec time
        if(aqa.recording && tRec+1>=tRecMax) {
            aqa.stopArmed=true;
            mic_record_button[aqa.recTrackId].style.background = "";
            mic_record_button[aqa.recTrackId].disabled = false;
            mic_stop_button.disabled = true;
            mic_stop_button.style.background = "orange";
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
                aqa.htmlGui.setCalcButtonColor(i,"green");
                console.log("playing track " + i);
            }
        }
        
        // auto trigger next track calc
        
        if(aqa.autoplay===true) {
            nextAutoTriger++;
            if(nextAutoTriger>3) {
                nextAutoTriger=0;
            }
            if(orbitertrackCalc[nextAutoTriger]===false) {
                orbitertrackCalc[nextAutoTriger] = true;
                aqa.htmlGui.setCalcButtonColor(nextAutoTriger,"orange");
                triggerNewSound(nextAutoTriger);
            }
        } 
    }
    
    let tCycle=6e4 / aqa.tempo;
    if(aqa.syncTrackRunning===false) {
        aqa.syncTrackRunning = true;
        tTarget=Date.now();
    } else {
        aqa.cycleNr++;
        if(aqa.cycleNr>15) {
            aqa.cycleNr=0;
        }
        tTarget+=tCycle;
    }
    
    let now=Date.now();
    let nextSyncInMs = tTarget-now;
    tJitter=nextSyncInMs-tCycle;
    
    //console.log("time:"+tTarget+" next sync in " + nextSyncInMs + " ms jitter: "+tJitter);
    setTimeout(aqa.syncTrackTimer, nextSyncInMs);
};
