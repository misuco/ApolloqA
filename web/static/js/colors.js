/// Colors

let redColor = new BABYLON.StandardMaterial("RedColor");
redColor.diffuseColor = new BABYLON.Color3.FromHexString("#FF0000");

let chanColorStr = [];
chanColorStr[0] = "#718ff0";
chanColorStr[1] = "#f8a871";
chanColorStr[2] = "#f0e871";
chanColorStr[3] = "#e171f0";

/* 

/// Alternative color scheme

chanColorStr[0] = "#2a9d8f";
chanColorStr[1] = "#e9c46a";
chanColorStr[2] = "#f4a261";
chanColorStr[3] = "#e76f51";
*/

var chanColor = [];
for(let i=0;i<4;i++) {
    chanColor[i] = new BABYLON.StandardMaterial("c"+i, scene);
    chanColor[i].diffuseColor = new BABYLON.Color3.FromHexString(chanColorStr[i]);
    chanColor[i].specularColor = new BABYLON.Color3.FromHexString(chanColorStr[i]);
    chanColor[i].emissiveColor = new BABYLON.Color3.FromHexString(chanColorStr[i]);    
    chanColor[i].freeze();
}