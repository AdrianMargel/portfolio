class MissingPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			404 Error - Page Not Found
		`);
	}
}
defineElm(MissingPage,scss`&{

}`);