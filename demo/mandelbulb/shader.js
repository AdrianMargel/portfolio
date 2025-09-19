function glsl(strings,...keys){
	return strings[0]+keys.map((k,i)=>k+strings[i+1]).join("");
}

//TODO: check and use
class ArrayBox{
	constructor(arr,opts){
		this.arr=arr;
		this.opts=opts;
		this.height;
		this.width;
		this.padding=0;
		this.update();
	}
	update(){
		let components=this.opts.components??1;
		let length=this.arr.length/components-this.padding;
	
		this.width=this.opts.width??Math.ceil(Math.sqrt(length));
		this.height=Math.ceil(length/this.width); //TODO: support enforced opts height
		let requiredLength=width*height*components;
		
		if(!this.arr instanceof ArrayBuffer){
			let paddingDelta=requiredLength-this.arr.length;
			//TODO: test this
			if(paddingDelta>0){
				for(let i=0;i<paddingDelta;i++){
					this.arr.push(0);
				}
			}else{
				this.arr.splice(paddingDelta);
			}
			this.padding+=paddingDelta;
		}
	}
}

//TODO: check and use
class DynamicTypedArray{
	constructor(type,components=1,maxItems=MAX_SHADER_ITEMS){
		this.type=type;
		this.itemBytes=this.type.BYTES_PER_ELEMENT;
		this.components=components;
		this.maxItems=maxItems*this.components;

		this.array=new ArrayBuffer(this.maxItems*this.itemBytes);
		this.view=new this.type(this.array);
		this.length=0;
	}
	hasSpace(count){
		return this.length+count<=this.maxItems;
	}
	push(...items){
		if(!this.hasSpace(items.length)){
			return false;
		}
		this.view.set(items,this.length);
		this.length+=items.length;
		return true;
	}
	reset(){
		this.length=0;
	}
	getTypedArray(){
		return new this.type(this.array,0,this.length);
	}
}

class Texture{
	constructor(opts){
		this.opts=opts;
		this.texture;
		this.create();
	}
	create(){
		this.texture=twgl.createTexture(gl,this.opts);
	}
	update(src){//TODO
		let f;
		if(src instanceof Element){
			f=twgl.setTextureFromElement;
		}else if(src instanceof ArrayBuffer){
			f=twgl.setTextureFromArray;
		}else if(src instanceof ArrayBox){
			f=twgl.setTextureFromArray;
			this.resize(src.width,src.height);
		}else{
			throw Error("update src type is not recognized");
		}
		//TODO: check if src needs to be erased from options 
		return f(gl,this.texture,src,this.opts);
	}
	resize(width,height){
		this.opts.width=width;
		this.opts.height=height;
		//TODO: look into better resize method
		twgl.resizeTexture(gl,this.texture,this.opts);
	}
	tex(){
		return this.texture;
	}
	size(){
		//TODO: check what happnes when no direct size set
		return [this.opts.width,this.opts.height];
	}
	sizeObj(){
		//TODO: check what happnes when no direct size set
		return {width:this.opts.width,height:this.opts.height};
	}
}
class TexturePingPong{
	constructor(opts){
		this.opts=opts;
		this.ping=true;
		this.pingTex;
		this.pongTex;
		this.create();
	}
	create(){
		if(Array.isArray(this.opts)){
			this.pingTex=new Texture(this.opts[0]);
			this.pongTex=new Texture(this.opts[1]);
		}else{
			this.pingTex=new Texture(this.opts);
			this.pongTex=new Texture(this.opts);
		}
	}
	forAll(op,args){
		this.pingTex[op](...args);
		this.pongTex[op](...args);
	}
	update(...args){
		this.forAll("update",args);
	}
	resize(...args){
		this.forAll("resize",args);
	}
	flip(){
		this.ping=!this.ping;
	}
	get(flip=false){
		if(flip){
			this.flip();
		}
		return this.ping?this.pingTex:this.pongTex;
	}
	tex(flip=false){
		return this.get(flip).tex();
	}
	size(flip=false){
		return this.get(flip).size();
	}
	sizeObj(flip=false){
		return this.get(flip).sizeObj();
	}
}

class Buffer{
	constructor(opts,name="buff"){
		this.opts=opts;
		this.name=name;
		this.buffer;
		this.create();
	}
	create(){
		this.buffer=twgl.createBufferInfoFromArrays(gl,{
			[this.name]:this.opts
		});
	}
	update(src){
		if(this.name=="indices"){
			//TODO: test and allow this to take in any array
			this.setIndicesBufferFromTypedArray(gl,this.buffer[this.name],src);
			this.bufferInfo.numElements=arrays[k].data.length;
		}else{
			twgl.setAttribInfoBufferFromArray(gl,this.buffer.attribs[this.name],src);
		}
	}
	setIndicesBufferFromTypedArray(gl,buffer,array,drawType) {
		const ELEMENT_ARRAY_BUFFER=0x8893;
		const STATIC_DRAW=0x88e4;
		gl.bindBuffer(ELEMENT_ARRAY_BUFFER, buffer);
		gl.bufferData(ELEMENT_ARRAY_BUFFER, array, drawType || STATIC_DRAW);
	}
	buff(){
		return this.buffer.attribs[this.name];
	}
}
class BufferPingPong{
	constructor(opts){
		this.opts=opts;
		this.ping=true;
		this.pingBuff;
		this.pongBuff;
		this.create();
	}
	create(){
		if(Array.isArray(this.opts)){
			this.pingBuff=new Buffer(this.opts[0]);
			this.pongBuff=new Buffer(this.opts[1]);
		}else{
			this.pingBuff=new Buffer(this.opts);
			this.pongBuff=new Buffer(this.opts);
		}
	}
	forAll(op,args){
		this.pingBuff[op](...args);
		this.pongBuff[op](...args);
	}
	update(...args){
		this.forAll("update",args);
	}
	flip(){
		this.ping=!this.ping;
	}
	get(flip=false){
		if(flip){
			this.flip();
		}
		return this.ping?this.pingBuff:this.pongBuff;
	}
	buff(flip=false){
		return this.get(flip).buff();
	}
}

