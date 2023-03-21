class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Explanation</h2>
				${new ImageDisplay("img/leviathan.jpg")}
				<p>
					This is a piece of fanart I did for the game <a href="http://rainworldgame.com/">Rain World</a>. In the game you play as a small "slug cat" creature trying to survive near the bottom of the foodchain. In the game you encounter a massive creature known as the leviathan which is a strange combination between creature and machine. I did this piece based off the leviathan from the game.
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

let title=bind("Leviathan");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});