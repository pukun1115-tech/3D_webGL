/*                                                                                                                                                  */
//ワールド座標をカメラの座標に変換したものを返す
function worldToCamera(v) {

    //カメラが原点(カメラの座標を引く)
    const v1 = {
        x: v.x - camera.pos.x,
        y: v.y - camera.pos.y,
        z: v.z - camera.pos.z
    };

    //y軸回転
    const v2 = {
        x: v1.x * camera.rot.cosY - v1.z * camera.rot.sinY,
        y: v1.y,
        z: v1.x * camera.rot.sinY + v1.z * camera.rot.cosY
    };

    //x軸回転
    const v3 = {
        x: v2.x,
        y: v2.y * camera.rot.cosX + v2.z * camera.rot.sinX,
        z: -v2.y * camera.rot.sinX + v2.z * camera.rot.cosX
    };

    //z軸回転
    const v4 = {
        x: v3.x * camera.rot.cosZ + v3.y * camera.rot.sinZ,
        y: -v3.x * camera.rot.sinZ + v3.y * camera.rot.cosZ,
        z: v3.z
    };

    //変換後
    return v4;
}

// カメラのローカル座標をワールド座標に変換したものを返す
function cameraToWorld(v) {
    //z軸
    const v3 = {
        x: v.x * camera.rot.cosZ - v.y * camera.rot.sinZ,
        y: v.x * camera.rot.sinZ + v.y * camera.rot.cosZ,
        z: v.z
    };

    //x軸
    const v2 = {
        x: v3.x,
        y: v3.y * camera.rot.cosX - v3.z * camera.rot.sinX,
        z: v3.y * camera.rot.sinX + v3.z * camera.rot.cosX
    };

    //y軸
    const v1 = {
        x: v2.x * camera.rot.cosY + v2.z * camera.rot.sinY,
        y: v2.y,
        z: -v2.x * camera.rot.sinY + v2.z * camera.rot.cosY
    };

    //カメラの座標を足す
    const worldV = {
        x: v1.x + camera.pos.x,
        y: v1.y + camera.pos.y,
        z: v1.z + camera.pos.z
    };

    return worldV;
}
