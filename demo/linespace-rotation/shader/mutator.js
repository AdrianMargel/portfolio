class MutationManager{
	constructor(){
		this.mutationShader=new MutationShader();
	}
	run(){
		//decide which genes to mutate
		this.mutationSelectionShader.run();
		//copy genes
		this.listManager.run();
		this.backLinkShader.run();
		//mutate copied genes
		this.mutationShader.run();
		//decide which genes to mutate
		this.mutationSelectionShader.run();
	}
}
