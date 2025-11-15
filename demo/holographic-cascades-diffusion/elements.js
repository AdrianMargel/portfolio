
/*

	This file is kind of a mess, or at least the styles are.
	The CSS still isn't very elagent and some of the things I tried to midigate that are still very experimental.
	However the elements themselves I'm pretty happy with.

*/

class Input extends CustomElm{
	constructor(text){
		super();
		text=bind(text);
		this.define(html`
			<input
				value=${attr(text)(text)}
				oninput=${attr(act((event)=>{
					text.data=event.target.value;
				}))()}
			/>
		`);
	}
}
defineElm(Input);

class ButtonClickable extends CustomElm{
	constructor(text,event,selected=false){
		super();
		text=bind(text);
		event=bind(event);
		selected=bind(selected);
		this.define(html`
			<button
				class=${attr(()=>selected.data?"selected":"")(selected)}
				onclick=${attr(act(event.data))(event)}
			>
				<div class="surface">
					${html`${text}`(text)}
				</div>
				<div class="selector"><div></div></div>
			</button>
		`);
	}
}
defineElm(ButtonClickable,scss`&{
	>button{
		position: relative;
		padding: 0;
		border: none;
		background-color: #58934C;
		border-radius: 6px;
		${theme.boxShadowStep(-3)}
		.surface{
			font-family: 'Sen', sans-serif;
			font-weight: 700;
			font-size: 20px;
			color: white;
			background-color: #7AC16C;
			border: none;
			padding: 10px 30px;
			border-radius: 6px;
			position: relative;
			bottom: 10px;
			transition: bottom 0.1s;
		}
		.selector{
			opacity: 0;
			position: absolute;
			border: 12px solid transparent;
			border-bottom-color: #28282E;
			width: 0;
			height: 0;
			bottom: -12px;
			right: calc(50% - 12px);
			transition: bottom 0.4s, opacity 0.4s;
			div{
				position: absolute;
				border: 10px solid transparent;
				border-bottom-color: white;
				width: 0;
				height: 0;
				top: -4px;
				right: calc(50% - 10px);
			}
		}
		&.selected .selector{
			opacity: 1;
			bottom: -6px;
		}
		&:active .surface{
			bottom: 4px;
		}
		&:active .selector{
			bottom: -12px;
		}
	}
}`);

class ButtonLink extends CustomElm{
	constructor(text,event){
		super();
		text=bind(text);
		event=bind(event);
		this.define(html`
			<button
				onclick=${attr(act(event.data))(event)}
			>
				${html`${text}`(text)}
			</button>
		`);
	}
}
defineElm(ButtonLink,scss`&{
	>button{
		margin: 0;
		padding: 0;
		display: inline;
		cursor: pointer;
		background-color: transparent;
		color: #7AC16C;
		&:hover{
			text-decoration: underline;
		}
	}
}`);

class EndSymbol extends CustomElm{
	constructor(){
		super();
		this.define(html`
			<div class="icon"></div>
			<div class="line"></div>
			<div class="cover"></div>
		`);
	}
}
defineElm(EndSymbol,scss`&{
	height: 70px;
	${theme.centerX}
	opacity: 0.2;
	position: relative;
	width: 180px;
	.icon{
		position: absolute;
		top: 0px;
		width: 60px;
		height: 60px;
		background-image: url("./img/logoSmall.png");
		background-position: center;
		background-size: cover;
		z-index: 2;
	}
	.line{
		position: absolute;
		top: 30px;
		width: 100%;
		border-top: 1px solid white;
	}
	.cover{
		position: absolute;
		top: 0px;
		width: 60px;
		height: 60px;
		background-color: #28282E;
	}
}`);

