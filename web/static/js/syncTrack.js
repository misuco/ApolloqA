//// OBJECTS

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

        let userCount=aqa.orbiter.size;
        console.log("check ready tracks for user count "+userCount)
        
        aqa.orbiter.forEach((orbiter, userId) => {
            let readyTrack=aqa.readyTrack.get(userId);
            let readyAnalyzer=aqa.readyAnalyzer.get(userId);
            let userTrackCount=readyTrack.length;
            console.log("check userId "+userId+" track count "+userTrackCount)
            
            for(let trackId=0;trackId<userTrackCount;trackId++) {
                if(readyTrack[trackId] && readyAnalyzer[trackId]) {
                    if (orbiter.track[trackId]) {
                        console.log("Cleanup track "+trackId);
                        console.log("Cleanup analyzer observer:" + orbiter.trackObserver[trackId]);
                        scene.onBeforeRenderObservable.remove(orbiter.trackObserver[trackId]);
                        orbiter.track[trackId].stop();
                        orbiter.track[trackId].dispose();
                    }
                    if (orbiter.analyzer[trackId]) {
                        orbiter.analyzer[trackId].dispose();
                    }
                    orbiter.analyzer[trackId]=readyAnalyzer[trackId];
                    orbiter.track[trackId]=readyTrack[trackId];
                    orbiter.track[trackId].outBus=orbiter.analyzer[trackId];
                    orbiter.track[trackId].play({
                        loop: true
                    });
                    readyTrack[trackId]=false;
                    readyAnalyzer[trackId]=false;
                    
                    orbiter.trackObserver[trackId] = scene.onBeforeRenderObservable.add(() => {
                        try {
                            //console.log("orbiter trackObserver user "+userId+" trackId "+i);
                            //const frequencies = bus.analyzer.getByteFrequencyData();
                            const frequencies = orbiter.analyzer[trackId].analyzer.getFloatFrequencyData();
                            //console.log("frequencies: "+frequencies);
                            for (let freqId = 0; freqId < 16; freqId++) {
                                let scaling = frequencies[freqId]/255;
                                if(freqId==0) {scaling=1;}
                                orbiter[trackId][freqId].scaling.x = scaling;
                                orbiter[trackId][freqId].scaling.y = scaling;
                                orbiter[trackId][freqId].scaling.z = scaling;
                            }
                            console.log("Added analyzer observer:" + orbiter.trackObserver[trackId]);
                        } catch(err) {
                            console.log("Error adding analyzer observer:" + err);
                        }
                    });
                    
                    if(userId===aqa.sessionId) {
                        orbiter.trackCalc[trackId] = false;
                        aqa.htmlGui.setCalcButtonColor(trackId,"green");
                    }
                    
                    console.log("playing track " + trackId + " for user " + userId);
                }
            }
        });

        // auto trigger next track calc

        if(aqa.autoplay===true) {
            nextAutoTriger++;
            if(nextAutoTriger>3) {
                nextAutoTriger=0;
            }
            if(aqa.myOrbiter.trackCalc[nextAutoTriger]===false) {
                aqa.myOrbiter.trackCalc[nextAutoTriger] = true;
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
