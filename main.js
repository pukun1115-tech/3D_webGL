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
`

const fs = `
precision mediump float;
varying vec4 vcolor;

void main(void) {
    gl_FragColor = vcolor;
}
`

const v_shader = create_shader(vs, "vs");
const f_shader = create_shader(fs, "fs");

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


const keys = {};//キーの状態
document.addEventListener("keydown", (e) => {keys[e.code] = true;});//キーが押された時
document.addEventListener("keyup", (e) => {keys[e.code] = false;});//キーが押されてない時

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
canvas.addEventListener("mousedown", e => {
    if (document.pointerLockElement !== canvas) return;

    if (e.button === 0) {
        breakBlock();
    }
    if (e.button === 2) {
        placeBlock();
    }
});

//右クリックでメニューが出ない
canvas.addEventListener("contextmenu", (e) => {e.preventDefault();});

//カメラの向きを変える
document.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement !== canvas) return;

    camera.rot.y += e.movementX * data.mouseSensitivity;
    camera.rot.x += e.movementY * data.mouseSensitivity;

    camera.rot.x = Math.max(-90, Math.min(90, camera.rot.x));
});

window.addEventListener("resize", () => {resize();});

//チャンク
let chunks = [];

//webgl用
let vertex_position = [];
let vertex_color = [];

const data = {
    chunk: { x: 16, y: 32, z: 16 },
    gravity: -0.01,
    mouseSensitivity: 0.03
};

//プレイヤー
//幅0.6,高さ1.8,厚さ0.6
//目の高さは1.6
//player.pos.xは真ん中yは下端zは真ん中
const player = {
    pos: { x: 5, y: 8, z: 5, chunkX: null, chunkZ: null },
    moveSpeed: 0.08,
    jumpSpeed: 0.15,
    velocityY: 0
};

const camera = {
    pos: { x: player.pos.x, y: player.pos.y + 1.6, z: player.pos.z + 0.3 },
    //y:90で右を向く
    //x:90で下を向く
    //z:90でカメラが反時計回り
    rot: { x: 0, y: 45, z: 0, xRad: null, yRad: null, zRad: null, sinX: null, cosX: null, sinY: null, cosY: null, sinZ: null, cosZ: null },
    FOV: 90,
    radFOV: null,
    near: 0.05,
};

//zの大きさを入れる
let zBuffer = null;

//チャンク生成
for (let i = 0; i < 1; i++) {
    for (let j = 0; j < 1; j++) {
        chunks.push(new chunk(i, j));
    }
}

//キャンバスの大きさ変更
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    glCanvas.width = window.innerWidth;
    glCanvas.height = window.innerHeight;

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

    camera.radFOV = degToRad(camera.FOV);

    //移動
    playerMove();

    //描画

    if (!zBuffer || (zBuffer.length !== canvas.width * canvas.height)) {
        zBuffer = new Float32Array(canvas.width * canvas.height);
    }
    zBuffer.fill(0);

    chunkDraw();

    calculateFPS(now);

    requestAnimationFrame(mainLoop);
}

function startGame() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    for (const c of chunks) {
        c.generateTriangles();
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
        }
    };
    resize();
    mainLoop();
}

startGame();
