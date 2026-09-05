const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const glCanvas = document.getElementById("glcanvas");
const gl = glCanvas.getContext("webgl");

const vs = `
attribute vec3 position;
attribute vec4 color;
uniform mat4 mvpMatrix;
varying vec4 vColor;

void main(void) {
    vColor = color;
    gl_Position = mvpMatrix * vec4(position, 1.0);
}
`;

const fs = `
precision mediump float;
varying vec4 vColor;

void main(void) {
    gl_FragColor = vColor;
}
`;

const v_shader = create_shader(vs, "vs");
const f_shader = create_shader(fs, "fs");

const prg = create_program(v_shader, f_shader);

const attLocation = new Array(2);
attLocation[0] = gl.getAttribLocation(prg, "position");
attLocation[1] = gl.getAttribLocation(prg, "color");

const attStride = new Array(2);
attStride[0] = 3;
attStride[1] = 4;

function create_shader(s, type) {
    let shader;
    switch (type) {
        case "vs":
            shader = gl.createShader(gl.VERTEX_SHADER);
            break;
        case "fs":
            shader = gl.createShader(gl.FRAGMENT_SHADER);
            break;
        default:
            return null;
    }

    gl.shaderSource(shader, s);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    }
    else {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
}

function create_program(vs, fs) {
    const program = gl.createProgram();

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);

    gl.linkProgram(program);

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.useProgram(program);
        return program;
    } else {
        alert(gl.getProgramInfoLog(program));
        return null;
    }
}

// VBOを生成する関数
function create_vbo(data) {
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
}

const keys = {};//キーの状態
document.addEventListener("keydown", (e) => { keys[e.code] = true; });//キーが押された時
document.addEventListener("keyup", (e) => { keys[e.code] = false; });//キーが押されてない時

canvas.addEventListener("click", () => {
    canvas.requestPointerLock();//ポインター固定
});

//みえるようになったり見えなくなったりしたとき
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        if (document.pointerLockElement === canvas) {
            document.exitPointerLock();
        }
    }
});

//フォーカスが外れたとき
window.addEventListener("blur", () => {
    if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
    }
});

//キャンバスがクリックされた時
canvas.addEventListener("mousedown", (e) => {
    if (document.pointerLockElement !== canvas) return;

    if (e.button === 0) {
        breakBlock();
    }
    if (e.button === 2) {
        placeBlock();
    }
});

//右クリックでメニューが出ない
canvas.addEventListener("contextmenu", (e) => { e.preventDefault(); });

//カメラの向きを変える
document.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement !== canvas) return;

    camera.rot.y -= e.movementX * data.mouseSensitivity;
    camera.rot.x -= e.movementY * data.mouseSensitivity;

    camera.rot.x = Math.max(-90, Math.min(90, camera.rot.x));
});

window.addEventListener("resize", () => { resize(); });

//チャンク
let chunks = [];

//webgl用
let vertex_position;
let vertex_color;
let triangle_count;

const data = {
    chunk: { x: 16, y: 32, z: 16 },
    gravity: -0.008,
    mouseSensitivity: 0.03,
    kisyu: 1
};

//プレイヤー
//幅0.6,高さ1.8,厚さ0.6
//目の高さは1.6
//player.pos.xは真ん中yは下端zは真ん中
const player = {
    pos: { x: 0, y: 8, z: 0, chunkX: null, chunkZ: null },
    moveSpeed: 0.08,
    jumpSpeed: 0.15,
    velocityY: 0
};

const camera = {
    pos: { x: player.pos.x, y: player.pos.y + 1.6, z: player.pos.z + 0.3 },
    //親指を?軸正方向に向けた時指が巻く方が?軸回転正方向
    rot: { x: -40, y: 30, z: 0, nextX: null, nextY: null, xRad: null, yRad: null, zRad: null, sinX: null, cosX: null, sinY: null, cosY: null, sinZ: null, cosZ: null },
    FOV: 90,
    near: 0.05,
};

//チャンク生成
for (let i = -3; i <= 6; i++) {
    for (let j = -3; j <= 6; j++) {
        chunks.push(new chunk(i, j));
    }
}

//キャンバスの大きさ変更
function resize() {
    const dpr = 0.25;

    const w = window.innerWidth;
    const h = window.innerHeight;

    glcanvas.style.width = w + "px";
    glcanvas.style.height = h + "px";
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    glcanvas.width = w * dpr;
    glcanvas.height = h * dpr;
    canvas.width = w * dpr;
    canvas.height = h * dpr;

    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
}

//度数法からラジアンに変換
function degToRad(d) {
    return d * (Math.PI / 180);
}

