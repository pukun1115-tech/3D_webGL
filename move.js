function playerMove() {
    const sinY = camera.rot.sinY;
    const cosY = camera.rot.cosY;

    let nextX = player.pos.x;
    let nextZ = player.pos.z;
    let nextY = player.pos.y;

    //プレイヤーのチャンク座標
    player.pos.chunkX = Math.floor(player.pos.x / data.chunk.x);
    player.pos.chunkZ = Math.floor(player.pos.z / data.chunk.z);

    //動く速さ
    const moveSpeed = player.moveSpeed;

    //位置が動く
    if (keys["KeyW"]) {
        //x移動
        nextX += -sinY * moveSpeed;
        //z移動
        nextZ += -cosY * moveSpeed;
    }
    if (keys["KeyS"]) {
        //x移動
        nextX += +sinY * moveSpeed;
        //z
        nextZ += +cosY * moveSpeed;
    }
    if (keys["KeyA"]) {
        //x
        nextX += -cosY * moveSpeed;
        //z
        nextZ += +sinY * moveSpeed;
    }
    if (keys["KeyD"]) {
        //x
        nextX += +cosY * moveSpeed;
        //z
        nextZ += -sinY * moveSpeed;
    }

    //x移動
    if (!atari(nextX, player.pos.y, player.pos.z)) {
        player.pos.x = nextX;
    }
    //z移動
    if (!atari(player.pos.x, player.pos.y, nextZ)) {
        player.pos.z = nextZ;
    }


    //地面の上か
    const onGround = isOnGround(player.pos.x, player.pos.y, player.pos.z);

    //重力を加える
    player.velocityY += data.gravity;

    if (onGround) {
        //接地中は重力で沈み続けないようにする
        if (player.velocityY < 0) {
            player.velocityY = 0;
        }
        //ジャンプ
        if (keys["Space"]) {
            player.velocityY = player.jumpSpeed;
        }
    }

    nextY = player.pos.y + player.velocityY;
    //地面から0.001以下の距離にする(未満かも)
    if (player.velocityY < 0) {
        while (atari(player.pos.x, nextY, player.pos.z)) {
            //地面についていたら下向きのスピード0
            player.velocityY = 0;
            //地面に触れている間上に0.001ずつあげる
            nextY += 0.002;
        }
    }
    else if (player.velocityY > 0) {
        while (atari(player.pos.x, nextY, player.pos.z)) {
            //地面についていたら下向きのスピード0
            player.velocityY = 0;
            nextY -= 0.001;
        }
    }

    //player.pos.yをnextYにする
    player.pos.y = nextY;

    //FOV
    if (keys["KeyN"]) {
        camera.FOV++;
    }
    if (keys["KeyM"]) {
        camera.FOV--;
    }
    //FOV制限
    if (camera.FOV < 30) {
        camera.FOV = 30;
    }
    if (camera.FOV > 120) {
        camera.FOV = 120;
    }

    camera.pos = { x: player.pos.x, y: player.pos.y + 1.6, z: player.pos.z };
}

//プレイヤーの足元がブロックに触れているか
function isOnGround(px, py, pz) {
    return atari(px, py - 0.002, pz);
}

//プレイヤーが空中にいるか
function atari(px, py, pz) {
    const p_maxX = px + 0.3;
    const p_minX = px - 0.3;
    const p_maxZ = pz + 0.3;
    const p_minZ = pz - 0.3;
    const p_maxY = py + 1.8;
    const p_minY = py;
    const minChunkX = Math.floor(p_minX / data.chunk.x);//プレイヤーの最小xがあるチャンク
    const maxChunkX = Math.floor(p_maxX / data.chunk.x);//プレイヤーの最大xがあるチャンク
    const minChunkZ = Math.floor(p_minZ / data.chunk.z);//同じようなもん
    const maxChunkZ = Math.floor(p_maxZ / data.chunk.z);//うん

    for (const c of chunks) {
        if (c.x < minChunkX || c.x > maxChunkX || c.z < minChunkZ || c.z > maxChunkZ) continue;

        for (let x = 0; x < data.chunk.x; x++) {
            for (let z = 0; z < data.chunk.z; z++) {
                for (let y = 0; y < data.chunk.y; y++) {
                    if (c.map[x][y][z] === 0) continue;

                    const b_maxX = c.x * data.chunk.x + x + 1;
                    const b_minX = c.x * data.chunk.x + x;
                    const b_maxZ = c.z * data.chunk.z + z + 1;
                    const b_minZ = c.z * data.chunk.z + z;
                    const b_maxY = y + 1;
                    const b_minY = y;

                    const hitX = p_maxX > b_minX && p_minX < b_maxX;//x方向で重なっているか
                    const hitY = p_maxY > b_minY && p_minY < b_maxY;//y
                    const hitZ = p_maxZ > b_minZ && p_minZ < b_maxZ;//z

                    if (hitX && hitY && hitZ) {
                        //3Dで重なっている
                        return true;
                    }
                }
            }
        }
    }
    return false;//全チャンクを調べる
}