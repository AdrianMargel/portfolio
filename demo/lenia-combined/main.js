// Create global page styles
createStyles(scss`&{
	background-color: ${theme.color.greyStep(-1)};
	overflow:hidden;
	canvas{
		position:absolute;
		width:100vw;
		height:100vh;
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
let control=new Control();
control.connect(canvasElm);

let shaderManager=new ShaderManager();
let lenia=new Lenia();
let canvasTex=new Texture({
	src: canvasElm,
	minMag: gl.NEAREST,
	wrap: gl.CLAMP_TO_EDGE
});

let frameAnim=animate(()=>{
	display.clear();
	if(control.mouseDown){
		if(control.mouseLDown){
			// display.setStroke(rgb(1,0,1));
			display.setFill(rgb(0,.5,0,.1));
			display.circ(control.getMouse(display.view),100);
		}
		if(control.mouseRDown){
			display.setFill(rgb(1.,0,0,.1));
			display.circ(control.getMouse(display.view),95);
		}
		// control.mouseDown=false;
	}
	canvasTex.update(canvasElm);
	lenia.run(canvasTex);
},1,true).start();
