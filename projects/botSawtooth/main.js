class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				${new ImageDisplay("img/setup.png")}
				<p>
					Sawtooth is the name of an AI I created for the <a href="https://terminal.c1games.com/">Terminal games</a> - an international artificial intelligence competition by <a href="https://www.correlation-one.com/">Correlation One</a>. My AI was able to quickly climb to the top of the leaderboards against over 30,000 AI's submitted by over 10,000 players. I later made a few small upgrades to Sawtooth releasing a SawtoothV2. Beyond just reaching the top of the leaderboards Sawtooth also won the Terminal CodeBullet competition against over 600 submitted AI's. In the image above the blue side showcases Sawtooth's design.
				</p>
				<p>
					The design of my AI proved so effective that it became widely copied by nearly all the top players on the leaderboard to the point where the developers behind the competition ended up rebalancing the competition rules to discourage use of my strategy.
				</p>
				<p>
					Below is a screenshot I took shortly after SawtoothV2 was able to overtake the previously highest rated algorithm on the leaderboards.
				</p>
				${new ImageDisplay("img/first.png")}
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

let title=bind("Sawtooth AI");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});