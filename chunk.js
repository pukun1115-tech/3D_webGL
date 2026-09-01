class chunk {
    constructor(x, z) {
        this.x = x;
        this.z = z;

        this.map = this.createMap(data.chunk.x, data.chunk.y, data.chunk.z);

        this.triangles = [];
    }

    createMap(sizeX, sizeY, sizeZ) {
        const map = new Array(sizeX);
        for (let x = 0; x < sizeX; x++) {
            map[x] = new Array(sizeY);
            for (let y = 0; y < sizeY; y++) {
                map[x][y] = new Array(sizeZ).fill(0);
            }
        }

        for (let x = 0; x < sizeX; x++) {
            for (let z = 0; z < sizeZ; z++) {
                const dirtHeight = Math.floor(Math.random() * 3) + 2;
                for (let y = 0; y < dirtHeight; y++) {
                    map[x][y][z] = 1;//土
                }
            }
        }

        return map;
    }

    generateTriangles() {
        this.triangles = [];

        for (let x = 0; x < data.chunk.x; x++) {
            for (let y = 0; y < data.chunk.y; y++) {
                for (let z = 0; z < data.chunk.z; z++) {
                    const block = this.map[x][y][z];
                    if (block === 0) continue;

                    const bx = this.x * data.chunk.x + x;//blockX
                    const by = y;
                    const bz = this.z * data.chunk.z + z;

                    //8頂点
                    const v = [
                        { x: bx + 0, y: by + 0, z: bz + 0 },
                        { x: bx + 1, y: by + 0, z: bz + 0 },
                        { x: bx + 0, y: by + 1, z: bz + 0 },
                        { x: bx + 1, y: by + 1, z: bz + 0 },
                        { x: bx + 0, y: by + 0, z: bz + 1 },
                        { x: bx + 1, y: by + 0, z: bz + 1 },
                        { x: bx + 0, y: by + 1, z: bz + 1 },
                        { x: bx + 1, y: by + 1, z: bz + 1 },
                    ];

                    const color1 = [ 255, 0, 0, 1 ];
                    const color2 = [ 0, 255, 0, 1 ];
                    const color3 = [ 0, 0, 255, 1 ];

                    // 前面
                    if (this.isAir(x, y, z - 1)) {
                        this.triangles.push({ verts: [v[0], v[1], v[2]], color: color1 });
                        this.triangles.push({ verts: [v[1], v[3], v[2]], color: color1 });
                    }

                    // 背面
                    if (this.isAir(x, y, z + 1)) {
                        this.triangles.push({ verts: [v[4], v[6], v[5]], color: color1 });
                        this.triangles.push({ verts: [v[5], v[6], v[7]], color: color1 });
                    }

                    // 左
                    if (this.isAir(x - 1, y, z)) {
                        this.triangles.push({ verts: [v[0], v[2], v[4]], color: color3 });
                        this.triangles.push({ verts: [v[2], v[6], v[4]], color: color3 });
                    }

                    // 右
                    if (this.isAir(x + 1, y, z)) {
                        this.triangles.push({ verts: [v[1], v[5], v[3]], color: color3 });
                        this.triangles.push({ verts: [v[3], v[5], v[7]], color: color3 });
                    }

                    //上
                    if (this.isAir(x, y + 1, z)) {
                        this.triangles.push({ verts: [v[2], v[3], v[6]], color: color2 });
                        this.triangles.push({ verts: [v[3], v[7], v[6]], color: color2 });
                    }

                    //下
                    if (this.isAir(x, y - 1, z)) {
                        this.triangles.push({ verts: [v[0], v[4], v[1]], color: color2 });
                        this.triangles.push({ verts: [v[1], v[4], v[5]], color: color2 });
                    }
                }
            }
        }
    }

    isAir(x, y, z) {
        if (x < 0 || y < 0 || z < 0 || x >= data.chunk.x || y >= data.chunk.y || z >= data.chunk.z) {
            return true;//チャンク外は空気扱い
        }
        return (this.map[x][y][z] === 0);
    }

    updateVBO() {
        //
    }

    drawGL() {
        //
    }
}
