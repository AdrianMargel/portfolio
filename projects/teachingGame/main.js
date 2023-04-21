class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/cimexis.io">Github</a></p>
				${new ImageDisplay("img/game-5.png")}
				<p>
					This was a startup I did during the 2020 pandemic. At the time highschools were in the process of shifting to online learning. I created this program as a way to help with that shift. 
				</p>
				<p>
					The idea was to create a multiplayer browser game where students could compete with each other by programming bots that would compete live. You could join the game as either a bot or a human, allowing students the chance to play the game directly in order to come up with strategies and experiment.  
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					The inspiration for this game came from a few different places. Firstly, I knew many teachers were struggling with the shift to online learning and I wanted to use my skills as a programmer to expand the array of tools teachers had available during this time. Secondly, I was inspired by a genre of online multiplayer games known as ".io games" which were incredibly popular at the time, primarily <a href="https://diep.io/">diep.io</a>. Finally, it was in part the idea of my highschool computer science teacher. During my time as a student he often talked about a project he did in university where each student programmed a bot and then they were all put together in an arena to fight it out. I wanted to create something similar.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p>
					The technical side of the game was incredibly successful. I was able to create a realtime multiplayer game which could handle up to 200 concurrent players per server. It had a simple API for creating bots and all actions had simple wrappers. For example, to run towards the nearest player you could add the following line: <code>runAt( getClosest( getPlayerList() ) )</code>.
				</p>
				<p>
					The game used WebSockets to create a direct connection to the server. All data was then encoded into a stream of bytes allowing for incredibly efficient client-server communication. The server only simulated the game at 10 frames per second with the client smoothly interpolating animations between each frame. The result being a smooth game that runs at 60fps but only requires 1/6th of the bandwidth and computational power. This takes advantage of the fact that human visual response time maxes out at 1/10th of a second. Furthermore, the server would send only what was in visual range of each player to avoid sending updates on any object which was not critical for that player to know about.
				</p>
				<p>
					Actual deployment in a classroom setting did not get beyond the initial testing phase. It turned out that highschool students working from home had little motivation to learn new material without direct supervision, and due to pandemic restrictions on site testing was not an option.  By the time the pandemic restrictions were lifted the instructor had largely lost interest in the project and I had other demands upon my time.
				</p>
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
	code{
		background-color: ${theme.color.inputStep(-2)};
		color: ${theme.color.inputStep(10)};
		padding: 2px 10px;
		border-radius: 8px;
	}
}`);

let title=bind("AI Education Game");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});