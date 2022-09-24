let oplayers = [];
let allowTrade = true;

let loadServer = ( server ) => {
    document.querySelector('.mainMenu').style.display = 'none';
    document.querySelector('.serverLobby').style.display = 'block';

    tabs.forEach(t => t.style.display = 'none');

    document.querySelector('#serverCode').innerHTML = server.code;
    if(server.mode === 'Solo'){
        document.querySelector('#modeDesc').innerHTML = 'Solo: Everyone is trying to escape the maze on their own, but you can trade places with a random person every 5 seconds.';
    } else if(server.mode === 'Pair'){
        document.querySelector('#modeDesc').innerHTML = 
            'Pair: Get you and your partner out of the maze as quickly as possible before anyone else, you can trade places with them every 5 seconds. REQUIRES AN EVEN NUMBER OF PLAYERS TO PLAY!';
    }
    
    document.querySelector('#playersList').innerHTML = 'Loading...';
    map = server.map;
}

let loadPlayerList = ( plrs ) => {
    oplayers = plrs;
    let playerListText = '';
    playerListText += '<button style="display: inline-block;">You</button>';

    oplayers.forEach(p => {
        playerListText += '<button style="display: inline-block;">'+p.name+'</button>';
    })

    document.querySelector('#playersList').innerHTML = playerListText;
}

let playerJoin = ( pl ) => {
    oplayers.push(pl);
    let playerListText = '';
    playerListText += '<button style="display: inline-block;">You</button>';

    oplayers.forEach(p => {
        playerListText += '<button style="display: inline-block;">'+p.name+'</button>';
    })

    document.querySelector('#playersList').innerHTML = playerListText;
}

let playerLeave = ( id ) => {
    oplayers = oplayers.filter(x => x.id !== id);
    let playerListText = '';
    playerListText += '<button style="display: inline-block;">You</button>';

    oplayers.forEach(p => {
        playerListText += '<button style="display: inline-block;">'+p.name+'</button>';
    })

    document.querySelector('#playersList').innerHTML = playerListText;
}

let playerPositionUpdate = ( players ) => {
    players.forEach(player => {
        let playerCache = oplayers.find(x => x.id === player.id);

        if(playerCache){
            playerCache.pos = { x: lerp(playerCache.pos.x, player.pos.x, 0.5), y: lerp(playerCache.pos.y, player.pos.y, 0.5) };
        }
    })
}

let leaveGame = () =>
    ws.send(JSON.stringify({ type: 'leaveServer' }));

let gameStart = () =>
    ws.send(JSON.stringify({ type: 'startGame' }));

let trade = () => {
    if(allowTrade){
        ws.send(JSON.stringify({ type: 'trade' }));
        allowTrade = false;

        document.querySelector('.tradeButton').innerHTML = '5s';

        setTimeout(() => {
            document.querySelector('.tradeButton').innerHTML = '4s';
        }, 1000);

        setTimeout(() => {
            document.querySelector('.tradeButton').innerHTML = '3s';
        }, 2000);

        setTimeout(() => {
            document.querySelector('.tradeButton').innerHTML = '2s';
        }, 3000);

        setTimeout(() => {
            document.querySelector('.tradeButton').innerHTML = '1s';
        }, 4000);

        setTimeout(() => {
            document.querySelector('.tradeButton').innerHTML = '';
            allowTrade = true;
        }, 5000);
    }
}