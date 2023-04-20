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
					Now let's talk about the non-technical side. While developing the project I was working with a highschool computer science teacher. The plan was to use the program with his students first, find out what worked and what didn't. Then make tweaks and improvements until it was ready to be rolled out to other classrooms. In theory the plan was good. We scheduled a workshop with one of his classes to test it. Just a short half hour workshop just to get some first impressions with the students. I was asked to lead the workshop, which I was happy to do.
				</p>
				<p>
					The day came and the workshop started. It was an online meeting with a class of about 30 students. It was during a spare period and the kids were told that they could participate in the workshop or use it as free time. The workshop started off pretty well. The first 5 minutes I had the students join the game directly as human players to get a feel for the game and its rules. Then I switched to demonstrating how to make a bot. Immediately the participation dropped from around 30 students to only 2 or 3.
				</p>
				<p>
					I could see a wall of names on my screen representing students I had never met or seen. Every student had their camera off and mic muted. I tried my best to engage this wall, to understand it. But it just stared blankly back at me giving no further information. After the workshop ended I was told that the vast majority of the class had completely tuned out the minute I mentioned code, using the remainder of the workshop as personal free time. There was some discussion after that about trying again with a different class or a different format but at that point the teacher I was working with had largely lost interest in the project.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Lessons Learned</h2>
				<p>
					I've done a lot of thinking on what I could have done better on this project to have gotten a different outcome. The code was sound but there are definitely non-technical areas where I could have improved on.
				</p>
				<h3>Asking Too Little</h3>
				<p>
					This I believe was the most major issue. I was working with a computer science teacher on this project but I asked very little from him. I basically sat down and built the entire project myself, handing him the finished result. You would normally think of that as a positive, but in this case it ultimately led to the failure of the project. Because I hadn't asked much from him he didn't feel he had any stake in the project and was thus apathetic to its success.
				</p>
				<p>
					I should have done more to involve him in the project and asked him to invest more effort into helping, regardless of if I needed the help. 
				</p>
				<h3>Single Point of Failure</h3>
				<p>
					The next mistake I made was only working with a single teacher on the project. I should have reached out more and been collaborating with as many other people as possible. The internet allows you to get in contact with anyone anywhere. I instead decided to start the project small and grow later.
				</p>
				<p>
					I should have done more to extend my reach and network as early as possible.
				</p>
				<h3>Know Your Target</h3>
				<p>
					While building this project I failed to correctly identify who I was building it for. I assumed I was building it for the students and so I focused my efforts into making it easy and fun for the students. Turns out the target I should have been building it for was the teachers. Ultimately it's up to the teacher to decide which tools they want to use in their classroom and they will choose to use the tools which make their lives easiest. I had built something which was intended to spark students' interest in programming. That goal might be valuable to a student, but much less so for the teacher.
				</p>
				<p>
					I should have had a greater focus on adding features for the teachers.
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