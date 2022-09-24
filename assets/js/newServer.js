let isPublic = true;
let modes = [ 'Solo', 'Pair' ];
let tabs = [
    document.querySelector('#joinServerMenu'),
    document.querySelector('#createServerMenu'),
    document.querySelector('#changeNameMenu'),
]
let selectedMode = modes[0];

// hide all tabs
tabs.forEach(t => t.style.display = 'none');

let showTab = ( tab ) => {
    tabs.forEach(t => t.style.display = 'none');
    tab.style.display = 'block';
}
showTab(tabs[2]);

// Basically all ui from here
if(isPublic){
    document.querySelector('#publicCheckBox').classList.add('publicCheckBox');
} else{
    document.querySelector('#publicCheckBox').classList.add('privateCheckBox');
}

document.querySelector('#publicCheckBox').onclick = () => {
    if(!isPublic){
        document.querySelector('#publicCheckBox').classList.add('publicCheckBox');
        document.querySelector('#publicCheckBox').classList.remove('privateCheckBox');
        isPublic = true;
    } else{
        document.querySelector('#publicCheckBox').classList.add('privateCheckBox');
        document.querySelector('#publicCheckBox').classList.remove('publicCheckBox');
        isPublic = false;
    }
}

let selectMode = ( mode ) => {
    console.log(mode);
    selectedMode = mode;
    document.querySelector('#selectedGameMode').innerHTML = 'Currently Selected: '+mode;
}

let createServer = () => {
    ws.send(JSON.stringify({
        type: 'createServer',
        mode: selectedMode,
        public: isPublic ? 'yes' : 'no'
    }))
}

let joinServer = ( code ) => {
    ws.send(JSON.stringify({
        type: 'joinServer',
        code: code
    }))
}