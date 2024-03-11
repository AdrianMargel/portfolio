// Create global page styles
createStyles(scss`&{
	background-color: ${theme.color.black};
	canvas{
		position:absolute;
		width:100vw;
		height:100vh;
	}
	.canvas{
		opacity:1;
		image-rendering: pixelated;
	}
	.gl{
		pointer-events:none;
		opacity:1;
		image-rendering: pixelated;
	}
	.controls{
		z-index:1;
		position: absolute;
		width:500px;
		background-color:${theme.color.black};
		padding:0 15px;
		border-bottom-left-radius:20px;
		top:0;
		right:0;
	}
}`());

// Populate page html
let canvasElm=newElm("canvas");
let glCanvasElm=newElm("canvas");
let gl=glCanvasElm.getContext("webgl2",{
	premultipliedAlpha: true
});
const glExt=gl.getExtension("EXT_color_buffer_float");
let body=html`
	${addClass("canvas",canvasElm)}
	${addClass("gl",glCanvasElm)}
`();
addElm(body,document.body);
body.disolve();

let display=new CanvasDisplay(canvasElm);
let control=new Control();
control.connect(canvasElm);

let channels=2;
let leniaShader=new LeniaShader();
let gradientShader=new GradientShader();
let flowShader=new FlowShader();
let renderShader=new RenderShader();
let sharedTextures=new TextureManager();
sharedTextures.init(canvasElm,channels);

let t=0;

let runSpeed=1000/60;
let displaying=true;
let last;
let totalElapsed=0;
let dispT=new Date().getTime();
async function animation(timestamp) {
	if(last===undefined){
		last=timestamp;
	}
	let elapsed=timestamp-last;
	last=timestamp;
	let animAmount=Math.min(elapsed/runSpeed,3);
	totalElapsed+=animAmount;

	display.clear();
	if(control.mouseDown){
		if(control.mouseLDown){
			// display.setStroke(rgb(1,0,1));
			display.setFill(rgb(1));
			display.circ(control.getMouse(display.view),100);
		}
		if(control.mouseRDown){
			display.setFill(rgb(0));
			display.circ(control.getMouse(display.view),95);
		}
	}

	if(sharedTextures.isLoaded()){
		sharedTextures.run(canvasElm,channels);
		let rand=0;
		let textures=sharedTextures.textures;
		for(let i=0;i<channels;i++){
			for(let j=0;j<channels;j++){
				leniaShader.run(t,`${i}`,`${j}`,rand,i==0&&j==0,j==0,channels);
			}
		}
		for(let i=0;i<channels;i++){
			gradientShader.run(`${i}`);
			flowShader.run(`${i}`);
		}
		renderShader.run(channels);
	}
	t+=1;
	if(displaying){
		// console.log("disp",new Date().getTime()-dispT);
		dispT=new Date().getTime();
		window.requestAnimationFrame(animation);
	}
}
window.requestAnimationFrame(animation);


