
// GUI

var menuVisible = true;
var playerVisible = false;
var confVisible = false;

var guiGenPlayer = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("Playback");

guiGenPlayer.parseFromURLAsync("js/guiTexture.json")
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
        fader.background=chanColorStr[i];
        fader.color=chanColorStr[i];
        fader.onValueChangedObservable.add(function(value) {
            orbitertrackVolume[i]=value/100;
            if(orbitertrack[i]) {
                orbitertrack[i].setVolume(value/100);
            }
        });
        
        aqa.levelBars[i]=[];
        for(let j=0;j<16;j++) {
            aqa.levelBars[i][j] = new BABYLON.GUI.Rectangle();
            aqa.levelBars[i][j].left = 40+i*240+j*12.5+"px";
            aqa.levelBars[i][j].top = "960px";
            aqa.levelBars[i][j].width = "10px";
            aqa.levelBars[i][j].height = "0px";
            aqa.levelBars[i][j].color = chanColorStr[i];
            aqa.levelBars[i][j].thickness = 0;
            aqa.levelBars[i][j].background = chanColorStr[i];
            aqa.levelBars[i][j].horizontalAlignment = 0,
            aqa.levelBars[i][j].verticalAlignment = 0,
            gui.addControl(aqa.levelBars[i][j]);    
        }
    }
    gui.rootContainer.isVisible=false;
})
.catch((err) => {
    console.log("error loading GUI "+err);
});

var guiGenConfig = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("Config");

/// Basenote Selector 

const basenoteSelect = new BABYLON.GUI.ScrollViewer("Basenote_Select");
basenoteSelect.isVisible=false;
let baseNotes=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
let buttonTop=0;
baseNotes.forEach((note,i)=>{
    const btn = BABYLON.GUI.Button.CreateSimpleButton("but", note);
    btn.horizontalAlignment = 0;
    btn.verticalAlignment = 0;
    btn.top=buttonTop+"%";
    btn.left="0px";
    btn.height="10%";
    btn.width="100%";
    btn.color="#000000FF";
    btn.background="#FFFFFFEE";
    btn.fontSize="50px";
    btn.onPointerUpObservable.add(function() {
        console.log("Selected Basenote "+note+" id "+i-1);
        aqa.buttonBasenote.textBlock.text=note;
        aqa.basenote=i-1;
        basenoteSelect.isVisible=false;
    });
    basenoteSelect.addControl(btn);
    buttonTop+=10;
    i++;
});

/// Scales Selector 
const scaleSelect = new BABYLON.GUI.ScrollViewer("Scales_Select");
scaleSelect.isVisible=false;

let buttonScalesInitText;

function receiveScalesCsv() {
    let buttonTop=0;
        
    const csv = this.responseText.replace(/\r/g, '');
    const lines = csv.split('\n');
    const fieldId = lines[0].split(';');

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const fields = line.split(';');
      if (fields.length > 1) {
          
          if(i===1) {
              buttonScalesInitText=fields[0];
          }
          //console.log("Adding scale "+fields[0]);
          const btn = BABYLON.GUI.Button.CreateSimpleButton("but", fields[0]);
          btn.horizontalAlignment = 0;
          btn.verticalAlignment = 0;
          btn.top=buttonTop+"%";
          btn.left="0px";
          btn.height="10%";
          btn.width="100%";
          btn.color="#000000FF";
          btn.background="#FFFFFFEE";
          btn.fontSize="50px";
          btn.onPointerUpObservable.add(function() {
              const scaleId=i-1;
              console.log("Selected scale "+fields[0]+" id "+scaleId);
              aqa.buttonScales.textBlock.text=fields[0];
              aqa.scale=scaleId;
              scaleSelect.isVisible=false;
          });
          scaleSelect.addControl(btn);
          buttonTop+=10;
      }
    }
}

const req = new XMLHttpRequest();
req.addEventListener("load", receiveScalesCsv);
req.open("GET", "js/scales_cleaned_sorted.csv");
req.send();

