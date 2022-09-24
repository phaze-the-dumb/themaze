let lerp = (x, y, a) => x * (1 - a) + y * a,
    fps = 0,
    fpsCount = 0,
    devScreen = true,
    motionBlurHell = false,
    renderOtherPlayers = false,
    renderSelf = false;

let stickman = new Image();
stickman.src = '/assets/imgs/jerry.png';

let hedge1 = new Image();
hedge1.src = '/assets/imgs/hedge.png';

let grass1 = new Image();
grass1.src = '/assets/imgs/grass.png';

let hedgeMoveX = 0,
    hedgeMoveY = 0;

setInterval(() => {
    fps = fpsCount;
    fpsCount = 0;

    hedgeMoveX = Math.random() * 2 - 1;
    hedgeMoveY = Math.random() * 2 - 1;
}, 1000)

let renderedBlocks = 0;
let render = () => {
    requestAnimationFrame(render);
    fpsCount++;

    if(window.devicePixelRatio === 1){
        document.querySelector('.noZoomText').style.display = 'none';
    } else{
        document.querySelector('.noZoomText').style.display = 'block';
    }

    if(motionBlurHell){
        motionBlurCtx.clearRect(canvas.width / -2, canvas.height / -2, canvas.width, canvas.height);
        motionBlurCtx.drawImage(canvas, canvas.width / -2, canvas.height / -2);
    }

    ctx.globalAlpha = 1;
    ctx.clearRect(canvas.width / -2, canvas.height / -2, canvas.width, canvas.height);
    wallCtx.clearRect(canvas.width / -2, canvas.height / -2, canvas.width, canvas.height);
    
    move();
    renderedBlocks = 0;

    // Floor
    for (let x = 0; x < map.width / 20; x++) {
        for (let y = 0; y < map.height / 20; y++) {
            if(
                ((map.width / 50) * x - camX + (map.width / 50)) * camScale > canvas.width / -2 &&
                ((map.height / 50) * y - camY + (map.height / 50)) * camScale > canvas.height / -2 &&
                ((map.width / 50) * x - camX - (map.width / 50)) * camScale + (map.width / 50) * camScale < canvas.width / 2 &&
                ((map.height / 50) * y - camY - (map.height / 50)) * camScale + (map.height / 50) * camScale < canvas.height / 2
            ){
                ctx.drawImage(grass1,
                    ((map.width / 50) * x - camX) * camScale,
                    ((map.height / 50) * y - camY) * camScale,
                    ((map.width / 50) * camScale) + 1,
                    ((map.height / 50) * camScale) + 1
                );
                renderedBlocks++;
            }
        }
    }

    // Exit
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000';
    ctx.fillRect(((20 * map.exit.x) - camX) * camScale, ((20 * map.exit.y) - camY) * camScale, 20 * camScale, 20 * camScale);

    // Player
    if(renderSelf)
        ctx.drawImage(stickman, (playerX - 2.5 - camX) * camScale, (playerY - 5 - camY) * camScale, 5 * camScale, 10 * camScale);

    if(renderOtherPlayers){
        oplayers.forEach(p => {
            ctx.textAlign = 'center';
            ctx.fillText(p.name, (p.pos.x - camX) * camScale, ((p.pos.y - 10 - camY) * camScale));

            ctx.drawImage(stickman, (p.pos.x - 2.5 - camX) * camScale, (p.pos.y - 5 - camY) * camScale, 5 * camScale, 10 * camScale);
        })
    }

    // Walls
    wallCtx.fillStyle = '#ad7e0f';
    map.walls.forEach(w => {
        if(
            (((20 * w.x) - camX + 20) * camScale) > canvas.width / -2 &&
            (((20 * w.y) - camY + 20) * camScale) > canvas.height / -2 &&
            ((((20 * w.x) - camX - 20) * camScale) + (20 * camScale)) < canvas.width / 2 &&
            ((((20 * w.y) - camY - 20) * camScale) + (20 * camScale)) < canvas.height / 2
        ){
            wallCtx.drawImage(hedge1, ((20 * w.x) - camX - 2 + w.xo) * camScale, ((20 * w.y) - camY - 2 + w.yo) * camScale, 22 * camScale, 22 * camScale);
            renderedBlocks++;

            w.xo = lerp(w.xo, hedgeMoveX, 0.01);
            w.yo = lerp(w.yo, hedgeMoveY, 0.01);
        }
    })

    ctx.shadowBlur = 10;
    ctx.shadowColor = '#000';

    ctx.drawImage(wallCanvas, canvas.width / -2, canvas.height / -2);

    // Player / Mouse Link
    ctx.strokeStyle = '#f001';
    ctx.shadowBlur = 0;
    ctx.lineWidth = 5;

    if(isMouseDown && allowMovement){
        ctx.beginPath();
        ctx.moveTo((playerX - camX) * camScale, (playerY - camY) * camScale);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
        ctx.closePath();
    }

    if(devScreen){
        ctx.font = '15px "Courier New"';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        let lines = [
            'FPS: ' + fps,
            'Player X/Y: ' + playerX + ', ' + playerY,
            'Cam X/Y: ' + camX + ', ' + camY,
            'Speed: ' + speed,
            'Maze Size X/Y: ' + map.width + ', ' + map.height,
            'Blocks In Render: ' + renderedBlocks,
            'Last Message Recived: ' + lastMessageRecived,
            'Partner: '+partner.name
        ]

        lines.forEach((l, i) => {
            ctx.fillText(l, -(canvas.width / 2) + 10, -(canvas.height / 2) + 20 + (i * 20));
        })
    }

    // Motion Blur
    if(motionBlurHell){
        ctx.globalAlpha = 0.25;
        ctx.drawImage(motionBlurCanvas, canvas.width / -2, canvas.height / -2);
    }
}

render();