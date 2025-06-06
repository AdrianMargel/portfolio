// Create global page styles

let canvasSize=512*1.5;

createStyles(scss`&{
	body{
		width:100vw;
		height:100vh;
		overflow:hidden;
		display:flex;
		justify-content:center;
		align-items:center;
	}
	canvas{
		position:absolute;
		width:${canvasSize}px;
		height:${canvasSize}px;
	}
	.gl{
		pointer-events:none;
		opacity:1;
		image-rendering: pixelated;
	}
}`());

let canvasElm=newElm("canvas");
let glCanvasElm=newElm("canvas");
let gl=glCanvasElm.getContext("webgl2",{
	premultipliedAlpha: true
});
gl.getExtension("EXT_color_buffer_float");
gl.getExtension("EXT_float_blend");

// Populate page html
let body=html`
	${addClass("gl",glCanvasElm)}
	${addClass("canvas",canvasElm)}
`();
addElm(body,document.body);
body.disolve();

let display=new CanvasDisplay(canvasElm);
display.view=new Cam([-3,-.1],200);
let control=new Control();
control.connect(canvasElm);

let shaderManager=new ShaderManager();
let triangleManager=new TriangleManager();
let canvasTex=new Texture({
	src: canvasElm,
	minMag: gl.NEAREST,
	wrap: gl.REPEAT
});

control.mPos=Vec(canvasSize*.5,canvasSize*.5);

let frameAnim=animate((t)=>{
	shaderManager.resizeToDisplay();
	
	display.view.zoom+=control.mouseWheelDelta()*10;
	display.clear();
	control.resetDelta();


	canvasTex.update(canvasElm);
	//display.transformInv(control.mousePos())
	triangleManager.run(shaderManager,0,control.mousePos().scl(1/canvasSize),canvasTex);
},1,true).start();

//offset
//rotation/scale
//texure id
