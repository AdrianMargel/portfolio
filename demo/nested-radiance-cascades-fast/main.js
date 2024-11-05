// Create global page styles
createStyles(scss`&{
	background-color: ${theme.color.greyStep(-1)};
	overflow:hidden;
	body>div{
		width:100vw;
		height:100vh;
		${theme.center}
	}
	canvas{
		position:absolute;
		// width:100vw;
		// height:100vh;
		width:${512*1.5}px;
		height:${512*1.5}px;
	}
	.gl{
		pointer-events:none;
		opacity:1;
		image-rendering: pixelated;
	}
	.canvas{
		opacity:.1;
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
	<div>
		${addClass("gl",glCanvasElm)}
		${addClass("canvas",canvasElm)}
	</div>
`();
addElm(body,document.body);
body.disolve();

let display=new CanvasDisplay(canvasElm);
let control=new Control();
control.connect(canvasElm);

let shaderManager=new ShaderManager();
let radianceManager=new RadianceManager();
let canvasTex=new Texture({
	src: canvasElm,
	minMag: gl.NEAREST,
	wrap: gl.REPEAT
});

// radianceManager.run(shaderManager,canvasTex);

let timestamp=Date.now();
let avg=[];

let hue=0.;
let frameAnim=animate(()=>{
	avg.push(Date.now()-timestamp);
	console.log(avg.reduce((a,b)=>a+b)/avg.length);
	timestamp=Date.now();

	// display.clear();

	if(control.mouseDown()){
		display.noStroke();
		if(control.mouseDown("l")){
			display.setFill(hsv(hue+=0.02,1,1,1));
			// display.setFill(rgb(1,1,1,1));
			display.circ(display.view.transformInv(control.mousePos()),10);
		}
		if(control.mouseDown("r")){
			display.setFill(rgb(0,0,0,1.));
			// display.setFill(rgb(0,0,0,1));
			display.circ(display.view.transformInv(control.mousePos()),15);
		}
		// control.mouseDown=false;
	}
	
	// display.setFill(rgb(1,1,1,1));
	// display.circ(100,100,2.);

	// display.setFill(rgb(0,0,0,1));
	// display.circ(200,200,15.);
	// display.circ(400,600,15.);

	canvasTex.update(canvasElm);
	radianceManager.run(shaderManager,canvasTex);
},1,true).start();
