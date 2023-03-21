class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/maze-generator">Github</a></p>
				${new ImageDisplay("img/Maze2.png")}
				<p>
					This program is able to generates mazes of any size as well as solve them. It is also able to create interesting rainbow patterns by doing a modified flood fill on the maze where the hue is determined by the distance traveled from the origin point of the flood fill.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p>
					Below are a few examples generated from the program, the first example shows the rainbow flood fill algorithm's results.
				</p>
				${new ImageDisplay("img/Mazecolorful.png")}
				${new ImageDisplay("img/smaze2.png")}
				${new ImageDisplay("img/smaze1.png")}
			`,"lg")}
			<p class="center">${new ButtonLink("back to top",()=>scrollToTop())}</p>
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

let title=bind("Maze Generator");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});