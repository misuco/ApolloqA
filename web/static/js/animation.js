function initAnimation() {
    scene.onBeforeRenderObservable.add(() => {
        if (!aqa.spaceshipMesh) {
            return;
        }
        const uptimeS = (Date.now()-aqa.startTime)/1000;
        
        let log="";
        
        for(let userId=0;userId<aqa.nextUserId;userId++) {
            for (let i = 0; i < aqa.nTracks; i++) {
                if (!aqa.orbiter[userId][i]) {
                    continue;
                }

                if(userId>=aqa.user2sessionId.length) {
                    console.log("animation: userId out of range:" +userId);
                    continue;
                }
                
                let alignment = null;
                if(userId>0) {
                    let otherUserSessioId=aqa.user2sessionId[userId];
                    let otherUser = aqa.otherUsers.get(otherUserSessioId);
                    if(otherUser) {
                        alignment=otherUser.pan[i];
                    } else {
                        console.log("unknown user "+otherUserSessioId);
                        continue;
                    }
                } else {
                    alignment=aqa.htmlGui.alignment(i);
                }
                
                log+="alignment "+userId+" "+i+" "+ JSON.stringify(alignment)+"\n\n";
                
                let yaw_move = uptimeS * alignment.rotate_yaw % 360;
                let yaw_const = parseInt(alignment.yaw);
                let yaw_rad = (yaw_const+yaw_move)%360*2*Math.PI/360;
    
                let pitch_move = uptimeS * alignment.rotate_pitch % 360;
                let pitch_const = parseInt(alignment.pitch);
                let pitch_rad = (pitch_const+pitch_move)%360*2*Math.PI/360;
                
                let radius = alignment.radius;
                
                for (let j = 0; j < 16; j++) {
                    aqa.orbiter[userId][i][j].position.x = j / 4 * .5;
                    aqa.orbiter[userId][i][j].position.y = j % 4 * .5;
                    aqa.orbiter[userId][i][j].position.z = radius;
                    aqa.orbiterPivot[userId][i].rotation.y = yaw_rad;
                    aqa.orbiterPivot[userId][i].rotation.x = pitch_rad;
                }
            }
        }
        console.log(log);
    });
}
