function drawZBufferTriangle(p0, p1, p2, color) {
    //バウンディングボックス
    //画面内のみ
    const minX = Math.max(0, Math.floor(Math.min(p0.x, p1.x, p2.x)));
    const maxX = Math.min(canvas.width - 1, Math.ceil(Math.max(p0.x, p1.x, p2.x)));
    const minY = Math.max(0, Math.floor(Math.min(p0.y, p1.y, p2.y)));
    const maxY = Math.min(canvas.height - 1, Math.ceil(Math.max(p0.y, p1.y, p2.y)));

    //符号付面積
    const area = (p1.y - p2.y) * (p0.x - p2.x) - (p0.y - p2.y) * (p1.x - p2.x);
    if (area === 0) return;

    ctx.fillStyle = color;
    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            //ピクセルの中心
            const px = x + 0.5;
            const py = y + 0.5;

            //w0は(p, v1, v2)の三角形の面積を(v0, v1, v2)の三角形の面積で割ったもの
            const w0 = ((p1.y - p2.y) * (px - p2.x) - (py - p2.y) * (p1.x - p2.x)) / area;

            const w1 = ((py - p2.y) * (p0.x - p2.x) - (p0.y - p2.y) * (px - p2.x)) / area;

            const w2 = 1 - w0 - w1;

            const inSide = (w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0);
            if (!inSide) {
                continue;
            }

            //深さ(小さいほうが遠い)
            const invZ = w0 * p0.invZ + w1 * p1.invZ + w2 * p2.invZ;
            const index = y * canvas.width + x;

            if (invZ <= zBuffer[index]) {
                continue;
            }

            zBuffer[index] = invZ;
            ctx.fillRect(x, y, 1, 1);
        }
    }
}