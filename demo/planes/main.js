
let gl=document.getElementById("c").getContext("webgl2",{
	premultipliedAlpha: true
});
// gl.getExtension('EXT_color_buffer_float');

let sharedTextures=new TextureManager();
let cloudPaint=new CloudPaintShader();
let background=new BackgroundShader();
// let background=new TextureSaveShader();
let renderer=new RenderShader();
let bulletRenderer=new BulletShader();
let particleRenderer=new ParticleShader();

let gameDisplay=new Display();
gameDisplay.connect();
let gameRunner=new Game();
gameRunner.init();
let gameControl=new Control();
gameControl.connect(document.body);

var displaying=true;
var last;
var totalElapsed=0;
let dispT=new Date().getTime();
async function animation(timestamp) {
	if(last===undefined){
		last=timestamp;
	}
	let elapsed=timestamp-last;
	last=timestamp;
	let runSpeed=1000/60;
	let animAmount=Math.min(elapsed/runSpeed,3);
	totalElapsed+=animAmount;

	// console.log(animAmount);
	//run the game inside the animation loop to prevent frame skipping from framerate mismatch
	gameRunner.run(gameDisplay,gameControl,animAmount,runSpeed);
	// gameRunner.randomWaves(animAmount);

	// gameRunner.run(gameDisplay,gameControl,1);

	// gameRunner.run(gameDisplay,gameControl,.25);
	// gameRunner.run(gameDisplay,gameControl,.25);
	// gameRunner.run(gameDisplay,gameControl,.25);
	// gameRunner.run(gameDisplay,gameControl,.25);

	// gameRunner.run(gameDisplay,gameControl,PI/10);
	// gameRunner.run(gameDisplay,gameControl,.34);
	// gameRunner.run(gameDisplay,gameControl,.34);
	
	// await sleep(1000*(3/60));

	gameRunner.display(gameDisplay,gameControl,renderer,background,animAmount);
	if(displaying){
		// console.log("disp",new Date().getTime()-dispT);
		dispT=new Date().getTime();
		window.requestAnimationFrame(animation);
	}
}
window.requestAnimationFrame(animation);

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

let showPlaneSelector=bind(true);
let showGameOver=bind(false);
let waveNum=bind(1);
let playerHealth=bind(1);
let playerMaxHealth=bind(1);
// Populate page html
let uiBody=html`
	${new TopDisplay(showPlaneSelector,waveNum,playerHealth,playerMaxHealth)}
	${new PlaneSelector(showPlaneSelector)}
	${new GameOverMenu(showGameOver,waveNum)}
`().data;
addElm(uiBody,document.body);
uiBody.disolve();
