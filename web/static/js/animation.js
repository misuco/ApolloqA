function initAnimation() {
    scene.onBeforeRenderObservable.add(() => {
        if (!aqa.spaceshipMesh) {
            return;
        }
        const now = Date.now() / 2e3;
        const orbiterDist = 2 * Math.PI / aqa.nTracks;
        for (let j = 0; j < 16; j++) {
            for (let i = 0; i < aqa.nTracks; i++) {
                if (!aqa.orbiter[0][i]) {
                    continue;
                }
                if (i % 4 == 0) {
                    let radius = 8;
                    aqa.orbiter[0][i][j].position.x = aqa.spaceshipMesh.position.x + radius * Math.sin(now + i * orbiterDist);
                    aqa.orbiter[0][i][j].position.y = aqa.spaceshipMesh.position.y + j % 4 * .5;
                    aqa.orbiter[0][i][j].position.z = aqa.spaceshipMesh.position.z + radius * Math.cos(now + i * orbiterDist) + j / 4 * .5;
                    aqa.orbiter[0][i][j].rotation.x = now % 180 * 2;
                    aqa.orbiter[0][i][j].rotation.y = now % 90 * 4;
                } else if (i % 4 == 1) {
                    let radius = 8;
                    aqa.orbiter[0][i][j].position.x = aqa.spaceshipMesh.position.x + radius * Math.sin(now + i * orbiterDist);
                    aqa.orbiter[0][i][j].position.y = aqa.spaceshipMesh.position.y + radius * Math.cos(now + i * orbiterDist) + j / 4 * .5;
                    aqa.orbiter[0][i][j].position.z = aqa.spaceshipMesh.position.z + j % 4 * .5;
                    aqa.orbiter[0][i][j].rotation.x = now % 90 * 4;
                    aqa.orbiter[0][i][j].rotation.y = now % 180 * 2;
                } else if (i % 4 == 2) {
                    let radius = 12;
                    aqa.orbiter[0][i][j].position.x = aqa.spaceshipMesh.position.x + radius * Math.sin(now + i * orbiterDist) + j / 4 * .5;
                    aqa.orbiter[0][i][j].position.y = aqa.spaceshipMesh.position.y + j % 4 * .5;
                    aqa.orbiter[0][i][j].position.z = aqa.spaceshipMesh.position.z + radius * Math.cos(now + i * orbiterDist);
                    aqa.orbiter[0][i][j].rotation.y = now % 45 * 8;
                    aqa.orbiter[0][i][j].rotation.z = now % 180 * 2;
                } else if (i % 4 == 3) {
                    let radius = 12;
                    aqa.orbiter[0][i][j].position.x = aqa.spaceshipMesh.position.x + radius * Math.sin(now + i * orbiterDist) + j / 4 * .5;
                    aqa.orbiter[0][i][j].position.y = aqa.spaceshipMesh.position.y + radius * Math.cos(now + i * orbiterDist);
                    aqa.orbiter[0][i][j].position.z = aqa.spaceshipMesh.position.z + j % 4 * .5;
                    aqa.orbiter[0][i][j].rotation.y = now % 180 * 2;
                    aqa.orbiter[0][i][j].rotation.z = now % 45 * 8;
                }
            }
        }
    });
}
