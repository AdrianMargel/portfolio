class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/ai-2048">Github</a></p>
				${new ImageDisplay("img/2048_5x7_2.png")}
				<p>
					This program is a recreation of the game <a href="https://en.wikipedia.org/wiki/2048_(video_game)">2048</a> with a custom AI programmed to play the game. The game has also been modified to allow for any size of rectangular board. The AI is a combination of a monte carlo and heuristic AI. The AI is consistently able to reach the 2048 tile thus "winning" the game.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					This was inspired by an <a href="https://adrianmargel.ca/projects/botTetris">earlier project</a> I did involving a Tetris AI. I wanted to try to apply some of the same logic I used for making the Tetris AI towards solving 2048. Unfortunately this did not work nearly as well as I had hoped for and so I decided I needed a new approach. I was inspired by an AI I found online for 2048 created by Ronen Zilberman <a href="https://ronzil.github.io/2048-AI/">here</a>. Not wanting to just make a straight recreation of his work I decided to try something new and see if I could create a new type of hybrid AI.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Animation</h2>
				${new VideoDisplay("video/bot2048.mp4")}
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>The AI</h2>
				<p>
					The AI is an interesting hybrid between a <a href="https://en.wikipedia.org/wiki/Monte_Carlo_tree_search">Monte Carlo tree search</a> and a <a href="https://en.wikipedia.org/wiki/Heuristic_(computer_science)">heuristic</a> AI. Monte Carlo based AI are extremely good at getting out of difficult situations in the short term but bad at long term planning. Heuristic based AI is the opposite being really good at long term strategy but really bad at getting out of sticky situations. I came up with a hybrid AI which is able to get the best of both worlds by cleverly combining these two different types of AI.
				</p>
				<h3>Monte Carlo AI</h3>
				<p>
					Monte Carlo based AI work by randomly simulating different possible outcomes that are likely to result from a given move and then comparing the averages for each move to make a guess which move is the best move. The AI has no idea why a move is better or worse, all it sees is that making a certain move is likely to end badly for it. Unfortunately the further in the future the AI looks the less accurately it is able to predict the outcomes without exponentially more computational power. Thus it can know the best possible move to make within the next few turns but it is impossible for it to guess what will happen beyond the few turns it is able to see in the future.
				</p>
				<h3>Heuristic AI</h3>
				<p>
					Heuristic based AI work by following sets of rules that are preprogrammed. Generally a heuristic AI will have a set of rules for how to score a certain game state and then works by comparing the scores that result from making different moves and picking the move that results in the highest score. This AI only looks at scores which makes it very good at following specific strategies. However when it reaches trouble or situations that it's rules are not able to handle it has no way to adapt to the situation and will almost always fail.
				</p>
				<h3>My Hybrid AI</h3>
				<p>
					The AI I came up with uses a set of "subBots" which are basically greedy heuristic AIs that will follow their heuristics with no consideration for the future. The AI runs hundreds of simulations with these subBots and then scores the final game state each one ends on. It then will use this information to predict which move will result in the highest long term heuristic score. By using the idea of running many simulations from Monte Carlo based AI and the idea of having scoring handled by heuristics the hybrid AI is able to be good at both short term and long term planning.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Discoveries</h2>
				<p>
					While creating the AI for this project I came across some interesting problems and interesting behaviours.
				</p>
				<h3>Self-sabotage</h3>
				<p>
					The hybrid AI uses heuristic scoring both in the final evaluation of the subBots and by the subBots themselves while they are making greedy decisions. I discovered that both places where heuristic scoring is used must be based off the same heuristics. In fact when the heuristics are not the same it often leads to the AI making purposely bad moves to sabotage itself. This happens because there is an internal conflict within the AI and thus it can occasionally enter a weird kind of competition with itself. This has some very interesting implications towards the nature of self-sabotage which may apply to more than just AI.
				</p>
				<h3>Variable Foresight</h3>
				<p>
					The more moves that the AI is allowed to look into the future the better it is able to play but the slower it will run as it must run more possible simulations. Early on in the game it is not very difficult and thus moves do not need to be thought through as much. By varying the foresight overtime to allow the bot to see further into the future the further into the game the AI gets the start of the game can be spend up significantly with very little effect on the final score the AI is able to reach.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p>
					Below are a few examples of different games being played by the AI on different board sizes.
				</p>
				${new ImageDisplay("img/2048_4x4_2.png")}
				${new ImageDisplay("img/2048_5x6.png")}
				${new ImageDisplay("img/2048_20x20.png")}
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

let title=bind("2048 AI");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});