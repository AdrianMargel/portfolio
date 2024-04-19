class AudioPlayer extends CustomElm{
	constructor(book,chapter){
		super();
		let closed=this.closed=bind(true);
		let minimized=this.minimized=bind(false);
		let playing=this.playing=bind(false);
		let volume=this.volume=bind(1);
		let scrollVal=this.scrollVal=bind(0);

		this.lockPageScroll=()=>{
			if(!closed.data&&!minimized.data){
				addClass("lock",getElm(".scrollContainer"));
			}else{
				removeClass("lock",getElm(".scrollContainer"));
			}
		}
		link(this.lockPageScroll,closed,minimized);

		this.define(html`
			<div class=${attr(()=>[minimized.data?"minimized":"",closed.data?"closed":""].join(" "))(minimized,closed)}>
				<div class="player">
				<div class="corner">
					${new ButtonMinimize(minimized,()=>minimized.data=!minimized.data)}
					${new ButtonClose(()=>{
						closed.data=!closed.data;
						if(closed.data){
							audio.pause();
						}
					})}
				</div>
					<div class="screen">
						<p class="title">${()=>book.title.data}</p>
						<p class="subTitle">${()=>chapter.title.data}</p>
						${new ButtonPlay(playing,()=>playing.data?audio.pause():audio.play())}
					</div>
					<div class="bar">
						${()=>new ProgressBar(chapter.time,chapter.timeMax)}
						<div>
							${new ButtonPrev(()=>audio.prev())}
							${new ButtonPlay(playing,()=>playing.data?audio.pause():audio.play())}
							${new ButtonNext(()=>audio.next())}
							${new VolumeControl(volume)}
						</div>
					</div>
				</div>
				<div class="list">
					<div class="head">
						<p class="title">${()=>book.title.data}</p>
					</div>
					<div class="body" onscroll=${attr(act((e)=>scrollVal.data=e.target.scrollTop))}>
						${()=>book.chapters.map(c=>
							c.type?.data=="div"?new Divider(c):new Chapter(c)
						)}
					</div>
				</div>
			</div>
		`(book,chapter));

		this.restoreScroll=()=>{
			getElm(".list>.body",this).scroll(0,scrollVal.data);
		};
		link(this.restoreScroll,chapter);
	}
	minimize(toggle){
		this.minimized.data=toggle;
	}
	close(toggle){
		this.closed.data=toggle;
		if(toggle){
			audio.pause();
		}
	}
	play(){
		this.playing.data=true;
	}
	pause(){
		this.playing.data=false;
	}
	setVolume(v){
		this.volume.data=v;
	}
}
defineElm(AudioPlayer,scss`&{
	>div{
		position:fixed;
		z-index:10;
		bottom:0;
		height:100vh;
		width:100%;
		${theme.center}
		transition: height .4s;
		>.player>.corner{
			transition: top .4s;
		}
		&.minimized{
			height:80px;
			>.player>.corner{
				top:-50px;
			}
		}
		&.closed{
			display:none;
		}
		>.player{
			background-color: ${theme.color.greyStep(-1)};
			flex-grow:1;
			align-self:stretch;
			${theme.center}
			flex-direction:column;
			position:relative;
			>.corner{
				position:absolute;
				top:0;
				right:0;
				${theme.centerX}
			}
			>.screen{
				overflow:hidden;
				flex-grow:1;
				${theme.center}
				flex-direction:column;
				min-height:0;
				>.subTitle,>.title{
					${theme.font.primary}
					${theme.centerText}
				}
				>.title{
					${theme.font.sizeStep(1)}
				}
				>.subTitle{
					${theme.font.sizeStep(0)}
					font-weight:700;
					opacity:.5;
					margin-top:10px;
					margin-bottom:20px;
				}
			}
			>.bar{
				height:80px;
				box-sizing:border-box;
				position:relative;
				padding-bottom:10px;
				align-self:stretch;
				background-color:${theme.color.greyStep(.5)};
				${theme.boxShadowStep(1)}
				>div{
					${theme.center}
					gap:20px;
				}
			}
		}
		>.list{
			background-color:${theme.color.greyStep(-.5)};
			align-self:stretch;
			min-width:300px;
			max-width:300px;
			${theme.boxShadowStep(0)}
			z-index:1;
			>.head{
				height:60px;
				border-bottom:4px solid ${theme.color.greyStep(2)};
				${theme.center}
				${theme.centerText}
				${theme.font.primary}
				${theme.font.sizeStep(-1)}
				padding:10px;
				background-color:${theme.color.greyStep(-1)};
			}
			>.body{
				max-height:calc(100vh - 84px);
				overflow:auto;
			}
		}
	}
}`);

