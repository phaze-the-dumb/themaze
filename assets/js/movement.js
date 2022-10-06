// Setup Variables
let playerX = map.width / 2,
    playerY = map.height / 2,
    staticCamX = 0,
    staticCamY = 0,
    camX = 0,
    camY = 0,
    camScale = 1,
    mouseX = 0,
    mouseY = 0,
    speed = 0.1,
    isKeyDown = {},
    lastTime = Date.now(),
    prevX = 0,
    prevY = 0,
    isMouseDown = false,
    allowMovement = false,
    camDistance = 5,
    sendPos = false,
    lastMessage = 0;

// Detect Mouse Movements
window.onmousemove = ( e ) => {
    mouseX = e.clientX - canvas.width / 2;
    mouseY = e.clientY - canvas.height / 2;
}

// Detect Touch Movements
document.addEventListener('touchmove', ( e ) => {
    mouseX = e.touches[0].clientX - canvas.width / 2;
    mouseY = e.touches[0].clientY - canvas.height / 2;
})

// Interval for updating position to server
setInterval(() => {
    if(sendPos)
        ws.send(JSON.stringify({ type: 'posUpdate', pos: { x: playerX, y: playerY } }));
}, 100);

let move = () => {
    // Get Deltatime
    let dt = Date.now() - lastTime;

    // Store the last player position
    let prevX = playerX;
    let prevY = playerY;

    // If t key is down trade places
    if(isKeyDown['t'] && allowMovement && !isChatOpen){
        trade();
    }

    // Move Forwards
    if(isKeyDown['w'] && allowMovement && !isChatOpen){
        playerY -= speed * dt;
    }

    // Move Backwards
    if(isKeyDown['s'] && allowMovement && !isChatOpen){
        playerY += speed * dt;
    }

    // Move Left
    if(isKeyDown['a'] && allowMovement && !isChatOpen){
        playerX -= speed * dt;
    }
    
    // Move Right
    if(isKeyDown['d'] && allowMovement && !isChatOpen){
        playerX += speed * dt;
    }

    // Mouse Movement
    if(isMouseDown && allowMovement && !(isKeyDown['w'] || isKeyDown['s'] || isKeyDown['a'] || isKeyDown['d'])){
        playerY += (mouseY / (canvas.height / 2)) * speed * dt;
        playerX += (mouseX / (canvas.width / 2)) * speed * dt;
    }

    // Updating Camera Position
    camX = lerp(camX, playerX + mouseX / 10, 0.05);
    camY = lerp(camY, playerY + mouseY / 10, 0.05);
    camScale = lerp(camScale, camDistance - (Math.sqrt(Math.pow(mouseX, 2) + Math.pow(mouseY, 2)) / 10000), 0.1);

    // Stop players from going outside of the map
    if(playerX < 0)playerX = 0;
    if(playerY < 0)playerY = 0;
    if(playerX > map.width)playerX = map.width;
    if(playerY > map.height)playerY = map.height;

    // Only register collisions and wins when rendering self
    if(renderSelf){
        // If player is inside a wall reset to previous position
        let currentTile = map.walls.find(x => x.x === Math.floor(playerX / 20) && x.y === Math.floor(playerY / 20));
        if(currentTile){
            playerX = prevX;
            playerY = prevY;
        }

        // If player is touching the exit disable movement and give an encoraging message
        if(Math.floor(playerX / 20) === map.exit.x && Math.floor(playerY / 20) === map.exit.y && allowMovement){
            console.log('You win');
            allowMovement = false;
        }
    }

    // Update the last time
    lastTime = Date.now();
}

// Detect Keys down / up
window.onkeydown = (e) => isKeyDown[e.key] = true;
window.onkeyup = (e) => {
    isKeyDown[e.key] = false;

    // Open / Close Chat
    if(e.key === 'Enter'){
        if(isChatOpen){
            if(document.querySelector('.textChatInput').value.length > 273)return;
            if(Date.now() - lastMessage < 400)return;
            if(document.querySelector('.textChatInput').value.trim() === '')return;

            lastMessage = Date.now();
            isChatOpen = false;

            document.querySelector('.textChatInput').style.display = 'none';

            let newName = [];
            document.querySelector('.textChatInput').value.split(' ').forEach(word => {
                if(badWords.find(x => x === word)){
                    newName.push('****');
                } else{
                    newName.push(word);
                }
            })

            ws.send(JSON.stringify({ type: 'sendMsg', content: newName.join(' ') }));

            document.querySelector('.textChatInput').value = '';
        } else{
            isChatOpen = true;

            document.querySelector('.textChatInput').style.display = 'block';
            document.querySelector('.textChatInput').focus();
        }
    }

    // Close Chat On Escape
    if(e.key === 'Escape' && isChatOpen){
        isChatOpen = false;
        document.querySelector('.textChatInput').style.display = 'none';
        document.querySelector('.textChatInput').value = '';
    } else if(e.key === 'Escape' && !isGameMenuOpen){
        isGameMenuOpen = true;
        document.querySelector('.serverLobby').style.display = 'block';
    } else if(e.key === 'Escape' && isGameMenuOpen){
        isGameMenuOpen = false;
        document.querySelector('.serverLobby').style.display = 'none';
    }
}

// Detect Mouse down / up
window.onmousedown = () => isMouseDown = true;
window.onmouseup = () => isMouseDown = false;

// Detect Touch down / up
document.addEventListener('touchstart', () => isMouseDown = true);
document.addEventListener('touchend', () => isMouseDown = false);