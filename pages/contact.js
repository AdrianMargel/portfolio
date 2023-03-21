class ContactPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Contact</h2>
				<p class="center">Questions, comments, job opportunities, something else? Feel free to reach out to me.</p>
				${new Email("adrianjmargel","gmail","com")}
				<p class="center bold">Github: <a href="https://github.com/AdrianMargel">AdrianMargel</a></p>
			`,"sm",false,true)}
		`);
	}
}
defineElm(ContactPage,scss`&{
	width: 100%;
	>.gap{
		height: 40px;
	}
	p.center{
		text-align: center;
	}
	p.bold{
		font-weight: 700;
	}
}`);

