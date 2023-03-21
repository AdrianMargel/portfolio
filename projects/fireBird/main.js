class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Explanation</h2>
				${new ImageDisplay("img/firebird.jpg")}
				<p>
					I got the idea to do a bird in the style of fire from the mythical phoenix bird. I used an image of a parrot for the reference thus the strong parrot-like qualities.
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

let title=bind("Fire Bird");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});