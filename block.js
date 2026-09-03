//ブロック設置
function placeBlock() {
    const rotX = degToRad(camera.rot.x);
    const rotY = degToRad(camera.rot.y);
    //breakBlockと同じ
    const direction = {
        x: Math.sin(rotY) * Math.cos(rotX),
        y: -Math.sin(rotX),
        z: -Math.cos(rotY) * Math.cos(rotX)  // ✅ マイナス符号を追加
    };

    let previousBlock = null;
    const rayStep = 0.05;
    const rayDistance = 4;

    for (let distance = 0; distance <= rayDistance; distance += rayStep) {
        const rayX = camera.pos.x + direction.x * distance;
        const rayY = camera.pos.y + direction.y * distance;
        const rayZ = camera.pos.z + direction.z * distance;

        const block = {
            x: Math.floor(rayX),
            y: Math.floor(rayY),
            z: Math.floor(rayZ)
        };

        const blockChunkX = Math.floor(block.x / data.chunk.x);
        const blockChunkZ = Math.floor(block.z / data.chunk.z);

        const targetChunk = chunks.find(c => c.x === blockChunkX && c.z === blockChunkZ);
        if (!targetChunk) continue;

        const localX = block.x - blockChunkX * data.chunk.x;
        const localY = block.y;
        const localZ = block.z - blockChunkZ * data.chunk.z;

        if (localY < 0 || localY >= data.chunk.y) {
            previousBlock = block;
            continue;
        }

        if (targetChunk.map[localX][localY][localZ] !== 0) {
            if (!previousBlock) return;

            //置くブロックがあるチャンクのxz
            const placeChunkX = Math.floor(previousBlock.x / data.chunk.x);
            const placeChunkZ = Math.floor(previousBlock.z / data.chunk.z);

            const placeChunk = chunks.find(c => (c.x === placeChunkX && c.z === placeChunkZ));
            if (!placeChunk) return;

            //チャンク内座標
            const placeX = previousBlock.x - placeChunkX * data.chunk.x;
            const placeY = previousBlock.y;
            const placeZ = previousBlock.z - placeChunkZ * data.chunk.z;
            if (placeY < 0 || placeY >= data.chunk.y) return;
            if (placeChunk.map[placeX][placeY][placeZ] !== 0) return;

            placeChunk.map[placeX][placeY][placeZ] = 1;
            if (atari(player.pos.x, player.pos.y, player.pos.z)) {
                placeChunk.map[placeX][placeY][placeZ] = 0;
                return;
            }
            placeChunk.generateTriangles();
            return;
        }

        previousBlock = block;
    }
}

//ブロック破壊
function breakBlock() {
    const rotX = degToRad(camera.rot.x);
    const rotY = degToRad(camera.rot.y);
    //長さ1のベクトルというもの?
    //xyzにいくつ進むとななめに1進むか
    const direction = {
        x: Math.sin(rotY) * Math.cos(rotX),
        y: -Math.sin(rotX),
        z: -Math.cos(rotY) * Math.cos(rotX)
    };

    const rayStep = 0.05;
    const rayDistance = 4;

    for (let distance = 0; distance <= rayDistance; distance += rayStep) {
        const rayX = camera.pos.x + direction.x * distance;
        const rayY = camera.pos.y + direction.y * distance;
        const rayZ = camera.pos.z + direction.z * distance;

        const block = {
            x: Math.floor(rayX),
            y: Math.floor(rayY),
            z: Math.floor(rayZ)
        };

        //blockのあるチャンクの座標
        const blockChunkX = Math.floor(block.x / data.chunk.x);
        const blockChunkZ = Math.floor(block.z / data.chunk.z);

        const targetChunk = chunks.find(c => (c.x === blockChunkX && c.z === blockChunkZ));
        if (!targetChunk) continue;

        //チャンク内座標
        const localX = block.x - blockChunkX * data.chunk.x;
        const localY = block.y;
        const localZ = block.z - blockChunkZ * data.chunk.z;

        if (localY < 0 || localY >= data.chunk.y) continue;
        if (targetChunk.map[localX][localY][localZ] === 0) continue;

        targetChunk.map[localX][localY][localZ] = 0;
        targetChunk.generateTriangles();
        return;
    }
}
