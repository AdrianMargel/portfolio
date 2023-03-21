class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Explanation</h2>
				${new ImageDisplay("img/bryanQuote.png")}
				<p>
					I originally did visually enhanced quotes in my highschool graphic arts class. After graduating I was reading through grad quotes. I especially liked this quote by my friend Bryan and so I decided to make it into a visually enhanced quote. Below are the two quotes I did for school.
				</p>
				${new ImageDisplay("img/poster1.png")}
				${new ImageDisplay("img/poster2.png")}
			`,"lg",false,true)}
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

let title=bind("Enhanced Quotes");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});