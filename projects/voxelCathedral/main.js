class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Explanation</h2>
				${new ImageDisplay("img/cathedral5.png")}
				<p>
					This is a large cathedral I built in Minecraft. It is loosely based off the Cologne Cathedral in Germany. In some of the below images you can see a nearby minecraft village to give a sense of scale for how large this thing really is. I wasn't sure how it would turn out since gothic cathedrals are so incredibly detailed and I wasn't sure if that could be captured in voxels but it turned out surprisingly well!
				</p>
				<p>
					I also did the interior as well but unfortunately due to Minecraft's limited lighting I couldn't take any really nice pictures of it. The main problem is that a cathedral's main lighting comes from the large windows on each side. However Minecraft calculates ambient light with a lightsource directly overhead. This means that none of the light makes it through the windows. Even with shaders that correct shadows the ambient lighting stays the same - very dark.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>More Pictures</h2>
				${new ImageDisplay("img/cathedral1.png")}
				${new ImageDisplay("img/cathedral2.png")}
				${new ImageDisplay("img/cathedral3.png")}
				${new ImageDisplay("img/cathedral4.png")}
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

let title=bind("Voxel Cathedral");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});