class ProgressBar extends CustomElm{
	constructor(time,timeMax){
		super();
		function twoPlaces(v){
			if((v+"").length<2){
				v="0"+v;
			}
			return v;
		}
		function asTime(v){
			let secs=mod(flr(v),60);
			let mins=mod(flr(v/60),60);
			let hrs=flr(v/60/60);
			return (hrs==0?mins:hrs+":"+twoPlaces(mins))+":"+twoPlaces(secs);
		}
		time=bind(time);
		timeMax=bind(timeMax);
		this.define(html`
			<div>
				<p class="start">${html`${()=>asTime(time.data*timeMax.data)}`(time,timeMax)}</p>
				<p class="end">${html`${()=>asTime(timeMax.data)}`(timeMax)}</p>
				${new InputBar(time,(v)=>{
					if(v==1){
						audio.pause();
					}
					audio.setTime(v);
				})}
			</div>
		`);
	}
}
defineElm(ProgressBar,scss`&{
	display:block;
	position:relative;
	padding:0 10px;
	>div{
		>.start{
			position:absolute;
			left:10px;
			top:20px;
		}
		>.end{
			position:absolute;
			right:10px;
			top:20px;
		}
	}
}`);

class InputBar extends CustomElm{
	constructor(val,setF){
		super();
		val=bind(val);
		this.mDown=bind(false);
		this.define(html`
			<div
				class="bar"
			>
				<div
					style=${attr(()=>`width:${val.data*100}%`)(val)}
				>
					<div class="ball"></div>
				</div>
			</div>
		`);
		this.attr("onmousedown",act((e)=>{
			e.preventDefault();
			this.mDown.data=true;
			let box=this.getBoundingClientRect()
			setF(clamp((e.clientX-box.left)/this.offsetWidth,0,1));
		}))();
		this.attr("class",()=>this.mDown.data?"active":"")(this.mDown);
		window.addEventListener("mouseup",(e)=>{
			if(this.mDown.data){
				e.preventDefault();
			}
			this.mDown.data=false;
		});
		window.addEventListener("mousemove",(e)=>{
			if(this.mDown.data){
				e.preventDefault();
				let box=this.getBoundingClientRect()
				setF(clamp((e.clientX-box.left)/this.offsetWidth,0,1));
			}
		});
	}
}
defineElm(InputBar,scss`&{
	display:block;
	position:relative;
	width:100%;
	cursor:pointer;
	height:20px;
	${theme.center}
	&:hover,&.active{
		>.bar>div>.ball{
			opacity:1;
		}
	}
	>.bar{
		flex-grow:1;
		height:4px;
		background-color:${theme.color.greyStep(-1)};
		border:2px solid ${theme.color.greyStep(0)};
		>div{
			position:relative;
			height:4px;
			background-color:${theme.color.highlight};
			${theme.center}
			>.ball{
				opacity:0;
				transition: opacity .1s;
				height:15px;
				width:15px;
				border-radius:15px;
				position:absolute;
				right:-7.5px;
				background-color:${theme.color.highlight};
			}
		}
	}
}`);

class DisplayBar extends CustomElm{
	constructor(val){
		super();
		val=bind(val);
		this.define(html`
			<div
				class="bar"
			>
				<div
					style=${attr(()=>`width:${val.data*100}%`)(val)}
				>
				</div>
			</div>
		`);
	}
}
defineElm(DisplayBar,scss`&{
	display:block;
	position:relative;
	width:100%;
	${theme.center}
	>.bar{
		flex-grow:1;
		height:4px;
		background-color:${theme.color.greyStep(-1)};
		border:2px solid ${theme.color.greyStep(0)};
		>div{
			position:relative;
			height:4px;
			background-color:${theme.color.highlight};
			${theme.center}
		}
	}
}`);

