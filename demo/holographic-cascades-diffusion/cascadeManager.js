class CascadeManager{
	constructor(cascadeNumMax){
		// General
		this.copyShader=new CopyShader();
		this.clearShader=new ClearShader();
		// Init
		this.initShader=new InitShader();
		this.inputMergeShader=new InputMergeShader();
		// Merge up
		this.blockMatrixMergeShader=new BlockMatrixMergeShader();
		this.nodePrimerShader=new NodePrimerShader();
		this.nodeEliminationShader=new NodeEliminationShader();
		this.cascadeMatrixSaveShader=new CascadeMatrixSaveShader();
		// Merge down
		this.valuePropagationShader=new ValuePropagationShader();
		this.valueSaveShader=new ValueSaveShader();
		// Render
		this.renderShader=new RenderShader();
		// this.jacobiErrorShader=new JacobiErrorShader();

		this.cascadeNumMax=cascadeNumMax;
		this.cascadeIterations=this.cascadeNumMax*2+1;
		this.channelCount=3;
		this.boundarySize=Vec(pow(2,this.cascadeNumMax)+1,pow(2,this.cascadeNumMax)+1).scl(1);

		let largestBlkMtxCount;
		{ //wrap in a code block to avoid polluting the parent scope
			let lvlH=pow(2,this.cascadeNumMax);
			let lvlW=lvlH;

			let edgeCount=4;
			let blkMtxW=edgeCount;
			let blkMtxH=edgeCount+this.channelCount;

			//TODO: for channel counts less than 3 the largest cascade isn't always the smallest one
			largestBlkMtxCount=lvlH*lvlW*blkMtxW*blkMtxH;
		}
		this.blockMatrixTexPP=new TexturePingPong({
			...sizeObj(boxSize(largestBlkMtxCount)),
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.R32F,
		});

		this.cascadeMatrixTexs=Array(this.cascadeIterations).fill().map((_,c)=>{
			let cascadeNum=flr(c/2);
			let isHalf=c%2==1;

			let lvlH=pow(2,this.cascadeNumMax-cascadeNum);
			let lvlW=lvlH/(isHalf?2:1);
			
			let scaleBase=pow(2,cascadeNum);
			let blkH=scaleBase+1;
			let blkW=scaleBase*(isHalf?2:1)+1;
			
			let edgeCount=2*(blkW-1+blkH-1);
			let midCount=blkH-2;
			let cscMtxW=midCount;
			let cscMtxH=edgeCount+this.channelCount;

			// console.log(cascadeNum,isHalf,lvlH*lvlW*(edgeCount+midCount)*(edgeCount+midCount+this.channelCount));//TODO
			
			let cscMtxCount=lvlH*lvlW*cscMtxW*cscMtxH;
			// console.log(c,isHalf,lvlH,lvlW,cscMtxW,cscMtxH)
			return cscMtxCount==0?null:new Texture({
				...sizeObj(boxSize(cscMtxCount)),
				minMag: gl.NEAREST,
				wrap: gl.REPEAT,
				internalFormat: gl.R32F,
			})
		});

		this.primeMatrixTexs=Array(this.cascadeIterations).fill().map((_,c)=>{
			let cascadeNum=flr(c/2);
			let isHalf=c%2==1;

			let lvlH=pow(2,this.cascadeNumMax-cascadeNum);
			let lvlW=lvlH/(isHalf?2:1);
			
			let scaleBase=pow(2,cascadeNum);
			let blkH=scaleBase+1;
			let blkW=scaleBase*(isHalf?2:1)+1;
			
			let edgeCount=2*(blkW-1+blkH-1);
			let midCount=blkH-2;
			let prmMtxW=min(midCount,1);
			let prmMtxH=edgeCount+midCount+this.channelCount;
			
			let prmMtxCount=lvlH*lvlW*prmMtxW*prmMtxH;
			return prmMtxCount==0?null:new Texture({
				...sizeObj(boxSize(prmMtxCount)),
				minMag: gl.NEAREST,
				wrap: gl.REPEAT,
				internalFormat: gl.R32F,
			})
		});

		this.valueTexPP=new TexturePingPong({
			width: this.boundarySize.x,
			height: this.boundarySize.y,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.R32F,
		});

		// this.errorTex=new Texture({
		// 	width: this.boundarySize.x,
		// 	height: this.boundarySize.y,
		// 	minMag: gl.NEAREST,
		// 	wrap: gl.REPEAT,
		// 	internalFormat: gl.R32F,
		// });
		this.inputTexPP=new TexturePingPong({
			width: this.boundarySize.x,
			height: this.boundarySize.y,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});
		this.outputTexPP=new TexturePingPong({
			width: this.boundarySize.x,
			height: this.boundarySize.y,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});
	}
	run(shaderManager,canvasTex,sceneTex,barrierTex){
		shaderManager.resizeToDisplay();

		// Init
		this.clearShader.run(this.inputTexPP);
		this.inputMergeShader.run(canvasTex,sceneTex,barrierTex,this.inputTexPP);
		this.initShader.run(this.cascadeNumMax,this.channelCount,this.inputTexPP,this.blockMatrixTexPP);

		//TODO: cascade sizes don't perfectly match the texture sizes, we could speed this up a little by avoiding rendering those extra pixels

		// console.time('run');

		// Merge up
		for(let c=1;c<this.cascadeIterations;c++){
			let cascadeNum=flr(c/2);
			let isHalf=c%2==1;
			this.blockMatrixMergeShader.run(cascadeNum,isHalf,this.cascadeNumMax,this.channelCount,this.blockMatrixTexPP);
			
			if(this.cascadeMatrixTexs[c]!=null){
				let scaleBase=pow(2,cascadeNum);
				let blkH=scaleBase+1;
				let middleNodeCount=blkH-2;
				for(let i=0;i<middleNodeCount;i++){
					this.nodePrimerShader.run(i,cascadeNum,isHalf,this.cascadeNumMax,this.channelCount,this.blockMatrixTexPP,this.primeMatrixTexs[c])
					this.nodeEliminationShader.run(i,cascadeNum,isHalf,this.cascadeNumMax,this.channelCount,this.blockMatrixTexPP,this.primeMatrixTexs[c]);
					// console.log(c,this.primeMatrixTexs[c].read(1,gl.RED,gl.FLOAT,Float32Array));
					// console.log(c,this.blockMatrixTexPP.read(1,gl.RED,gl.FLOAT,Float32Array));
				}

				this.cascadeMatrixSaveShader.run(cascadeNum,isHalf,this.cascadeNumMax,this.channelCount,this.blockMatrixTexPP,this.cascadeMatrixTexs[c]);
				// console.log(this.cascadeMatrixTexs[c].read(1,gl.RED,gl.FLOAT,Float32Array));
				// console.log(this.blockMatrixTexPP.read(1,gl.RED,gl.FLOAT,Float32Array));
			}
		}

		// Merge down
		this.clearShader.run(this.outputTexPP);
		for(let channel=0;channel<this.channelCount;channel++){
			this.clearShader.run(this.valueTexPP);
			this.clearShader.run(this.valueTexPP.flip());
			for(let c=this.cascadeIterations-1;c>=0;c--){
				let cascadeNum=flr(c/2);
				let isHalf=c%2==1;
				if(this.cascadeMatrixTexs[c]!=null){
					this.valuePropagationShader.run(channel,cascadeNum,isHalf,this.cascadeNumMax,this.channelCount,this.cascadeMatrixTexs[c],this.valueTexPP);
					//copy the ping pong texture onto itself
					//this has to be done since the valuePropagationShader doesn't update every pixel
					this.copyShader.run(this.valueTexPP);
				}
			}
			// this.jacobiErrorShader.run(this.valueTexPP,this.errorTex);
			this.valueSaveShader.run(channel,this.cascadeNumMax,this.channelCount,this.valueTexPP,this.outputTexPP);
		}
		
		// console.timeEnd('run');

		// Render
		this.renderShader.run(this.inputTexPP,this.outputTexPP);
	}
}