/// JSON Loader
guiGenConfig.parseFromURLAsync("js/guiGenConfig.json")
.then( (gui)=> {
    console.log("guiGenConfig loaded "+gui);
    
    // Fix caption text coordinates
    const textTempo=gui.getControlByName("Text_Tempo");
    textTempo.horizontalAlignment = 0;
    textTempo.verticalAlignment = 0;
    textTempo.top="40px";
    textTempo.left="40px";
    textTempo.text=aqa.tempo;
    
    const textBasenote=gui.getControlByName("Text_Basenote");
    textBasenote.horizontalAlignment = 0;
    textBasenote.verticalAlignment = 0;
    textBasenote.top="40px";
    textBasenote.left="320px";
    
    const textScale=gui.getControlByName("Text_Scale");
    textScale.horizontalAlignment = 0;
    textScale.verticalAlignment = 0;
    textScale.top="280px";
    textScale.left="320px";
    textScale.text=buttonScalesInitText;

    // Handle tempo slider
    const sliderTempo=gui.getControlByName("Tempo");
    sliderTempo.onValueChangedObservable.add(function(value) {
        let newTempo=Math.round(40+value*200/100);
        textTempo.text=newTempo;
        aqa.tempo=newTempo;
    });
    
    // Handle basenote button
    aqa.buttonBasenote=gui.getControlByName("Button_Basenote");
    aqa.buttonBasenote.onPointerUpObservable.add(function() {
        console.log("Select Basenote");
        basenoteSelect.isVisible=true;
    });
    
    // Handle scales button
    aqa.buttonScales=gui.getControlByName("Button_Scale");
    aqa.buttonScales.onPointerUpObservable.add(function() {
        console.log("Select Scale");
        scaleSelect.isVisible=true;
    });    
    
    guiGenConfig.addControl(basenoteSelect);
    guiGenConfig.addControl(scaleSelect);
    
    initGuiMenu();
})
.catch((err) => {
    console.log("error loading guiGenConfig "+err);
});


const guiMenu = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("Menu");
const netActBar = new BABYLON.GUI.Rectangle();
const netSessionList = [];

function initGuiMenu() {
    guiMenu.parseFromURLAsync("js/guiMenu.json")
    .then( (gui)=> {
        console.log("guiMenu loaded "+gui);
        
        const buttonMenu = gui.getControlByName("Button_Menu");
        const buttonPlayer = gui.getControlByName("Button_Player");
        const buttonConfig =gui.getControlByName("Button_Config");
        
        const configRoot = guiGenConfig.rootContainer;
        configRoot.isVisible=false;
        
        const playerRoot = guiGenPlayer.rootContainer;
        playerRoot.isVisible=false;
        
        buttonMenu.onPointerUpObservable.add(function() {
            const newState=!menuVisible;
            menuVisible=newState;
            buttonPlayer.isVisible=newState;
            buttonConfig.isVisible=newState;
        });
        
        buttonConfig.onPointerUpObservable.add(function() {
            if(confVisible===true) {
                confVisible=false;
                configRoot.isVisible=false;
            } else {
                confVisible=true;
                playerVisible=false;
                configRoot.isVisible=true;
                playerRoot.isVisible=false;
            }
        });
        
        buttonPlayer.onPointerUpObservable.add(function() {
            if(playerVisible===true) {
                playerVisible=false;
                playerRoot.isVisible=false;
            } else {
                confVisible=false;
                playerVisible=true;
                playerRoot.isVisible=true;
                configRoot.isVisible=false;
            }
        });
        
        netActBar.left = "40px";
        netActBar.top = "1000px";
        netActBar.width = "10px";
        netActBar.height = "30px";
        netActBar.color = "green";
        netActBar.thickness = 0;
        netActBar.background = "green";
        netActBar.horizontalAlignment = 0;
        netActBar.verticalAlignment = 0;
        gui.addControl(netActBar);
        
        for(let i=0;i<5;i++) {
            netSessionList[i] = new BABYLON.GUI.Rectangle();
            netSessionList[i].left = 100+i*100+"px";
            netSessionList[i].top = "1000px";
            netSessionList[i].width = "80px";
            netSessionList[i].height = "30px";
            netSessionList[i].color = "green";
            netSessionList[i].thickness = 0;
            netSessionList[i].background = "green";
            netSessionList[i].horizontalAlignment = 0;
            netSessionList[i].verticalAlignment = 0;
            netSessionList[i].isVisible = false;
            gui.addControl(netSessionList[i]);
        }
    })
    .catch((err) => {
        console.log("error loading guiMenu "+err);
    });    
}

