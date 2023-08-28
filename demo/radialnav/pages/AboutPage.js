class AboutPage extends CustomElm{
	constructor(){
		super();
		let size=20;
		let sizeSm=45;
		let orb=`
			<rect
				style="stroke-width: 12px"
				x="${100-size/2}" y="${100-size/2}" width="${size}" height="${size}" />
			<rect
				style="stroke-width: 3px"
				x="${100-sizeSm/2}" y="${100-sizeSm/2}" width="${sizeSm}" height="${sizeSm}" />
		`;
		let subTitle=(text)=>`
		<div class="subTitle">
			<svg class="decor" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
			
				<g
					transform="rotate(45,100,100) translate(-20,55)"
				>	
					${orb}
				</g>
				<g
					transform="rotate(45,100,100) translate(55,-20)"
				>
					${orb}
				</g>
				<g
					transform="rotate(45,100,100)"
				>	
					${orb}
				</g>
			</svg>
			<div class="line">
				<div class="segment"></div>
				<div class="mid"></div>
				<div class="segment"></div>
			</div>
			<h2>${text}</h2>
		</div>
		`;
		this.define(html`
		${subTitle("ABOUT")}
		`);
	}
}
defineElm(AboutPage,scss`&{
	&{
		width: 100%;
		margin-top: 300px;
		height: 1000px;
	}
	> .gap{
		height: 400px;
	}
	p.center{
		text-align: center;
	}
	>.subTitle{
		${theme.centerX}
		height: 220px;
		position: relative;
		
		>.decor{
			position: absolute;
			width: 200px;
			stroke: orange;
			fill: transparent;
		}
		h2{
			${theme.font.title}
			position: absolute;
			bottom: 0;
		}
		>.line{
			${theme.centerX}
			margin-top: 123px;
			>.segment{
				height: 3px;
				width: 200px;
				background-color: orange;
				border: none;
			}
			>.mid{
				width: 165px;
			}
		}
	}
}`);