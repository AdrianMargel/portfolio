
/*

	This file is kind of a mess, or at least the styles are.
	The CSS still isn't very elagent and many of the things I tried to midigate that are still very experimental.
	However the elements themselves I'm pretty happy with.

	A better reference to look at is the example.js file 

*/

let theme=new Theme();

//${Array.apply(null, Array(10)).map((_,i)=>`<div style="${theme.boxShadowStep(i-5)}">TEST${i-5}</div>`)}

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

class Email extends CustomElm{
	constructor(name,domain,top){
		super();
		name=bind(name);
		domain=bind(domain);
		top=bind(top);
		let shown=bind(false);
		this.define(html`
			${()=>shown.data?
				(html`
					<div>
						<p>
							<span>${name}</span><img src="img/at.png" alt="@"/><span>${domain}</span><img src="img/dot.png" alt="."/><span>${top}</span>
						</p>
					</div>
				`(name,domain,top)):
				(html`
					<div class="click" onclick=${attr(act(()=>shown.data=true))}>
						<p>click to show email</p>
					</div>
				`())
			}
		`(shown));
	}
}
defineElm(Email,scss`&{
	>.click{
		user-select:none;
		cursor:pointer;
		color: ${theme.color.greyStep(5)};
	}
	>div{
		background-color: ${theme.color.inputStep(0)};
		border: 2px solid ${theme.color.inputStep(2)};
		height: 40px;
		${theme.center}
		border-radius: 35px;
		padding: 0 20px;
		p{
			${theme.center}
			margin: 0;
			${theme.font.primary}
			font-weight: 700;
		}
	}
}`);

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
		background-color: ${theme.color.highlightDark};
		border-radius: 6px;
		${theme.boxShadowStep(-3)}
		.surface{
			${theme.font.interact}
			color: white;
			background-color: ${theme.color.highlight};
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
			border-bottom-color: ${theme.color.greyStep(-1)};
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
		font: inherit;
		color: ${theme.color.highlight};
		&:hover{
			text-decoration: underline;
		}
	}
}`);

class Header extends CustomElm{
	constructor(text){
		super();
		this.define(html`
			<div class="back"></div>
			<h1>${html`${text}`(text)}</h1>
		`);
	}
}
defineElm(Header,(()=>{
	let size="400px";

	return scss`&{
		${theme.elementReset}
		${theme.center}
		height: ${size};
		background-color: ${theme.color.greyStep(0)};
		z-index: 2;
		position: relative;
		overflow: hidden;
		> .back{
			position: absolute;
			height:${size};
			width:${size};
			background-image: url('/img/logo.png');
			background-size: contain;
			background-repeat: no-repeat;
			background-position: center;
		}
		> h1{
			position: relative;
			margin-top: 150px;
			padding-bottom: 5px;
			background-color: ${theme.color.greyStep(0)};
			${theme.font.title}
			${theme.centerText}
		}
	}`})()
);

class Nav extends CustomElm{
	constructor(items,scroll){
		super();
		let isDown;
		if(scroll!=null){
			isDown=def(()=>scroll.data>400,scroll);
		}else{
			isDown=bind(false);
		}
		let hasMid=def(()=>items.length%2==0,items);
		let fullscreenNavOpen=bind(false);
		this.define(html`
			<div class=${attr(()=>(isDown.data?"down":"")+" barNav")(isDown)}>
				${html`${
					()=>hasMid.data?
					html`
						<div class="mid">
							<div class="cover"><div></div></div>
							<div class="shadowHider"></div>
							<div class="icon"></div>
						</div>
					`:""
				}`(hasMid)}
				${()=>{
					let list=items.map((a)=>html`
						<button
							onclick=${attr(act(()=>setPage(a.id.data)))}
							class=${attr(()=>a.selected.data?"selected":"")(a.selected)}
						>
						<span>${html`${a.text}`(a.text)}</span>
						</button>
						<a class="hidden" href="/${a.id.data}">${a.id.data}</a>
					`());
					if(list.length%2==0){
						list.splice(Math.floor(list.length/2),0,html`
							<div class="midGap" onclick=${attr(act(()=>setPage("home")))}>
						`);
					}
					return list;
				}}
				<button class="mobileNav" onclick=${attr(act(()=>fullscreenNavOpen.data=true))}>
					<img
						src="/icons/bars.svg"
						alt="Menu"
					/>
				</button>
			</div>
			<div class=${attr(()=>(fullscreenNavOpen.data?"open":"")+" fullscreenNav")(fullscreenNavOpen)}>
				<button onclick=${attr(act(()=>fullscreenNavOpen.data=false))}>
					<img
						src="/icons/xmark.svg"
						alt="X"
					/>
				</button>
				${items.map((a)=>html`
					<button
						onclick=${attr(act(()=>{
							fullscreenNavOpen.data=false;
							setPage(a.id.data);
						}))}
						class=${attr(()=>a.selected.data?"selected":"")(a.selected)}
					>
					<span>${html`${a.text}`(a.text)}</span>
					</button>
					<a class="hidden" href="/${a.id.data}">${a.id.data}</a>
				`())}
			</div>
		`(items));
	}
}
defineElm(Nav,(()=>{
	let height="50px";
	let space="20px";
	let width="200px";
	let fullBackCol=theme.color.greyStep(-2);
	fullBackCol.a=0.9;

	return scss`
	&{
		${theme.elementReset}
		height: ${height};
	}
	a.hidden{
		display:none;
	}
	>.fullscreenNav{
		position: fixed;
		inset: 0;
		z-index: 10;
		background-color: ${fullBackCol};
		${theme.center}
		flex-direction:column;
		align-items:stretch;
		display:none;
		&.open{
			display:flex;
		}
		button{
			height: ${height};
			${theme.center}

			font-weight: 700;
			${theme.font.primary}
			${theme.centerText}
			${theme.font.interact}
			color: ${theme.color.white};
			
			border: none;
			border-radius:0;
			background: none;
			padding: 0 ${space};
			transition: background-color 0.2s;
			
			img{
				width:30px;
				height:30px;
			}
			&:hover{
				background-color: ${theme.color.highlight};
			}
		}
	}
	>.barNav{
		${theme.elementReset}
		${theme.center}
		height: ${height};
		background-color: ${theme.color.greyStep(0)};
		${theme.boxShadowStep(0)}
		position: relative;
		z-index: 1;
		.mobileNav{
			width:${height};
			height:${height};
			${theme.center}
			padding:0;
			border:none;
			position: absolute;
			right:10px;
			display:none;
			img{
				width:30px;
				height:30px;
			}
		}
		button{
			${theme.mobile}{
				display:none;
				&.mobileNav{
					display:flex;
				}
			}
			transition: border-color 0.2s, color 0.2s;
			height: ${height};
			width: ${width};
			${theme.center}

			font-weight: 700;
			${theme.font.primary}
			${theme.centerText}
			${theme.font.interact}
			color: ${theme.color.greyStep(10)};

			border: none;
			border-bottom: 4px solid;
			border-radius:0;
			background: none;
			padding: 0 ${space};
			padding-top: 4px;
			border-color: transparent;
			> span{
				z-index: 1;
			}
			&:hover{
				color: ${theme.color.white};
				border-color: ${theme.color.greyStep(8)};
			}
			&.selected{
				border-color: ${theme.color.highlight};
				color: ${theme.color.highlight};
			}
		}
		.mid{
			position: absolute;
			width: 100%;
			height: 100%;
			justify-content: center;
			display: flex;
			opacity: 0;
			transition: opacity 0.5s;
			pointer-events: none;
			.cover{
				position: absolute;
				transform: scaleY(0.8) rotate(-45deg)
				> div{
					width: 65px;
					height: 65px;
					background-color: #36363F;
					box-shadow: 0 0 30px #00000080;
				}
			}
			.shadowHider{
				background-color: #36363F;
				position: absolute;
				top: 0px;
				height: 35px;
				width: 100%;
			}
			.icon{
				width: 60px;
				height: 60px;
				background-image: url("/img/logoSmall.png");
				background-position: center;
				background-size: cover;
				position: absolute;
			}
		}
		.midGap{
			min-width: 0;
			transition: min-width 0.5s;
			height:${height};
		}
		&.down{
			position: fixed;
			left: 0;
			right: 0;
			top: 0;
			.midGap{
				min-width: 50px;
			}
			.mid{
				opacity: 1;
			}
		}
	}`})()
);

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
	position: absolute;
	bottom: 0;
	right: calc(50% - 90px);
	width: 180px;
	.icon{
		position: absolute;
		top: 0px;
		width: 60px;
		height: 60px;
		background-image: url("/img/logoSmall.png");
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

class Surface extends CustomElm{
	constructor(contentElement,width="md",invisible=false,isTop=false){
		super();
		isTop=bind(isTop,false);
		width=bind(width,false);
		invisible=bind(invisible,false);
		//width=sm,md,lg
		this.define(html`
			<div
				class=${attr(()=>{
					return [isTop.data?"top":"","size-"+width.data,invisible.data?"":"visible"].join(" ")
				})(isTop,width,invisible)}
			>
				${contentElement}
			</div>`);
	}
}
defineElm(Surface,scss`&{
	${theme.elementReset}
	width: 100%;
	${theme.centerX}
	> div{
		flex-grow:1;
		${theme.elementReset}
		margin: 0 100px;
		padding: 40px 40px;
		${theme.mobile}{
			margin: 0;
			overflow:hidden;
		}
		&.visible{
			border: 4px solid ${theme.color.greyStep(0)};
			background-color: ${theme.color.greyStep(-0.5)};
			${theme.boxShadowStep(-1)}
		}

		&.size-sm{
			max-width: 900px;
		}
		&.size-md{
			max-width: 980px;
		}
		&.size-lg{
			max-width: 1060px;
		}
		&.top{
			border-top: none;
			padding-top: 50px;
		}
		> *:first-child {
			margin-top:0;
		}
		> *:last-child {
			margin-bottom:0;
		}
}
}`);

class Page extends CustomElm{
	constructor(page){
		super();
		this.define(html`
			<div class="back">
				<div></div>
			</div>
			<div class="main">
				${()=>page.data?.content?.data??new MissingPage()}
			</div>
			<div class="foot">
				${new EndSymbol()}
			</div>
		`(page));
	}
}
defineElm(Page,scss`&{
	${theme.elementReset}
	${theme.centerY}
	flex-direction: column;
	position:relative;
	> .back{
		position: absolute;
		inset: 0;
		bottom: 100px;
		${theme.centerX}
		> div{
			${theme.boxShadowStep(-1)}
			flex-grow: 1;
			border: 4px solid ${theme.color.greyStep(0)};
			border-top: none;
			max-width: 900px;
			margin: 0 150px;
			${theme.mobile}{
				margin: 0 40px;
			}
		}
	}
	> .main{
		width: 100%;
		position: relative;
		min-height: calc(100vh - 450px);
		${theme.centerX}
	}
	> .foot{
		margin-top: 20px;
		height: 80px;
		position: relative;
	}

	h2{
		text-align: center;
		${theme.font.sizeStep(3)}
		margin: 20px 0;
		${theme.mobile}{
			${theme.font.sizeStep(2)}
		}
	}
	h3{
		text-align: center;
		${theme.font.sizeStep(1)}
		margin: 10px 0;
		${theme.mobile}{
			${theme.font.sizeStep(0)}
		}
	}
	p{
		${theme.font.sizeStep(-.5)}
		line-height: 1.4;
		margin: 15px 0;
		${theme.mobile}{
			${theme.font.sizeStep(-1)}
		}
	}
}`);

class ProjectCard extends CustomElm{
	constructor(project){
		super();
		project=bind(project);
		this.define(html`
			<a href=${attr(()=>"/projects/"+project.id.data)}>
				<div
					class="background"
					style=${attr(()=>`background-image: url("/projects/${project.id.data}/image.png");`,project.id)}
				></div>
				<div class="cover">
					${html`${project.highlight.data?`<div class="highlightBox">Highlight</div>`:""}`()}
				</div>
				<div class="description">
					<h3>${project.title}</h3>
					<p>${project.description}</p>
					<p>${new ButtonLink("view project")}</p>
					<p class="tags">${project.categories.map(x=>"#"+x.data).join(" ")}</p>
				</div>
				<div class="caption">
					<h3>${project.title}</h3>
				</div>
			</a>
		`(project));
		this.attr("class",()=>project.highlight.data?"highlight":"")(project.highlight);
	}
}
defineElm(ProjectCard,(()=>{
	let backColor=theme.color.greyStep(0).cln();
	backColor.a=0.75;

	return scss`&{
	${theme.elementReset}
	min-width: 250px;
	max-width: 350px;
	flex: 1;
	height: 500px;
	border: 4px solid transparent;
	background-color: ${theme.color.greyStep(-2)};
	${theme.boxShadowStep(-1)}
	margin: 10px;
	position: relative;
	cursor: pointer;
	user-select: none;
	&.highlight{
		.cover{
			border-left-color: ${theme.color.highlight};
			.highlightBox{
				position: absolute;
				top:-4px;
				left: -4px;
				height:20px;
				padding: 4px 8px;
				background-color: ${theme.color.highlight};
				font-weight: 700;
				border-bottom-right-radius:12px;
				${theme.center}
				font-style: italic;
			}
		}
	}
	a{
		color: ${theme.color.white};
		&:hover{
			color: ${theme.color.white};
		}
		&:visited{
			color: ${theme.color.white};
		}
	}
	h3{
		font-size: 24px;
		text-align: center;
		margin: 5px 0;
		transition: color 0.2s;
		&:hover{
			color: ${theme.color.highlight};
		}
	}
	.background{
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
		position: absolute;
		right: 0;
		left: 0;
		top: 0;
		bottom: 0;
		transition: filter 0.8s;
	}
	.cover{
		position: absolute;
		right: -4px;
		left: -4px;
		top: -4px;
		bottom: -4px;
		border: 4px solid ${theme.color.greyStep(0)};
	}
	.description{
		position: absolute;
		right: 25px;
		left: 25px;
		top: 25px;
		bottom: 25px;
		padding: 15px;
		background-color: ${backColor};
		opacity: 0;
		transition: opacity 0.8s;
		p{
			margin: 15px 0;
			font-size: 18px;
			text-align: center;
		}
		h3{
			margin-right: -40px;
			margin-left: -40px;
			opacity: 0;
		}
		${ButtonLink}{
			text-align: center;
		}
		.tags{
			position: absolute;
			bottom: 0;
			right: 0;
			left: 0;
			color: ${theme.color.greyStep(10)};
			text-align: center;
			padding: 0 15px;
		}
	}
	.caption{
		top: calc(100% - 23px - 10px - 25px);
		right: 0;
		left: -4px;
		position: absolute;
		background-color: ${theme.color.greyStep(-1)};
		border-left: 4px solid ${theme.color.highlight};
		transition: top 0.8s;
	}
	&:hover{
		.description{
			opacity: 1;
		}
		.background{
			filter: blur(3px);
		}
		.caption{
			top: 40px;
		}
	}
}`})());

class ImageDisplay extends CustomElm{
	constructor(src,alt){
		super();
		this.define(html`
			<img src="${src}"/>
		`);
	}
}
defineElm(ImageDisplay,scss`&{
	${theme.centerX}
	margin: 20px 0;
	img{
		max-width: 100%;
		min-width:0;
	}
}`);

class VideoDisplay extends CustomElm{
	constructor(src){
		super();
		this.define(html`
			<video controls="">
				<source src=${src} type="video/mp4">
			</video>
		`);
	}
}
defineElm(VideoDisplay,scss`&{
	${theme.centerX}
	margin: 20px 0;
	video{
		max-width: 100%;
		min-width:0;
	}
}`);

