class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/username-generator">Github</a></p>
				<p>
					This is a super simple user name generator I did very shortly after learning the basics of programming. It works by randomly combining two lists of words into a single user name. Despite being so simple it is actually able to generate decent results. In fact I've even come across a few users on the internet that had usernames matching ones I had already seen from this program.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p>
					A few sample user names from the generator:
				</p>
				<ul>
					<li>Deadly Goat</li>
					<li>Fire Meteor</li>
					<li>Raw Unicorn</li>
					<li>Spear Llama</li>
					<li>Lightning Iron</li>
					<li>Space Dust</li>
					<li>Hot Tower</li>
					<li>Rushing Spider</li>
					<li>Imaginary Manta</li>
					<li>Ninja Mole</li>
					<li>Bent Viper</li>
					<li>Crystal Fall</li>
					<li>Lame Iron</li>
					<li>Great Leaves</li>
					<li>Silver Bear</li>
					<li>Hot Planet</li>
					<li>Oil Cobra</li>
					<li>Electric Wizzard</li>
					<li>Glowing Jumper</li>
					<li>Bent Stone</li>
					<li>Black Tiger</li>
					<li>Starlit Lemon</li>
					<li>World Cutter</li>
					<li>Mother Light</li>
					<li>First Kitten</li>
					<li>Volcanic Fall</li>
					<li>Shadow Forest</li>
					<li>Open Peasant</li>
					<li>Hyper Dagger</li>
					<li>Shattered Submarine</li>
					<li>Cake Turbine</li>
					<li>Shining Iron</li>
					<li>Shadow Bones</li>
					<li>Baby Tree</li>
					<li>ClockWork Gun</li>
					<li>World Goat</li>
					<li>Flesh Kitten</li>
					<li>Shining Tiger</li>
					<li>Cracked Master</li>
					<li>Ice Jumper</li>
					<li>Rich Bear</li>
					<li>Papa Island</li>
					<li>Rotting Tree</li>
					<li>Night Wolf</li>
					<li>Blazing Tiger</li>
					<li>Ninja Llama</li>
					<li>Glowing Unicorn</li>
					<li>Lame Bear</li>
					<li>Screaming Sword</li>
					<li>Dead Mole</li>
				</ul>
			`,"lg")}
			<p class="center">${new ButtonLink("back to top",()=>scrollToTop())}</p>
		`);
	}
}
defineElm(ProjectPage,scss`&{
	width: 100%;
	ul{
		padding-left:40px;
		li{
			margin: 10px 0;
			${theme.font.sizeStep(-.5)};
		}
	}
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

let title=bind("Username Generator");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});