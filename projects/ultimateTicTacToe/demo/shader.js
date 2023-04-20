var gameDisplay;
var gameRunner=new Game();
var gameControl=new Control();
gameControl.connect(document.body);

window.addEventListener("load", () => {
	// set up our WebGL context and append the canvas to our wrapper
	const curtains = new Curtains({
		container: "foreground",
		autoRender: false,
		preserveDrawingBuffer: true,
		pixelRatio: 0.25
	});

	const planeElement = document.getElementById("plane");
	const inputElement = document.getElementById("foreground-input");
	const backgroundElement = document.getElementById("background");

 	const paramsSimple = {
		vertexShader: vertexShader2,
		fragmentShader: fragmentShaderShadow,
		sampler: "uTest",
		uniforms: {
			onePixel: {
				name: "onePixel",
				type: "2f",
				value: new Vec2(0,0)
			}
		},
	};
	const plane = new Plane(curtains, planeElement, paramsSimple);
	plane.loadCanvas(inputElement, {sampler: "uInputTexture"});

	plane.onAfterResize(resize);

	gameDisplay=new Display(inputElement,backgroundElement);

	function resize(){
		// get our plane dimensions
		var planeBoundingRect = plane.getBoundingRect();

		let pixWidth = planeBoundingRect.width;
		let pixHeight = planeBoundingRect.height;
		gameDisplay.resize(pixWidth,pixHeight);

		plane.uniforms.onePixel.value=new Vec2(1/(planeBoundingRect.width), 1/planeBoundingRect.height);
	}
	resize();

	function step(timestamp) {
		gameRunner.display(gameControl,gameDisplay);
		curtains.render();
		window.requestAnimationFrame(step);
	}
	window.requestAnimationFrame(step);
	
});

function run(){
	//logTime("run");
	gameRunner.run(gameControl,gameDisplay);
}
setInterval(run,1000/60);


var totalTime=0;
var countTime=0;
var lastTime=-1;
function logTime(text){
	countTime++;
	var d = new Date();
	var n = d.getTime();
	if(lastTime==-1){
		console.log("start - "+text);
	}else{
		totalTime+=n-lastTime;
		console.log(n-lastTime+"ms - "+text);
	}
	lastTime=n;
}