class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/explode-trees">Github</a></p>
				${new ImageDisplay("img/tree2.png")}
				<p>
					This program procedurally generates simple trees and then "explodes" them. This was one of the first things I ever programmed, I had just learned the basics of programming and wanted to try something new. I had come across procedural generation on the internet and wanted to try to make my own procedural generator for trees. While tweaking the algorithm I accidently created a bug which caused the trees to "explode." The way they exploded was pretty entertaining to watch and so what started out as a bug very quickly became an accidental feature.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					I got the idea to try to procedurally generate trees from seeing tree fractals people had done on the internet. I also had done a bit of reading on the basics of procedural generation and was interested to try using it for something.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p>
					Below are a few screenshots from the program.
				</p>
				${new ImageDisplay("img/tree3.png")}
				${new ImageDisplay("img/tree1.png")}
				${new ImageDisplay("img/tree4.png")}
				${new ImageDisplay("img/tree5.png")}
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

let title=bind("Exploding Trees");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});