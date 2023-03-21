class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/tetris-multiplayer">Github</a></p>
				${new ImageDisplay("img/tetris2.png")}
				<p>
					This program is a recreation of the game <a href="https://en.wikipedia.org/wiki/Tetris">Tetris</a> with local CO-OP multiplayer and AI. The AI I created for this game is a type of heuristic AI. Provided there is enough space the AIs are able to play almost indefinitely.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					Back in highschool I decided to recreate my own version of Tetris. After finishing the program I decided to spice it up a bit by adding the ability to have a second player on the same screen. I started playing this two player Tetris with some of my classmates and we had a lot of fun with it. Well, I already had the code for two players so why stop there? I then added support for any number of players. Unfortunately my supply of friends was not as infinite as the player count. So I decided to program in an AI to take the place of my friends. It turned out that the AI was much better at playing than my friends and soon enough I had the AIs playing better than even I could.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>The AI</h2>
				<p>
					The AI is a classic <a href="https://en.wikipedia.org/wiki/Heuristic_(computer_science)">heuristic</a> based AI. It works by figuring out a possible set of moves that it can make and then simulating each one. Then using a set of heuristics it assigns a score to the each move. It will then make the move that gives the highest heuristic score. To allow bots to play together I also put in a bit of logic that causes each AI to test if another AI's piece exists underneath its own piece. If there is, it will slow fall to avoid accidentally stealing spaces that another AI is trying to use. This is not a perfect solution to multiplayer AI - especially since there is no real communication between the AIs. It still works surprisingly well though, plus it allows for human players to play along side the AI.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p>
					The AIs are able to work together to play almost indefinitely. The scoring as displayed at the top of the screen is the number of rows cleared. Provided there is enough space for the bots they can easily reach 10,000 rows cleared in a single game. I've only let it get over a score of a few thousand a few time because of the amount of time it takes. Below are some screenshots of the bots playing.
				</p>
				<h3>Animation</h3>
				${new VideoDisplay("video/tetris.mp4")}
				<h3>Images</h3>
				${new ImageDisplay("img/tetris10b.png")}
				${new ImageDisplay("img/tetris_bots.png")}
				${new ImageDisplay("img/tetris_bots_2.png")}
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

let title=bind("Tetris AI");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});