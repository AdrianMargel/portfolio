class TextureManager{
	constructor(){
		this.reuse={};
		this.textures={};
		this.loadCount=0;
	}
	init(canvas,channels=1){
		this.loadCanvasTexture("canvas",{
			src: canvas,
			minMag: gl.NEAREST,
			wrap: gl.CLAMP_TO_EDGE
		});
		let currSize=[gl.canvas.width,gl.canvas.height];
		for(let i=0;i<channels;i++){
			this.textures[`lenia${i}PingTex`]=toTexture({
				width:currSize[0],
				height:currSize[1],
				minMag: gl.NEAREST,
				wrap: gl.REPEAT,
				internalFormat: gl.RGBA32F,
			});
			this.textures[`lenia${i}PongTex`]=toTexture({
				width:currSize[0],
				height:currSize[1],
				minMag: gl.NEAREST,
				wrap: gl.REPEAT,
				internalFormat: gl.RGBA32F,
			});
			this.textures[`lenia${i}Ping`]=false;
		}
		this.textures[`dnaMETAPingTex`]=toTexture({
			width:currSize[0],
			height:currSize[1],
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});
		this.textures[`dnaMETAPongTex`]=toTexture({
			width:currSize[0],
			height:currSize[1],
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});
		this.textures[`dnaPingMETA`]=false;
		for(let i=0;i<channels;i++){
			for(let j=0;j<channels;j++){
				this.textures[`dna${i}${j}PingTex`]=toTexture({
					width:currSize[0],
					height:currSize[1],
					minMag: gl.NEAREST,
					wrap: gl.REPEAT,
					internalFormat: gl.RGBA32UI,
				});
				this.textures[`dna${i}${j}PongTex`]=toTexture({
					width:currSize[0],
					height:currSize[1],
					minMag: gl.NEAREST,
					wrap: gl.REPEAT,
					internalFormat: gl.RGBA32UI,
				});
				this.textures[`dna${i}${j}Ping`]=false;
			}
		}
		this.textures.leniaBox={
			width:currSize[0],
			height:currSize[1],
		}

		// this.reuse.outputArr=new Uint32Array(currSize[0]*currSize[1]*4);
	}
	pingPong(name,flip=false){
		if(flip){
			this.textures[`${name}Ping`]=!this.textures[`${name}Ping`];
		}
		let pp=this.textures[`${name}Ping`];
		return pp?this.textures[`${name}PingTex`]:this.textures[`${name}PongTex`];
	}
	run(canvas,channels){
		let prevSize=[gl.canvas.width,gl.canvas.height];
		twgl.resizeCanvasToDisplaySize(gl.canvas,1);
		gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
		let currSize=[gl.canvas.width,gl.canvas.height];

		if(prevSize[0]!=currSize[0]||prevSize[1]!=currSize[1]){
			for(let i=0;i<channels;i++){
				twgl.resizeTexture(gl,this.textures[`lenia${i}PingTex`],{
					width:currSize[0],
					height:currSize[1],
					internalFormat: gl.RGBA32F,
				});
				twgl.resizeTexture(gl,this.textures[`lenia${i}PongTex`],{
					width:currSize[0],
					height:currSize[1],
					internalFormat: gl.RGBA32F,
				});
			}
			twgl.resizeTexture(gl,this.textures[`dnaMETAPingTex`],{
				width:currSize[0],
				height:currSize[1],
				internalFormat: gl.RGBA32F,
			});
			twgl.resizeTexture(gl,this.textures[`dnaMETAPongTex`],{
				width:currSize[0],
				height:currSize[1],
				internalFormat: gl.RGBA32F,
			});
			for(let i=0;i<channels;i++){
				for(let j=0;j<channels;j++){
					twgl.resizeTexture(gl,this.textures[`dna${i}${j}PingTex`],{
						width:currSize[0],
						height:currSize[1],
						internalFormat: gl.RGBA32UI,
					});
					twgl.resizeTexture(gl,this.textures[`dna${i}${j}PongTex`],{
						width:currSize[0],
						height:currSize[1],
						internalFormat: gl.RGBA32UI,
					});
				}
			}
			this.textures.leniaBox={
				width:currSize[0],
				height:currSize[1],
			}

			// this.reuse.outputArr=new Uint32Array(currSize[0]*currSize[1]*4);
		}

		this.updateCanvasTexture("canvas",canvas);
	}
	loadImageTexture(name,settings){
		this.loadCount++;
		this.textures[name+"Tex"]=toTexture(settings,(_,__,img)=>{
			this.textures[name+"Box"]={
				width:img.width,
				height:img.height
			};
			this.loadCount--;
			if(this.loadCount==0){
				completeShaderLoad();
			}
		});
	}
	loadCanvasTexture(name,settings){
		this.textures[name+"Tex"]=toTexture(settings);
	}
	updateCanvasTexture(name,canvas){
		let tex=this.textures[name+"Tex"];
		updateCanvasTexture(tex,canvas);
	}
	updateArrayTexture(name,boxedArr,internalFormat,reuseArrayType=null){
		let box;
		let tex;
		if(this.textures[name+"Tex"]!=null){
			box=boxedArr;
			tex=this.textures[name+"Tex"];

			let arr;
			if(reuseArrayType==null){
				arr=boxedArr.arr;
			}else{
				arr=this.reuse[name+"Arr"];
				arr.set(box.arr);
			}

			updateTexture(tex,arr,{
				width: box.width,
				height: box.height,
				minMag: gl.NEAREST,
				internalFormat,
			});

			this.textures[name+"Box"]=box;
		}else{
			box=boxedArr;

			let arr=reuseArrayType==null?boxedArr.arr:(this.reuse[name+"Arr"]=new reuseArrayType(box.arr));

			tex=toTexture({
				src: arr,
				width: box.width,
				height: box.height,
				minMag: gl.NEAREST,
				internalFormat,
			});

			this.textures[name+"Box"]=box;
			this.textures[name+"Tex"]=tex;
		}
	}
	isLoaded(){
		return this.loadCount==0;
	}
}