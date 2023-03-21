class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Explanation</h2>
				${new ImageDisplay("img/lettertransforms.png")}
				<p>
					This was a highschool graphic arts project. The goal was to take letters from the alphabet and using the same lines create new symbols with each letter and arrange them into a pattern. Some of the letters are colored to spell out my own name - "Adrian Margel."
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

let title=bind("Pattern Letters");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});