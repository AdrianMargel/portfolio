//track basic page analytics
trackPage(window.location.pathname);

// Create global page styles
createStyles(scss`&{
	background-color: ${theme.color.greyStep(-1)};
	${theme.font.text}
	color: white;
	overflow:hidden;

	background-image: url('./img/back-pattern-1b.png');
	background-repeat: repeat;
	background-position: center;

	::selection {
		background: #97F28060;
	}
	input:focus{
		outline: none;
	}
	a{
		color: #7AC16C;
		text-decoration: none;
	}
	a:hover{
		color: #7AC16C;
		text-decoration: underline;
	}
	a:active{
		color: #7AC16C;
	}
	a:visited{
		color: #7AC16C;
	}

	canvas{
		position:absolute;
		margin-top:40px;
		width:calc(min(100vw,100vh) - 80px);
		height:calc(min(100vw,100vh) - 80px);
	}
	canvas.gl{
		pointer-events:none;
		opacity:1;
		// z-index:1;
		// image-rendering: pixelated;
	}
	canvas.canvas{
		opacity:0;
	}
	canvas.scene{
		opacity:0;
	}
	canvas.barrier{
		opacity:0;
	}
	.canvasBorder{
		pointer-events:none;
		position:absolute;
		margin-top:${40-4}px;
		width:calc(min(100vw,100vh) - 80px);
		height:calc(min(100vw,100vh) - 80px);
		border:4px solid ${theme.color.greyStep(-.5)};
		${theme.boxShadowStep(1)}
		>div{
			position:absolute;
			inset:-11px;
			border:3px solid ${theme.color.greyStep(-.5)};
		}
	}

	main{
		${theme.centerX}
		height:100vh;
		>.display{
			flex-grow:1;
			min-width:min(100vw,100vh);
			${theme.centerX}
		}
		>.control{
			flex-grow:0;
			flex-shrink:1;
			flex-basis:400px;
			min-width:0;
			align-self:stretch;
			position:relative;
			>${ControlPanel}{
				position:absolute;
				right:0;
				&.closed{
					right:-400px;
				}
			}
			>button{
				z-index:11;
				position: absolute;
				width: 100px;
				height: 50px;
				${theme.font.interact}
				color:${theme.color.highlight};
				background-color:${theme.color.greyStep(0)};
				border:4px solid ${theme.color.highlight};
				border-right: none;
				border-top-left-radius:50px;
				border-bottom-left-radius:50px;
				top: 20px;
				right:min(calc(100vw - 100px), 400px);
				&.closed{
					right:0;
				}
			}
		}
	}
}`());

let canvasElm=newElm("canvas");
let sceneCanvasElm=newElm("canvas");
let barrierCanvasElm=newElm("canvas");
let glCanvasElm=newElm("canvas");
let gl=glCanvasElm.getContext("webgl2",{
	premultipliedAlpha: true
});
gl.getExtension("EXT_color_buffer_float");
gl.getExtension("EXT_float_blend");

let cascadeNumMax=7;

let running=bind(true);
let frameTimeList=[];
let fps=bind(0);
let brush=bind({
	size:2,
	opacity:1,
	type:"rainbow",
	r:1,
	g:1,
	b:1,
});
let controlOpen=bind(true);

// Populate page html
let body=html`
	<main>
		<div class="display">
			${addClass("gl",glCanvasElm)}
			${addClass("scene",sceneCanvasElm)}
			${addClass("barrier",barrierCanvasElm)}
			${addClass("canvas",canvasElm)}
			<div class="canvasBorder"><div></div></div>
		</div>
		<div class="control">
			<button
				class=${attr(()=>(controlOpen.data?"open":"closed"))(controlOpen)}
				onclick=${attr(act(()=>controlOpen.data=!controlOpen.data))}
			>
				${html`${()=>controlOpen.data?"Close":"Open"}`(controlOpen)}
			</button>
			${new ControlPanel(cascadeNumMax,running,fps,brush,controlOpen)}
		</div>
	</main>
`();
addElm(body,document.body);
body.disolve();

let canvasDisplay=new CanvasDisplay(canvasElm);
let sceneDisplay=new CanvasDisplay(sceneCanvasElm);
let barrierDisplay=new CanvasDisplay(barrierCanvasElm);
let control=new Control();
control.connect(canvasElm);

let shaderManager=new ShaderManager();
let cascadeManager=new CascadeManager(cascadeNumMax);
let gameRunner=new Game();

let canvasTex=new Texture({
	src: canvasElm,
	minMag: gl.NEAREST,
	wrap: gl.REPEAT
});
let sceneTex=new Texture({
	src: sceneCanvasElm,
	minMag: gl.NEAREST,
	wrap: gl.REPEAT
});
let barrierTex=new Texture({
	src: barrierCanvasElm,
	minMag: gl.NEAREST,
	wrap: gl.REPEAT
});

let frameAnim=animate((t,e)=>{
	if(running.data){
		frameTimeList.push(e);
		let frameTimeTotal=frameTimeList.reduce((a,b)=>a+b);
		if(frameTimeTotal>1){
			fps.data=frameTimeList.length/frameTimeTotal;
			frameTimeList=[];
		}

		gameRunner.drawOrbs(sceneDisplay,t);
		gameRunner.drawInteractive(canvasDisplay,barrierDisplay,control,t,unbind(brush));
		canvasTex.update(canvasElm);
		sceneTex.update(sceneCanvasElm);
		barrierTex.update(barrierCanvasElm);
		cascadeManager.run(shaderManager,canvasTex,sceneTex,barrierTex);
	}
},1,true).start();
