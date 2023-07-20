// Create Socket and init variables
let ws = new WebSocket('wss://ws.phazed.xyz');
let lastMessageRecived = null;
let hasItError = false;
let partner = {};

// Once socket is connected 
ws.onopen = () => {
    console.log('We have connected boys');

    document.querySelector('.serversList').innerHTML = 'Loading...';
    ws.send(JSON.stringify({ type: 'listServers' }));

    // Check LocalStorage For PlayerName
    let na = localStorage.getItem('playerName');
    if(na){
        setName(na);
        document.querySelector('#nameInput').value = na;
    }
}

// When the server sends us data
ws.onmessage = ( data ) => {
    // Parse it as JSON
    let msg = JSON.parse(data.data);
    lastMessageRecived = msg.type;

    // If its an error display it to the user
    if(msg.type === 'error')
        showError(msg.msg);

    // If its a server list update, update the list of servers
    if(msg.type === 'serverList'){
        let text = '';

        msg.servers.forEach(s => {
            text += '<div class="serverForList" onclick="joinServer(\''+s.code+'\')"><span style="font-size: 17px;">'+s.code+'</span><br /><span style="font-size: 12px;">'+s.players+' / '+s.maxPlayers+' Players || '+s.mode+'</span></div>';
        })

        document.querySelector('.serversList').innerHTML = text;

        if(msg.servers.length === 0)
            document.querySelector('.serversList').innerHTML = 'Oh Dear, No one seems to be playing right now';
    }

    // onmessage
    if(msg.type === 'msg'){
        let div = document.createElement('div');
        div.classList.add('thefuckyoumessage');
        div.innerHTML = msg.content + ' <span style="color: skyblue;">'+msg.author+'</span>';

        document.querySelector('.thefuckyouchat').appendChild(div);

        setTimeout(() => {
            div.style.opacity = '0';

            setTimeout(() => {
                div.remove();
            }, 250);
        }, 10000);
    }

    // onnotice
    if(msg.type === 'notice'){
        let div = document.createElement('div');
        div.classList.add('thefuckyoumessage');
        div.innerHTML = '<span style="color: #47e50d;">'+msg.content+'</span>';

        document.querySelector('.thefuckyouchat').appendChild(div);

        setTimeout(() => {
            div.style.opacity = '0';

            setTimeout(() => {
                div.remove();
            }, 250);
        }, 10000);
    }

    // if its focing you to open the main menu, open the main menu
    if(msg.type === 'mainMenuLoad'){
        document.querySelector('.mainMenu').style.display = 'block';
        document.querySelector('.serverLobby').style.display = 'none';
        document.querySelector('.tradeButton').style.display = 'none';

        renderOtherPlayers = false;
        renderSelf = false;
        allowMovement = false;

        sendPos = false;
        camDistance = 5;

        playerX = map.width / 2;
        playerY = map.height / 2;
    }

    // if its telling you to spectate setup camera for spectating
    if(msg.type === 'spectate'){
        if(msg.yes){
            renderOtherPlayers = true;
            renderSelf = false;
            allowMovement = true;

            sendPos = false;
            camDistance = 4;

            document.querySelector('.mainMenu').style.display = 'none';
            document.querySelector('.serverLobby').style.display = 'none';
        } else{
            renderOtherPlayers = false;
            renderSelf = false;
            allowMovement = false;

            sendPos = false;
            camDistance = 5;

            document.querySelector('.mainMenu').style.display = 'none';
            document.querySelector('.serverLobby').style.display = 'block';
        }
    }

    // if its telling you to move, move to that location
    if(msg.type === 'forceMove'){
        playerX = msg.pos.x;
        playerY = msg.pos.y;
    }

    // id its telling you the game has started, setup info for the game
    if(msg.type === 'start'){
        document.querySelector('.tradeButton').style.display = 'block';

        renderOtherPlayers = true;
        renderSelf = true;
        sendPos = true;
        camDistance = 5;

        allowMovement = true;
        map = msg.map;

        document.querySelector('.mainMenu').style.display = 'none';
        document.querySelector('.serverLobby').style.display = 'none';

        if(cServer.owner){
            document.querySelector('#startGameBtn').style.display = 'none';
            document.querySelector('#endGameBtn').style.display = 'inline-block';
        }
    }

    // if its saying you have won, display the finished message to the user
    if(msg.type === 'win'){
        document.querySelector('.tradeButton').style.display = 'none';
        document.querySelector('.youwin').style.display = 'block';
        setTimeout(() => { document.querySelector('.youwin').style.opacity = '1'; });
        document.querySelector('.youwin').innerHTML = 'Finished!<br /><span style="margin-top: 0px; font-family: \'Courier New\', Courier, monospace; font-size: 20px;">Finished In '+msg.place+place(msg.place)+' Place</span>'

        playerX = map.width / 2;
        playerY = map.height / 2;
        camDistance = 4;
        
        renderSelf = false;
        sendPos = false;
        allowMovement = true;
    }

    // if its telling you to open the server lobby, open the server lobby
    if(msg.type === 'openLobby'){
        document.querySelector('.tradeButton').style.display = 'none';

        renderSelf = false;
        sendPos = false;
        allowMovement = false;

        document.querySelector('.mainMenu').style.display = 'none';
        document.querySelector('.serverLobby').style.display = 'block';

        document.querySelector('.youwin').style.opacity = '0';

        playerX = map.width / 2;
        playerY = map.height / 2;
        camDistance = 2;

        renderSelf = false;
        renderOtherPlayers = false;

        if(cServer.owner){
            document.querySelector('#startGameBtn').style.display = 'inline-block';
            document.querySelector('#endGameBtn').style.display = 'none';
        }

        setTimeout(() => {
            document.querySelector('.youwin').style.display = 'none';
        }, 500);
    }

    // server telling us who our partner is
    if(msg.type === 'setupPartner'){
        document.querySelector('.partnerScreen').style.display = 'block';
        document.querySelector('.partnerScreen').innerHTML = msg.player.name+'<br /><span style="margin-top: 0px; font-family: \'Courier New\', Courier, monospace; font-size: 20px;">Is your partner</span>'

        partner = msg.player;
        console.log(msg.player);

        setTimeout(() => {
            document.querySelector('.partnerScreen').style.opacity = '1';
        }, 10)

        setTimeout(() => {
            document.querySelector('.partnerScreen').style.opacity = '0';

            setTimeout(() => {
                document.querySelector('.partnerScreen').style.display = 'none';
            }, 500);
        }, 10000);
    }

    // initial player list for servers
    if(msg.type === 'serverPlayers')
        loadPlayerList(msg.players);

    // we are allowed into that server
    if(msg.type === 'loadServer')
        loadServer(msg.server);

    // a player has joined the server
    if(msg.type === 'serverPlayerJoin')
        playerJoin(msg.players);

    // a player has left the server
    if(msg.type === 'serverPlayerLeave')
        playerLeave(msg.id);

    // updates to position
    if(msg.type === 'positionUpdates')
        playerPositionUpdate(msg.players);
}

// the socket died
ws.onerror = ( e ) => {
    showError('Cannot Connect To Server...', false);
    hasItError = true;
}

// the socket closed
ws.onclose = () => {
    if(!hasItError)
        showError('Server Connection Closed...', false);
}

// reload servers function
let reloadServers = () => {
    document.querySelector('.serversList').innerHTML = 'Loading...';
    ws.send(JSON.stringify({ type: 'listServers' }));
}