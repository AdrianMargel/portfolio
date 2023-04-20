class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/ultimate-tic-tac-toe">Github</a></p>
				<p class="center bold projectLink"><a href="demo" rel="nofollow">Demo</a></p>
				${new ImageDisplay("img/game1.png")}
				<p>
					This is a little game I did to experiment with using WebGL for UI graphics. I wanted to see if it was possible to create stylized pixel graphics directly on the browser canvas. I decided to use the game Ultimate Tic Tac Toe to experiment with this concept. It's a simple game to program but with enough complexity to let me play around with WebGL.
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

let title=bind("Ultimate Tic Tac Toe");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});