let gameDisplay=new Display();
gameDisplay.connect();
let gameRunner=new Game();
let gameControl=new Control();
gameControl.connect(document.body);

let gl=document.getElementById("c").getContext("webgl2",{
	premultipliedAlpha: true
});
// gl.getExtension('EXT_color_buffer_float');
let textures={};
let background=new BackgroundShader();
let renderer=new RenderShader();
let bulletRenderer=new BulletShader();
let particleRenderer=new ParticleShader();


//Firefox will run at 30fps if you ask it to run at 60fps
//so as a work around we request it run at 100fps so it will give us 60fps
let loopSpeed=(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)?10:1000/60;
let runT=new Date().getTime();
loopSpeed=1000/60;
// setInterval(()=>{
// 	gameRunner.run(gameDisplay,gameControl);
// 	primeAnimation();
// 	// console.log("run",new Date().getTime()-runT);
// 	runT=new Date().getTime();
// }, loopSpeed);


var displaying=true;
var last;
var totalElapsed=0;
function primeAnimation(){
	totalElapsed=0;
}
let dispT=new Date().getTime();
function animation(timestamp) {
	//run the game inside the animation loop to prevent frame skipping from framerate mismatch
	gameRunner.run(gameDisplay,gameControl);//TODO: this needs to be framerate independent

	if(last===undefined){
		last=timestamp;
	}
	let elapsed=timestamp-last;
	let runSpeed=1000/10;
	let animAmount=elapsed/runSpeed;
	last=timestamp;
	totalElapsed+=animAmount;
	if(totalElapsed>1){
		animAmount=0;
	}

	gameRunner.display(gameDisplay,gameControl,renderer,background);
	if(displaying){
		// console.log("disp",new Date().getTime()-dispT);
		dispT=new Date().getTime();
		window.requestAnimationFrame(animation);
	}
}
window.requestAnimationFrame(animation);

function runAndFilter(arr,func){
	for(let i=arr.length-1;i>=0;i--){
		if(!func(arr[i])){
			arr.splice(i,1);
		}
	}
}