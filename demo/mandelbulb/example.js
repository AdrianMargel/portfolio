// Create global page styles
createStyles(scss`&{
	background-color: ${theme.color.greyStep(-1)};
	canvas{
		position:absolute;
		width:100vw;
		height:100vh;
	}
	.canvas{
		opacity:1;
		image-rendering: pixelated;
	}
}`());

document.body.onclick = function() {
	document.body.requestPointerLock();
}

// Create data
let title=bind("Elements");

let glCanvasElm=newElm("canvas");
let gl=glCanvasElm.getContext("webgl2",{
	premultipliedAlpha: true
});
let gameControl=new Control();
gameControl.connect(document.body);

let antTexture=new Texture({
	width:650,
	height:650,
	minMag: gl.NEAREST,
	wrap: gl.REPEAT,
	// internalFormat: gl.RGBA32F,
});
let ppTexture=new TexturePingPong({
	width:650,
	height:650,
	minMag: gl.NEAREST,
	wrap: gl.REPEAT,
	// internalFormat: gl.RGBA32F,
});

let shaderManager=new ShaderManager();
let renderShader=new RenderShader(ppTexture);

let viewAngles=Vec(-PI/2,0);
let viewPos=Vec(-2,0,0);
let speed=-20;
let frameAnim=animate(()=>{
	viewAngles.add(gameControl.mouseMovement.cln().scl(.005).scl([-1.,1.]));
	viewAngles.y=clamp(viewAngles.y,-PI/2,PI/2);

	let moveVec=Vec(0,0,0);
	if(gameControl.isKeyDown("W")){
		moveVec.add([0,0,1]);
	}
	if(gameControl.isKeyDown("S")){
		moveVec.add([0,0,-1]);
	}
	if(gameControl.isKeyDown("A")){
		moveVec.add([-1,0,0]);
	}
	if(gameControl.isKeyDown("D")){
		moveVec.add([1,0,0]);
	}
	if(gameControl.isKeyDown(" ")){
		moveVec.add([0,1,0]);
	}
	if(gameControl.isKeyCodeDown(16)){
		moveVec.add([0,-1,0]);
	}
	speed-=gameControl.mouseWheel;
	moveVec.scl(pow(1.2,speed));
	moveVec.yz=moveVec.YZ.rot(viewAngles.y);
	moveVec.xz=moveVec.XZ.rot(viewAngles.x);
	viewPos.add(moveVec);

	shaderManager.resizeToDisplay(ppTexture,antTexture);
	renderShader.run(viewPos,viewAngles);

	gameControl.prime();
},1,true).start();

// Populate page html
let body=html`
	${addClass("canvas",glCanvasElm)}
`();
addElm(body,document.body);
body.disolve();

