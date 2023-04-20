class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/tetris-pong">Github</a></p>
				<p class="center bold projectLink"><a href="demo" rel="nofollow">Demo</a></p>
				${new ImageDisplay("img/tetris-pong.png")}
				<p>
					This is a silly game I made combining Tetris and Pong. I made this for a friend as a joke one weekend, but it actually turned out pretty nicely.
				</p>
				<p>
					This game is played by two people cooperatively. One player moves the mouse, keeping the ball in the air. The second player uses the keyboard to control the tetris pieces as they fall. The goal is to score as many points as possible without the ball falling out of bounds or the tetris board running out of space.
				</p>
				<p>
					What I love about this game is that both players are forced to cooperate but the chaotic nature of the game often leads to both players accidently sabotaging each other. It's kind of like a 3-legged race, both people need to work together but also get in each others' way.
				</p>
				<h3>Animation</h3>
				${new VideoDisplay("video/recording.mp4")}
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

let title=bind("Tetris Pong");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});