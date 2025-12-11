function initAnimation() {
    scene.onBeforeRenderObservable.add(() => {
        if (!aqa.spaceshipMesh) {
            return;
        }
        const uptimeS = (Date.now()-aqa.startTime)/1000;
        
        //let log="";
        
        aqa.orbiter.forEach((orbiter, userId) => {
            for (let i = 0; i < aqa.nTracks; i++) {
                if (!orbiter[i]) {
                    continue;
                }
                
                let alignment = null;
                if(userId!=aqa.sessionId) {
                    let otherUser = aqa.otherUsers.get(userId);
                    if(otherUser) {
                        alignment=otherUser.pan[i];
                    } else {
                        console.log("unknown user "+userId);
                        continue;
                    }
                } else {
                    alignment=aqa.htmlGui.alignment(i);
                }
                
                //log+="alignment "+userId+" "+i+" "+ JSON.stringify(alignment)+"\n\n";
                
                let yaw_move = uptimeS * alignment.rotate_yaw % 360;
                let yaw_const = parseInt(alignment.yaw);
                let yaw_rad = (yaw_const+yaw_move)%360*2*Math.PI/360;
    
                let pitch_move = uptimeS * alignment.rotate_pitch % 360;
                let pitch_const = parseInt(alignment.pitch);
                let pitch_rad = (pitch_const+pitch_move)%360*2*Math.PI/360;
                
                let radius = alignment.radius;
                
                for (let j = 0; j < 16; j++) {
                    orbiter[i][j].position.x = j / 4 * .5;
                    orbiter[i][j].position.y = j % 4 * .5;
                    orbiter[i][j].position.z = radius;
                    orbiter.pivot[i].rotation.y = yaw_rad;
                    orbiter.pivot[i].rotation.x = pitch_rad;
                }
            }
        });
        //console.log(log);
    });
}