class Chapter extends CustomElm{
	constructor(chapter){
		super();
		chapter=bind(chapter);
		this.define(html`
			<button
				onclick=${attr(act(()=>audio.selectChapter(chapter)))}
				class=${attr(()=>chapter.selected.data?"selected":"",chapter.selected)}	
			>
				<div class="arrow">
					<svg width="50" height="50">
						<path
							d="
								M${Vec(12,0).rot(0).add([20,25]).array.join(" ")}
								L${Vec(12,0).rot(TAU/3).add([20,25]).array.join(" ")}
								L${Vec(12,0).rot(TAU*2/3).add([20,25]).array.join(" ")} Z"
						/>
					</svg>
				</div>
				${chapter.title.data}
			</button>
			${new DisplayBar(chapter.time)}
		`);
	}
}
defineElm(Chapter,scss`&{
	display:block;
	>button{
		position:relative;
		width:100%;
		height:40px;
		${theme.center}
		${theme.font.sizeStep(-.5)}
		transition: background-color .2s;
		background-color:${theme.color.greyStep(.5)}
		&:hover{
			background-color:${theme.color.greyStep(2)}
			>.arrow{
				>svg{
					left:-5px;
					>path{
						opacity:1;
					}
				}
			}
		}
		&.selected{
			font-weight:700;
			background-color:${theme.color.greyStep(2)};
			>.arrow{
				>svg{
					left:-5px;
					>path{
						fill:${theme.color.white};
						opacity:1;
					}
				}
			}
		}
		>.arrow{
			${theme.center}
			>svg{
				position:absolute;
				left:-20px;
				transition:left .2s;
				>path{
					fill:${theme.color.highlight};
					opacity:0;
					transition:opacity .2s;
				}
			}
		}
	}
}`);
class Divider extends CustomElm{
	constructor(divider){
		super();
		divider=bind(divider);
		this.define(html`
			<div>
				${divider.title.data}
			</div>
		`);
	}
}
defineElm(Divider,scss`&{
	display:block;
	>div{
		${theme.center}
		font-weight:700;
		background-color:${theme.color.greyStep(-.5)};
		padding:20px;
	}
}`);

class VolumeControl extends CustomElm{
	constructor(volume){
		super();
		volume=bind(volume);
		this.define(html`
			<button>
				<svg width="40" height="40" viewBox="0 0 50 50" class="pause">
					<path
						d="
							M${Vec(10,-15).add(25).array.join(" ")}
							L${Vec(10,15).add(25).array.join(" ")}
							L${Vec(-3,6).add(25).array.join(" ")}
							L${Vec(-10,6).add(25).array.join(" ")}
							L${Vec(-10,-6).add(25).array.join(" ")}
							L${Vec(-3,-6).add(25).array.join(" ")}Z
						"
					/>
				</svg>
			</button>
			${new InputBar(volume,(v)=>audio.setVolume(v))}
		`);
	}
}
defineElm(VolumeControl,scss`&{
	${theme.center}
	background-color:${theme.color.greyStep(2)};
	padding-right:15px;
	padding-left:5px;
	border-radius:100px;
	>button{
		${theme.center}
		>svg>path{
			fill: ${theme.color.white};
		}
	}
	>${InputBar}{
		width:100px;
	}
}`);

class ButtonPlay extends CustomElm{
	constructor(toggled,clickF){
		super();
		toggled=bind(toggled);
		this.define(html`
			<button
				class=${attr(()=>toggled.data?"play":"pause")(toggled)}
				onclick=${attr(act(clickF))}
			>
				<svg width="50" height="50" class="pause">
					<path
						d="
							M${Vec(-10,-15).add(25).array.join(" ")}
							L${Vec(-10,15).add(25).array.join(" ")}"
					/>
					<path
						d="
							M${Vec(10,-15).add(25).array.join(" ")}
							L${Vec(10,15).add(25).array.join(" ")}"
					/>
				</svg>
				<svg width="50" height="50" class="play">
					<path
						d="
							M${Vec(20,0).rot(0).add([23,25]).array.join(" ")}
							L${Vec(20,0).rot(TAU/3).add([23,25]).array.join(" ")}
							L${Vec(20,0).rot(TAU*2/3).add([23,25]).array.join(" ")} Z"
					/>
				</svg>
			</button>
		`);
	}
}
defineElm(ButtonPlay,scss`&{
	>button{
		width:50px;
		height:50px;
		${theme.center}
		border-radius:15px;
		transition:background-color .2s;
		${theme.center}
		&:hover{
			background-color:${theme.color.greyStep(2)};
		}
		&.pause{
			>.play{
				opacity:1;
			}
		}
		&.play{
			>.pause{
				opacity:1;
			}
		}
		>svg{
			position:absolute;
			transition: opacity .4s;
			opacity:0;
		}
		>.pause{
			>path{
				stroke: ${theme.color.white};
				stroke-width:12px;
			}
		}
		>.play{
			>path{
				fill: ${theme.color.white};
			}
		}
	}
}`);
class ButtonNext extends CustomElm{
	constructor(clickF){
		super();
		this.define(html`
			<button
				onclick=${attr(act(clickF))}
			>
				<svg width="40" height="40" viewBox="0 0 50 50" class="play">
					<path
						d="
							M${Vec(14,0).rot(0).add([18,25]).array.join(" ")}
							L${Vec(14,0).rot(TAU/3).add([18,25]).array.join(" ")}
							L${Vec(14,0).rot(TAU*2/3).add([18,25]).array.join(" ")} Z"
					/>
					<path
						d="
							M${Vec(14,0).rot(0).add([30,25]).array.join(" ")}
							L${Vec(14,0).rot(TAU/3).add([30,25]).array.join(" ")}
							L${Vec(14,0).rot(TAU*2/3).add([30,25]).array.join(" ")} Z"
					/>
				</svg>
			</button>
		`);
	}
}
defineElm(ButtonNext,scss`&{
	>button{
		width:50px;
		height:50px;
		border-radius:15px;
		transition:background-color .2s;
		${theme.center}
		&:hover{
			background-color:${theme.color.greyStep(2)};
		}
		svg>path{
			fill:${theme.color.white};
		}
	}
}`);