class ControlPanel extends CustomElm{
	constructor(cascadeNumMax,running,fps,brush,open){
		super();
		cascadeNumMax=bind(cascadeNumMax);
		fps=bind(fps);
		running=bind(running);
		let orbsToggled=bind(true);

		let size=pow(2,cascadeNumMax.data)+1;

		this.attr("class",()=>open.data?"open":"closed")(open);
		this.define(html`
			<div class="head">
				<h1>Holographic Cascades</h1>
				<div class="back"></div>
			</div>
			<div class="body">
				<h2>Run</h2>
				<button
					class=${attr(()=>(running.data?"":"toggled")+" run")(running)}
					onclick=${attr(act(()=>running.data=!running.data))}
				>${html`${()=>running.data?"PAUSE":"PLAY"}`(running)}</button>
				<div class="fps">
					<p>${html`${()=>round(fps.data*10)/10}`(fps)} FPS</p>
					<p>(avg ${html`${()=>round(1000/fps.data)}`(fps)} ms)</p>
				</div>
				<p>Grid Size: ${size} x ${size}</p>

				<h2>Brush</h2>
				<p class="small instruct">Left click to draw, right click to erase.</p>
				
				<div class="brushPreview">
					<div
						style=${attr(()=>`
							${
								brush.type.data=="color"?
								"background-color:"+rgb(brush.r.data,brush.g.data,brush.b.data)
								:
								`background-image:url("./img/brush-${brush.type.data}.png")`
							};
							border:2px solid ${theme.color.greyStep(1)};
							width:${brush.size.data*5}px;
							height:${brush.size.data*5}px;
							opacity:${brush.opacity.data};
						`)(brush.type,brush.r,brush.g,brush.b,brush.size,brush.opacity)}
					></div>
				</div>
				<div class="controlBar">
					<p>Size:</p>
					${new Slider(brush.size,1,20)}
				</div>
				<div class="controlBar">
					<p>Opacity:</p>
					${new Slider(brush.opacity,0,1)}
				</div>
				<div class="controlType">
					<p>Type:</p>
					<div>
						<button
							class=${attr(()=>brush.type.data=="color"?"toggled":"")(brush.type)}
							onclick=${attr(act(()=>brush.type.data="color"))}
						>color</button>
						<button
							class=${attr(()=>brush.type.data=="rainbow"?"toggled":"")(brush.type)}
							onclick=${attr(act(()=>brush.type.data="rainbow"))}
						>rainbow</button>
						<button
							class=${attr(()=>brush.type.data=="barrier"?"toggled":"")(brush.type)}
							onclick=${attr(act(()=>brush.type.data="barrier"))}
						>barrier</button>
						<button
							class=${attr(()=>brush.type.data=="erase"?"toggled":"")(brush.type)}
							onclick=${attr(act(()=>brush.type.data="erase"))}
						>erase</button>
					</div>
				</div>
				${html`${()=>
					brush.type.data=="color"?
					html`<div class="type">
						<div class="controlBar r">
							<p>R:</p>
							${new Slider(brush.r,0,1)}
						</div>
						<div class="controlBar g">
							<p>G:</p>
							${new Slider(brush.g,0,1)}
						</div>
						<div class="controlBar b">
							<p>B:</p>
							${new Slider(brush.b,0,1)}
						</div>
					</div>`
					:""
				}`(brush.type)}
				<h2>Scene</h2>
				<div class="scene">
					<div class="row">
						<button onclick=${attr(act(()=>gameRunner.clear(canvasDisplay,barrierDisplay)))}>Clear Scene</button>
						<button onclick=${attr(act(()=>gameRunner.drawMaze(barrierDisplay)))}>Draw Maze</button>
					</div>
					<div class="row">
						<button 
							class=${attr(()=>orbsToggled.data?"toggled":"")(orbsToggled)}
							onclick=${attr(act(()=>{
								orbsToggled.data=gameRunner.toggleOrbs();
							}))}
						>Toggle Orbs</button>
						<button onclick=${attr(act(()=>gameRunner.drawEdge(barrierDisplay)))}>Draw Edge</button>
					</div>
				</div>
				
				<div class="end">
					${new EndSymbol()}
				</div>
			</div>
		`);
	}
}
defineElm(ControlPanel,scss`&{
	width:400px;
	display:flex;
	position:relative;
	z-index:10;
	flex-direction:column;
	align-items:stretch;
	background-color:${theme.color.greyStep(-1)};
	${theme.boxShadowStep(1)}
	max-height:100%;
	overflow:hidden;
	>.head{
		z-index:1;
		background-color:${theme.color.greyStep(0)};
		${theme.boxShadowStep(-1)}
		${theme.center}
		min-height:200px;
		>h1{
			position:relative;
			z-index:10;
			${theme.center}
			${theme.font.title}
			${theme.font.sizeStep(1)}
			background-color:${theme.color.greyStep(0)};
			margin-top:65px;
		}
		>.back{
			position: absolute;
			height: 220px;
			width: 220px;
			margin-bottom:10px;
			background-image: url('./img/logo.png');
			background-size: contain;
			background-repeat: no-repeat;
			background-position: center;
			opacity: .2;
		}
	}
	>.body{
		max-height:100%;
		overflow:auto;
		padding:0 20px;
		padding-top:10px;
		${theme.centerText}

		>.instruct{
			margin-bottom:5px;
		}
		>button.run{
			width:80px;
			height:80px;
			border-radius:500px;
		}
		>.fps{
			padding:10px 10px;
			margin:10px;
			background-color: ${theme.color.greyStep(0)};
			border-radius:8px;
		}
		>.brushPreview{
			margin-top:10px;
			height:100px;
			${theme.center}
			>div{
				border-radius: 100px;
				background-repeat: no-repeat;
				background-size:cover;
				background-position:center;
			}
		}
		>.type{
			margin-top:10px;
			padding:10px 10px;
			border-radius:8px;
			border:2px solid ${theme.color.greyStep(0)};
			${theme.boxShadowStep(-2)}
			.controlBar{
				padding:0;
				>p{
					min-width:30px;
				}
			}
		}
		>h2{
			${theme.centerText}
			${theme.font.title}
			${theme.font.sizeStep(0)}
			padding:5px 0;
			margin-bottom:10px;
			margin-top:10px;
			border-bottom:2px solid ${theme.color.greyStep(2)};
		}
		>.scene{
			>.row{
				${theme.centerX}
				>button{
					margin:10px;
					width:100px;
					height: 100px;
				}
			}
		}
		>.end{
			${theme.centerX}
			margin-top:10px;
		}

		.controlType{
			padding: 0 10px;
			${theme.center}
			>p{
				${theme.font.interact}
				min-width:90px;
				text-align:right;
				margin-right:10px;
			}
			>div{
				flex-grow:1;
			}
			button{
				margin:5px 0;
				width:100px;
			}
		}
		.controlBar{
			padding: 0 10px;
			${theme.center}
			>p{
				${theme.font.interact}
				min-width:90px;
				text-align:right;
				margin-right:10px;
			}
			&.r .knob{
				background-color: ${rgb(1,0.3,0.3)};
			}
			&.g .knob{
				background-color: ${rgb(0.3,1,0.3)};
			}
			&.b .knob{
				background-color: ${rgb(0.3,0.3,1)};
			}
		}
		p.small{
			${theme.font.sizeStep(-1.5)}
		}
		button{
			${theme.font.interact}
			color: ${theme.color.highlight};
			border-radius:8px;
			background-color: ${theme.color.greyStep(-1)};
			border:2px solid ${theme.color.greyStep(0)};
			&.toggled{
				background-color: ${theme.color.greyStep(0)};
				border:2px solid ${theme.color.highlight};
			}
		}
	}
}`);

