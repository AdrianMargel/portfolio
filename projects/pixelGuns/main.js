class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Explanation</h2>
				${new ImageDisplay("img/open_gun_sprites_l.png")}
				<p>
					A set of guns I did to practice pixel art and also to use for future projects. Some of the guns are based off real weapons and others are obviously completely fictional.
				</p>
			`,"lg",false,true)}
		`);
	}
}
defineElm(ProjectPage,scss`&{
	width: 100%;
	>.gap{
		height: 40px;
	}
	p.center{
		${theme.centerText}
	}
	.bold{
		font-weight: 700;
	}
	.projectLink{
		a{
			padding: 5px 10px;
			background-color: ${theme.color.greyStep(-2)};
			border-radius: 50px;
		}
	}
}`);

let title=bind("Pixel Art Guns");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});