class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Explanation</h2>
				${new ImageDisplay("img/churchflag_small.png")}
				<p>
					I was volunteering at <a href="https://www.bethelchurch.com/">Bethel Church</a> to help with Vacation Bible School (VBS) over the summer. I was telling a few of the kids about <a href="https://www.sealandgov.org/">Sealand</a> - a small (maybe) country with a population of 27 people. A few of the kids argued that "you can't just make a country with 27 people!" In response to this I told them if they could bring my 27 signatures I would prove them wrong and declare the church a sovereign nation. It took them a little over an hour to bring me 28 signatures. Looks like we were going to be a nation.
				</p>
				<p>
					When I got home I quickly designed this flag and proceded to print out and build 40 tiny flags for the kids. The next day when I handed them out the kids were very excited about it. I also ended up making a huge flag that was a few feet across unfortunately I wasn't allowed to give it to the kids as it would "be an unwanted distraction." Oh well. In any case below is an image of around half of the flags I ended up making.
				</p>
				${new ImageDisplay("img/flags.jpg")}
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

let title=bind("Bethel Flag");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});