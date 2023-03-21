class MissingPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			<p>
				404 Error - Page Not Found
			</p>
		`);
	}
}
defineElm(MissingPage,scss`&{
	p{
		margin-top:40px;
		${theme.font.sizeStep(1)}
	}
}`);