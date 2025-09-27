
// GUI
var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

advancedTexture.parseFromURLAsync("js/guiTexture.json")
.then( (gui)=> {
    console.log("GUI loaded "+gui);
    
    var muteButton=[];
    
    for(let i=0;i<4;i++) {
        aqa.calcButton[i]=gui.getControlByName("Calc"+(i+1));
        aqa.calcButton[i].onPointerUpObservable.add(function() {
            if(orbitertrackCalc[i]===false) {
                orbitertrackCalc[i] = true;
                aqa.calcButton[i].color="#FF3333FF"
                triggerNewSound(i);
            }
        });
        
        muteButton[i]=gui.getControlByName("Mute"+(i+1));
        muteButton[i].onPointerUpObservable.add(function() {
            console.log("mute "+i);
            orbitertrackMute[i]=!orbitertrackMute[i];
            if(orbitertrackMute[i]) {
                muteButton[i].color="#FF3333FF"
                if(orbitertrack[i]) {
                    orbitertrack[i].setVolume(0);
                }
            } else {
                muteButton[i].color="#FFFFFFFF"
                if(orbitertrack[i]) {
                    orbitertrack[i].setVolume(orbitertrackVolume[i]);
                }
            }
        });
        var fader=gui.getControlByName("Vol"+(i+1));
        fader.onValueChangedObservable.add(function(value) {
            orbitertrackVolume[i]=value/100;
            if(orbitertrack[i]) {
                orbitertrack[i].setVolume(value/100);
            }
        });
    }
})
.catch((err) => {
    console.log("error loading GUI "+err);
});

/*
var buttonFunction="start"
var button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", buttonFunction);
button1.width = "450px"
button1.height = "250px";
button1.color = "white";
button1.cornerRadius = 125;
button1.background = "orange";
button1.fontSize = "75px";
button1.onPointerUpObservable.add(function() {
    if(buttonFunction==="start") {
        //button1.isVisible=false
        triggerNewSound(0)
        syncTrackTimer()
        buttonFunction="next"
        button1.textBlock.text=buttonFunction
    } else {
        nextSound()
    }
});
advancedTexture.addControl(button1);
*/