class Header extends CustomElm{
	constructor(text){
		super();
		this.define(html`
			<div class="contain">
				<div>
					<h1><span>EXAMPLE</span><br/> ${html`${text}`(text)}</h1>
				</div>
				<div class="paperHolder">
					<div class="paper">
						<p>This example is meant for desktop</p>
					</div>
				</div>
			</div>
		`);
	}
}
defineElm(Header,scss`&{
	${theme.elementReset}
	${theme.centerX}
	height: calc(100vh - 25px);
	z-index: 3;
	position: relative;
	
	>.contain{
		flex-grow: 1;
		max-width: 1000px;
		padding: 0 20px;
		${theme.centerX}
		>div{
			flex-grow:1;
			flex-basis:0;
			${theme.center}
		}
	}
	h1{
		color: ${theme.color.greyStep(-5)};
		${theme.font.title}
		${theme.font.fontSizeStep(2)}
		span{
			${theme.font.fontSizeStep(6)}
		}
	}
	.paperHolder{
		${theme.center}
		border-left: 2px solid ${theme.color.greyStep(0)};
	}
	.paper{
		${theme.center}
		text-align: center;
		${theme.font.fontSizeStep(1)}
		letter-spacing: 5px;
		line-height: 1.4em;
		
		width: 400px;
		height: 400px;
		border: 2px solid ${theme.color.greyStep(0)};
		p{
			margin:20px;
		}
	}
}`);