class Shader{
	constructor(vs,fs,tsf=null){
		this.uniforms=null;

		//vs
		this.attributes=null;
		this.vs=vs;
		this.tsf=tsf;
		this.transformFeedbackVaryings=null;
		this.drawType=gl.TRIANGLES;

		//fs
		this.fs=fs;
		this.attachments=null;

		this.init();
	}
	init(){
		if(this.tsf==null){
			this.programInfo=twgl.createProgramInfo(gl,[this.vs,this.fs]);
		}else{
			this.programInfo=twgl.createProgramInfo(gl,[this.vs,this.fs],{
				transformFeedbackVaryings: this.tsf
			});
		}
	}
	run(){
		this.uniformsInfo=this.populateInfo(
			(data)=>data,
			this.uniforms,
			this.uniformsInfo
		);

		this.attributesInfo=this.populateInfo(
			(data)=>
				twgl.createBufferInfoFromArrays(gl,data),
			this.attributes,
			this.attributesInfo
		);

		this.transformFeedbackVaryingsInfo=this.populateInfo(
			(data)=>
				twgl.createBufferInfoFromArrays(gl,data),
			this.transformFeedbackVaryings,
			this.transformFeedbackVaryingsInfo
		);
		this.transformFeedbackInfo=this.populateInfo(
			(data)=>
				//TODO: it may be better to reuse transform feedbacks, if it becomes an issue this can be updated
				twgl.createTransformFeedback(gl,this.programInfo,data),
			this.transformFeedbackVaryingsInfo,
			this.transformFeedbackInfo
		);

		this.attachmentsInfo=this.populateInfo(
			(data)=>data,
			this.attachments,
			this.attachmentsInfo
		);
		this.frameBufferInfo=this.populateInfo(
			(data)=>
				twgl.createFramebufferInfo(gl,data,data[0].width,data[0].height),
			this.attachmentsInfo,
			this.frameBufferInfo
		);

		//setup
		//program
		gl.useProgram(this.programInfo.program);
		//uniforms
		twgl.setUniforms(this.programInfo,this.uniformsInfo);
		//attributes
		twgl.setBuffersAndAttributes(gl,this.programInfo,this.attributesInfo);
		//transform feedback
		if(this.transformFeedbackInfo!=null){
			gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedbackInfo);
			gl.beginTransformFeedback(this.drawType);
		}
		//frame buffer/attachments
		twgl.bindFramebufferInfo(gl,this.frameBufferInfo);

		//draw
		twgl.drawBufferInfo(gl,this.attributesInfo,this.drawType);

		//cleanup
		//frame buffer/attachements
		twgl.bindFramebufferInfo(gl,null);
		// transform feedback
		if(this.transformFeedbackInfo!=null){
			gl.endTransformFeedback();
			gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
		}
		//reset inputs
		this.uniforms=null;
		this.attributes=null;
		this.transformFeedbackVaryings=null;
		this.attachments=null;
	}
	populateInfo(createFunc,data,curr){
		return (data!=null)?createFunc(data):curr;
	}
}
class FragShader extends Shader{
	constructor(fs,tsf){
		super(
			glsl`#version 300 es
				in vec4 position;
				out vec2 coord;
				out vec2 coord2;
				void main(){
					gl_Position=position;
					coord=position.xy;
					coord2=(coord+1.)*.5;
				}
			`,fs,tsf
		);
	}
	init(){
		super.init();
		this.attributes={
			position:new Buffer({
				numComponents:2,
				data:[
					-1, 1,
					1, -1,
					1, 1,
					-1, 1,
					1, -1,
					-1, -1,
				]
			}).buff(),
		};
	}
}

class ShaderManager{
	constructor(){

	}
	hasSize(){
		return gl.canvas.clientWidth>0&&gl.canvas.clientHeight>0
	}
	resizeToDisplay(...textures){
		if(this.hasSize()){
			let wInit=gl.canvas.width;
			let hInit=gl.canvas.height;
			twgl.resizeCanvasToDisplaySize(gl.canvas,1);
			let w=gl.canvas.width;
			let h=gl.canvas.height;
			if(w!=wInit||h!=hInit){
				textures.forEach(t=>t.resize(w,h));
			}
		}
	}
}