class Slider extends CustomElm{
	constructor(val,minV,maxV){
		super();
		val=bind(val);
		minV=bind(minV);
		maxV=bind(maxV);
		let range=def(()=>maxV.data-minV.data,minV,maxV);

		let mDown=(e)=>{
			document.addEventListener("mousemove",mMove);
			document.addEventListener("mouseup",mUp);
			mMove(e);
		};
		let mMove=(e)=>{
			e.preventDefault();
			let box=this.getBoundingClientRect();
			let elmPos=new Vec(box.left,box.top);
			let elmSize=new Vec(this.offsetWidth-16,this.offsetHeight);
			let clickPos=new Vec(e.clientX,e.clientY);
			clickPos.sub(elmPos);
			clickPos.x-=8;
			if(elmSize.x!=0){
				val.data=clamp(
					clickPos.x/elmSize.x*range.data+minV.data
					,minV.data,
					maxV.data
				);
			}
		};
		let mUp=()=>{
			document.removeEventListener("mousemove",mMove);
			document.removeEventListener("mouseup",mUp);
		};
		this.define(html`
			<div
				onmousedown=${attr(act(
					mDown
				))}
			>
				<div class="bar">
					<div>
						<div class="knob"
							style=${attr(()=>`
								left: ${Math.min(Math.max((val.data-minV.data)/range.data,0),1)*100}%`
							)(val,range)}
						></div>
					</div>
				</div>
			</div>
		`);
	}
}
{
	let knobSize=20;
	let barHeight=8;
	let fullHeight=40;
	defineElm(Slider,scss`&{
		width:500px;
		>div{
			position: relative;
			height: ${fullHeight}px;
			${theme.center}
			cursor: pointer;
			>.bar{
				flex-grow:1;
				height: ${barHeight}px;
				background-color: ${theme.color.greyStep(1)};
				border-radius: ${barHeight/2}px;
				>div{
					position: relative;
					margin-right: ${knobSize}px;
					>.knob{
						top: ${-(knobSize-barHeight)/2}px;
						width: ${knobSize}px;
						height: ${knobSize}px;
						background-color: ${theme.color.highlight};
						position: absolute;
						border-radius: ${knobSize/2}px;
					}
				}
			}
			>.start{
				${theme.font.secondary}
				${theme.font.sizeStep(-1)}
				font-weight: 800;
				color: ${theme.color.greyStep(5)};

				margin: 0;
				user-select: none;
				position: absolute;
				top: 30px;
				left: 0;
			}
			>.end{
				${theme.font.secondary}
				${theme.font.sizeStep(-1)}
				font-weight: 800;
				color: ${theme.color.greyStep(5)};
				
				margin: 0;
				user-select: none;
				position: absolute;
				top: 30px;
				right: 0;
			}
		}
	}`);
}