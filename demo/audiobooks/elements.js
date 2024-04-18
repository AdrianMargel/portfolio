
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

class Header extends CustomElm{
	constructor(text){
		super();
		this.define(html`
			<div class="back"></div>
			<h1>Cimexis ${html`${text}`(text)}</h1>
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
		> .back{
			position: absolute;
			height:${size};
			width:${size};
			background-image: url('./img/logo.png');
			background-size: contain;
			background-repeat: no-repeat;
			background-position: center;
		}
		> h1{
			position: relative;
			margin-top: 5px;
			padding-bottom: 5px;
			background-color: ${theme.color.greyStep(0)};
			${theme.font.title}
		}
	}`})()
);

//TODO: better list handling

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
		this.define(html`
			<div class=${attr(()=>isDown.data?"down":"")(isDown)}>
				${html`${
					()=>hasMid.data?
					`
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
					`());
					if(list.length%2==0){
						list.splice(Math.floor(list.length/2),0,newElm("div","midGap"));
					}
					return list;
				}}
			</div>
		`(items));
	}
}
defineElm(Nav,(()=>{
	let height="50px";
	let space="20px";
	let width="200px";
	let transWhite=new Color(theme.color.white);
	transWhite.a=0.5;

	return scss`
	&{
		${theme.elementReset}
		height: ${height};
	}
	>div{
		${theme.elementReset}
		${theme.center}
		height: ${height};
		background-color: ${theme.color.greyStep(0)};
		${theme.boxShadowStep(0)}
		position: relative;
		z-index: 1;
		button{
			transition: border-color 0.2s, color 0.2s;
			height: ${height};
			width: ${width};
			${theme.center}

			font-weight: 700;
			${theme.font.primary}
			${theme.centerText}
			${theme.font.sizeStep(-0.5)}
			color: ${transWhite};

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
				border-color: ${transWhite};
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
				background-image: url("./img/logoSmall.png");
				background-position: center;
				background-size: cover;
				position: absolute;
			}
		}
		.midGap{
			margin-right: 0;
			transition: margin 0.5s;
		}
		&.down{
			position: fixed;
			left: 0;
			right: 0;
			top: 0;
			.midGap{
				margin-right: 50px;
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
	}
	p{
		font-size: 20px;
		margin: 15px 40px;
		line-height: 1.4;
	}
	.handwritten{
		font-size: 30px;
		line-height: 1;
		letter-spacing: 0.1rem;
		font-family: 'Sue Ellen Francisco', cursive;
	}
}`);

class MissingPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			404 - Page Not Found
		`);
	}
}
defineElm(MissingPage,scss`&{

}`);

class LibraryPage extends CustomElm{
	constructor(books){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Discover a Hidden World of Audio Books</h2>
				<p class="center">Listen to any of the audio books here completely free!</p>
			`,"lg",false,true)}
			${new Surface(html`
				<h2>Library</h2>
				${new BookShelf(books)}
			`,"lg",true)}
		`);
	}
}
defineElm(LibraryPage,scss`&{
	width: 100%;
	> .gap{
		height: 40px;
	}
	p.center{
		text-align: center;
	}
}`);

class AboutPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
		<div class="gap"></div>
		${new Surface(html`
			<h2>About</h2>
			<p class="center">This site contains a library of audiobooks created by Adrian Margel. Most of the works listed here are from the public domain, see <a href="https://www.gutenberg.org/">Project Gutenberg</a>.</p>
			<p class="center">If you have any suggested public domain books you'd like to see listed here, feel free to <a href="https://adrianmargel.ca/contact">contact me</a> and ask!</p>
		`,"sm",false)}
	`);
	}
}
defineElm(AboutPage,scss`&{
	width: 100%;
	> .gap{
		height: 40px;
	}
	p.center{
		text-align: center;
	}

}`);
