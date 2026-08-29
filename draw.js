/*                                                                                                                                                  */
function chunkDraw() {
    for (const c of chunks) {
        for (const tri of c.triangles) {
            const v1 = worldToCamera(tri.verts[0]);
            const v2 = worldToCamera(tri.verts[1]);
            const v3 = worldToCamera(tri.verts[2]);

            const cliped = clip3DTriangle(v1, v2, v3, tri.color);
            for (const t of cliped) {
                const a = projectPoint(t.verts[0]);
                const b = projectPoint(t.verts[1]);
                const c = projectPoint(t.verts[2]);
                if (a === null || b === null || c === null) continue;
                drawZBufferTriangle(a, b, c, t.color);
            }
        }
    }
}

//camera.nearでクリップした三角形0 or 1 or 2個を返す
//クリップ後の三角形は元の三角形と同じ反時計回りの頂点の順番
function clip3DTriangle(a, b, c, color) {
    const aok = (a.z >= camera.near);
    const bok = (b.z >= camera.near);
    const cok = (c.z >= camera.near);

    const okCount = aok + bok + cok;

    //描画しない
    if (okCount === 0) return [];

    //クリップする必要なし
    if (okCount === 3) return [{ verts: [a, b, c], color: color }];

    //一つ返す
    if (aok + bok + cok === 1) {
        if (aok) {
            const rb = intersectNear(a, b);//rbはreturnするaとbの交点
            const rc = intersectNear(a, c);
            return [{ verts: [a, rb, rc], color: color }];
        }
        if (bok) {
            const ra = intersectNear(b, a);
            const rc = intersectNear(b, c);
            return [{ verts: [ra, b, rc], color: color }];
        }
        if (cok) {
            const ra = intersectNear(c, a);
            const rb = intersectNear(c, b);
            return [{ verts: [ra, rb, c], color: color }];
        }
    }

    //二つ返す
    if (aok + bok + cok === 2) {
        if (!aok) {
            const rb = intersectNear(b, a);
            const rc = intersectNear(c, a);
            return [{ verts: [rb, b, rc], color: color }, { verts: [rc, b, c], color: color }];
        }
        if (!bok) {
            const rc = intersectNear(c, b);
            const ra = intersectNear(a, b);
            return [{ verts: [rc, c, ra], color: color }, { verts: [ra, c, a], color: color }];
        }
        if (!cok) {
            const ra = intersectNear(a, c);
            const rb = intersectNear(b, c);
            return [{ verts: [ra, a, rb], color: color }, { verts: [rb, a, b], color: color }];
        }
    }
}

//線分とcamera.nearの交点を返す
function intersectNear(a, b) {
    const t = (a.z - camera.near) / (a.z - b.z);//tはaから交点までの割合
    return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        z: camera.near
    };
}

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

//投影座標返す(canvas座標)(点)
function projectPoint(v) {
    //ラジアンFOV
    //カメラとスクリーンの距離を求める
    const f = 1 / Math.tan((camera.radFOV / 2));

    if (v.z < camera.near) return null;

    const x = (v.x * f) / v.z;
    const y = (v.y * f) / v.z;
    return {
        x: canvas.width / 2 + (canvas.height / 2) * x,
        y: canvas.height / 2 - (canvas.height / 2) * y,
        //深さ
        invZ: 1 / v.z
    };
}