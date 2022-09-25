let click = new Audio('/assets/audio/click.wav');

let playClick = () => {
    click.currentTime = 0;
    click.play();
}