let frameCount = 0;
let lastFpsTime = performance.now();
let fps = 0;

function calculateFPS(now) {
    frameCount++;
    // 0.1秒ごとにFPS(一秒あたりの処理数)を更新
    if (now - lastFpsTime >= 100) {
        //小数第(0の数)位まで
        fps = Math.round(((frameCount * 1000) / (now - lastFpsTime)) * 10000) / 10000;
        frameCount = 0;
        lastFpsTime = now;
    }
}

function mainLoop(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    camera.rot.xRad = degToRad(camera.rot.x);
    camera.rot.yRad = degToRad(camera.rot.y);
    camera.rot.zRad = degToRad(camera.rot.z);

    camera.rot.sinX = Math.sin(camera.rot.xRad);
    camera.rot.cosX = Math.cos(camera.rot.xRad);
    camera.rot.sinY = Math.sin(camera.rot.yRad);
    camera.rot.cosY = Math.cos(camera.rot.yRad);
    camera.rot.sinZ = Math.sin(camera.rot.zRad);
    camera.rot.cosZ = Math.cos(camera.rot.zRad);

    //-----行列関連処理-----
    //matIVオブジェクトを生成
    const m = new matIV();

    const mMatrix = m.identity(m.create());
    const vMatrix = m.identity(m.create());
    const pMatrix = m.identity(m.create());
    //uniformに渡す行列
    const mvpMatrix = m.identity(m.create());

    //ビュー座標変換行列
    //カメラローカル(0,1,0)をワールド座標に逆変換して上方向ベクトルたすカメラ座標にする
    const u = cameraToWorld({ x: 0, y: 1, z: 0 });
    //カメラローカル(0,0,-1)をワールド座標に逆変換してターゲットを計算
    const s = cameraToWorld({ x: 0, y: 0, z: -1 });

    m.lookAt(
        [camera.pos.x, camera.pos.y, camera.pos.z],
        [s.x, s.y, s.z],
        [u.x - camera.pos.x, u.y - camera.pos.y, u.z - camera.pos.z],
        vMatrix
    );

    //プロジェクション座標変換行列
    m.perspective(camera.FOV, glCanvas.width / glCanvas.height, 0.01, 100, pMatrix);

    //各行列を掛け合わせ座標変換行列を完成させる
    m.multiply(pMatrix, vMatrix, mvpMatrix);
    m.multiply(mvpMatrix, mMatrix, mvpMatrix);

    //uniformLocationの取得
    const uniLocation = gl.getUniformLocation(prg, "mvpMatrix");

    //uniformLocationへ座標変換行列を登録
    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, triangle_count * 3);

    //移動
    playerMove();

    calculateFPS(now);

    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.fillText(`fps:${fps}`, 10, 10);
    ctx.fillText(`x:${player.pos.x}`, 10, 20);
    ctx.fillText(`y:${player.pos.y}`, 10, 30);
    ctx.fillText(`z:${player.pos.z}`, 10, 40);
    ctx.fillText(`rotX:${camera.rot.x}`, 10, 50);
    ctx.fillText(`rotY:${camera.rot.y}`, 10, 60);

    requestAnimationFrame(mainLoop);
}

function startGame() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);

    for (const c of chunks) {
        c.generateTriangles();
    };
    generateMesh();
    
    resize();
    mainLoop();
}

function generateMesh() {
    triangle_count = 0;
    vertex_position = [];
    vertex_color = [];
    for (const c of chunks) {
        for (const t of c.triangles) {
            for (let i = 0; i < 3; i++) {
                vertex_position.push(t.verts[i].x);
                vertex_position.push(t.verts[i].y);
                vertex_position.push(t.verts[i].z);

                vertex_color.push(t.color[0] / 255);
                vertex_color.push(t.color[1] / 255);
                vertex_color.push(t.color[2] / 255);
                vertex_color.push(t.color[3]);
            }
            triangle_count++;
        }
    };
    // VBOの生成
    const position_vbo = create_vbo(vertex_position);
    const color_vbo = create_vbo(vertex_color);

    // VBOをバインドし登録する(位置情報)
    gl.bindBuffer(gl.ARRAY_BUFFER, position_vbo);
    gl.enableVertexAttribArray(attLocation[0]);
    gl.vertexAttribPointer(attLocation[0], attStride[0], gl.FLOAT, false, 0, 0);

    // VBOをバインドし登録する(色情報)
    gl.bindBuffer(gl.ARRAY_BUFFER, color_vbo);
    gl.enableVertexAttribArray(attLocation[1]);
    gl.vertexAttribPointer(attLocation[1], attStride[1], gl.FLOAT, false, 0, 0);
}

startGame();