class ButtonPrev extends CustomElm{
	constructor(clickF){
		super();
		this.define(html`
			<button
				onclick=${attr(act(clickF))}
			>
				<svg  width="40" height="40" viewBox="0 0 50 50" class="play">
					<path
						d="
							M${Vec(-14,0).rot(0).add([32,25]).array.join(" ")}
							L${Vec(-14,0).rot(TAU/3).add([32,25]).array.join(" ")}
							L${Vec(-14,0).rot(TAU*2/3).add([32,25]).array.join(" ")} Z"
					/>
					<path
						d="
							M${Vec(-14,0).rot(0).add([20,25]).array.join(" ")}
							L${Vec(-14,0).rot(TAU/3).add([20,25]).array.join(" ")}
							L${Vec(-14,0).rot(TAU*2/3).add([20,25]).array.join(" ")} Z"
					/>
				</svg>
			</button>
		`);
	}
}
defineElm(ButtonPrev,scss`&{
	>button{
		width:50px;
		height:50px;
		border-radius:15px;
		transition:background-color .2s;
		${theme.center}
		&:hover{
			background-color:${theme.color.greyStep(2)};
		}
		svg>path{
			fill:${theme.color.white};
		}
	}
}`);

class ButtonClose extends CustomElm{
	constructor(clickF){
		super();
		this.define(html`
			<button
				onclick=${attr(act(clickF))}
			>
				<svg width="30" height="30" viewBox="0 0 50 50" class="play">
					<path
						d="
							M${Vec(-12,-12).add(25).array.join(" ")}
							L${Vec(12,12).add(25).array.join(" ")}"
					/>
					<path
						d="
							M${Vec(12,-12).add(25).array.join(" ")}
							L${Vec(-12,12).add(25).array.join(" ")}"
					/>
				</svg>
			</button>
		`);
	}
}
defineElm(ButtonClose,scss`&{
	>button{
		width:50px;
		height:50px;
		${theme.center}
		&:hover{
			svg>path{
				stroke:${theme.color.highlight};
			}
		}
		svg>path{
			stroke:${theme.color.white};
			stroke-width:8px;
			transition:stroke .2s;
		}
	}
}`);

class ButtonMinimize extends CustomElm{
	constructor(toggled,clickF){
		super();
		toggled=bind(toggled);
		this.define(html`
			<button
				class=${attr(()=>toggled.data?"max":"min")(toggled)}
				onclick=${attr(act(clickF))}
			>
				<svg  width="30" height="30" viewBox="0 0 50 50" class="min">
					<path
						d="
							M${Vec(-15,0).add(25).array.join(" ")}
							L${Vec(15,0).add(25).array.join(" ")}"
					/>
				</svg>
				<svg  width="30" height="30" viewBox="0 0 50 50" class="max">
					<path
						d="
							M${Vec(15,3).add(25).array.join(" ")}
							L${Vec(15,15).add(25).array.join(" ")}
							L${Vec(3,15).add(25).array.join(" ")}"
					/>
					<path
						d="
							M${Vec(15,-3).add(25).array.join(" ")}
							L${Vec(15,-15).add(25).array.join(" ")}
							L${Vec(3,-15).add(25).array.join(" ")}"
					/>
					<path
						d="
							M${Vec(-15,3).add(25).array.join(" ")}
							L${Vec(-15,15).add(25).array.join(" ")}
							L${Vec(-3,15).add(25).array.join(" ")}"
					/>
					<path
						d="
							M${Vec(-15,-3).add(25).array.join(" ")}
							L${Vec(-15,-15).add(25).array.join(" ")}
							L${Vec(-3,-15).add(25).array.join(" ")}"
					/>
				</svg>
			</button>
		`);
	}
}
defineElm(ButtonMinimize,scss`&{
	>button{
		width:50px;
		height:50px;
		${theme.center}
		&:hover{
			svg>path{
				stroke:${theme.color.highlight};
			}
		}
		&.min{
			>.min{
				opacity:1;
			}
		}
		&.max{
			>.max{
				opacity:1;
			}
		}
		>svg{
			position:absolute;
			transition: opacity .4s;
			opacity:0;
			>path{
				stroke: ${theme.color.white};
				transition:stroke .2s;
				stroke-width:8px;
				fill:none;
			}
		}
	}
}`);