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