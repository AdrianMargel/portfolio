class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Explanation</h2>
				${new ImageDisplay("img/CCA_logo.png")}
				<p>
					I was doing some volunteer work for <a href="https://cornerstonekingman.ca/">Cornerstone Christian Academy</a>, a small rural school in Kingman Alberta. Their logo was not very well done having a number of major flaws from a graphic design perspective. I offered to redo their logo for them. I did a number of different designs and presented them. The vote was unanimous to adopt one of the new logos I had proposed. The logo shown above is the final logo they chose to adopt. Below is the old logo they had before.
				</p>
				${new ImageDisplay("img/CCA_logo_old.png")}
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

let title=bind("Cornerstone Logo");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});