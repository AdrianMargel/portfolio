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
display.view=new Cam([-400,-400],1);
let control=new Control();
control.connect(canvasElm);

let frameAnim=animate(()=>{
	// canvasTex.update(canvasElm);
	display.clear();
	display.setWeight(1);
	// for(let x=0;x<10;x++){
	// 	for(let y=0;y<10;y++){
	// 		display.setStroke(rgb(1));
	// 		display.circ([x,y],.1);
	// 	}
	// }
	draw(display,control);
},1,true).start();

display.clear();

//offset
//rotation/scale
//texure id
