class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/fancy-circles">Github</a></p>
				${new ImageDisplay("img/fancy_circles.png")}
				<p>
					This program creates interesting circle patterns. It works by generating patterns of circles and lines randomly according to predefined rules. Overall it is a relatively simple program with relatively simple rules but the results tend to be aesthetically pleasing.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					This was inspired by the <a href="https://i.imgur.com/uyXUmTj.png">Nothing But Requiem logo</a> as well as <a href="https://adrianmargel.ca/projects/alchemyCircles">Alchemy Circles</a> I had worked on prior to this project. I wanted to try to get a little bit of practice with procedural generation as well as test if I could use procedural generation for graphic design.
				</p>
			`,"lg")}
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

let title=bind("Celestial Circles");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});