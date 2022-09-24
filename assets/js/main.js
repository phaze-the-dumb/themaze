let canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');

let wallCanvas = document.createElement('canvas'),
    wallCtx = wallCanvas.getContext('2d');

let motionBlurCanvas = document.createElement('canvas'),
    motionBlurCtx = motionBlurCanvas.getContext('2d');

let isMenuOpen = true,
    isChatOpen = false;

let map = {
    width: 1000,
    height: 1000,
    walls: [],
    placementThresh: 0.01,
    campRange: 5,
    exit: { x: 0, y: 0 }
}

// Walls
for(let x = 0; x < map.width / 20; x++){
    for(let y = 0; y < map.height / 20; y++){
        if(x === 0 || x === (map.width / 20) - 1 || y === 0 || y === (map.height / 20) - 1){
            map.walls.push({ x, y });
        } else if(x % 2 === 0 && y % 2 === 0){
            if(Math.random() > map.placementThresh){
                map.walls.push({ x, y, xo: 0, yo: 0 });

                let a = Math.random() < 0.5 ? 0 : ( Math.random() < 0.5 ? -1: 1);
                let b = a != 0 ? 0 : ( Math.random() < 0.5 ? -1 : 1 );
                map.walls.push({ x: x + a, y: y + b, xo: 0, yo: 0 });
            }
        }
    }
}

// Middle Camp Bit
for(let x = 0; x < map.campRange; x++){
    for(let y = 0; y < map.campRange; y++){
        let tx = x + (map.width / 40) - (map.campRange / 2);
        let ty = y + (map.height / 40) - (map.campRange / 2);

        map.walls = map.walls.filter(w => w.x !== Math.floor(tx) || w.y !== Math.floor(ty));
    }    
}

// Exit
let moveExit = () => {
    let exitSide = Math.floor(Math.random() * 3);
    if(exitSide === 0){
        map.exit.x = Math.floor(Math.random() * ((map.width / 20) - 2)) + 1;
        map.exit.y = 1;
    } else if(exitSide === 1){
        map.exit.x = 1;
        map.exit.y = Math.floor(Math.random() * ((map.width / 20) - 2)) + 1;
    } else if(exitSide === 2){
        map.exit.x = ((map.width / 20) - 2);
        map.exit.y = Math.floor(Math.random() * ((map.width / 20) - 2)) + 1;
    } else if(exitSide === 3){
        map.exit.x = Math.floor(Math.random() * ((map.width / 20) - 2)) + 1;
        map.exit.y = ((map.width / 20) - 2);
    }

    let wall = map.walls.find(w => w.x === map.exit.x && w.y === map.exit.y);
    if(wall)moveExit();
}
moveExit();

// Setting Up The Canvas
canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.height = window.innerHeight * window.devicePixelRatio;
ctx.translate(canvas.width / 2, canvas.height / 2);

wallCanvas.width = window.innerWidth * window.devicePixelRatio;
wallCanvas.height = window.innerHeight * window.devicePixelRatio;
wallCtx.translate(canvas.width / 2, canvas.height / 2);

motionBlurCanvas.width = window.innerWidth * window.devicePixelRatio;
motionBlurCanvas.height = window.innerHeight * window.devicePixelRatio;
motionBlurCtx.translate(canvas.width / 2, canvas.height / 2);

window.onresize = () => {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    ctx.translate(canvas.width / 2, canvas.height / 2);

    wallCanvas.width = window.innerWidth * window.devicePixelRatio;
    wallCanvas.height = window.innerHeight * window.devicePixelRatio;
    wallCtx.translate(wallCanvas.width / 2, wallCanvas.height / 2);

    motionBlurCanvas.width = window.innerWidth * window.devicePixelRatio;
    motionBlurCanvas.height = window.innerHeight * window.devicePixelRatio;
    motionBlurCtx.translate(motionBlurCanvas.width / 2, motionBlurCanvas.height / 2);
}

document.body.appendChild(canvas);

// Popup Errors
let showError = ( body, allowClose = true ) => {
    if(document.querySelector('.errorMessage'))document.querySelector('.errorMessage').remove();

    let div = document.createElement('div');
    div.classList.add('errorMessage');

    if(allowClose){
        div.innerHTML = '<h1>Error</h1><p>'+body+'</p><div class="errorClose">X</div>';
        document.body.appendChild(div);

        document.querySelector('.errorClose').onclick = () =>
            document.querySelector('.errorMessage').remove();
    } else{
        div.innerHTML = '<h1>Error</h1><p>'+body+'</p>';
        document.body.appendChild(div);
    }
}

// Changing Name On Server
let setName = ( name ) => {
    if(name.length > 25)name = name.slice(0, 25);

    localStorage.setItem('playerName', name);
    ws.send(JSON.stringify({ type: 'fixName', name }));
}

// Utils for 1st, 2nd, 3rd, 4th, etc..
let place = ( num ) => {
    if(num.toString().endsWith('1') && !num.toString().endsWith('11')){
        return 'st'
    } else if(num.toString().endsWith('2') && !num.toString().endsWith('12')){
        return 'nd'
    } else if(num.toString().endsWith('3') && !num.toString().endsWith('13')){
        return 'rd'
    } else{
        return 'th'
    }
}