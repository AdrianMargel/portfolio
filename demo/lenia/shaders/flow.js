class FlowShader{
	constructor(){
		this.init();
	}
	init(){
		let vs=glsl`#version 300 es
			in vec4 position;
			out vec2 pos;
			void main(){
				gl_Position=position;
				pos=position.xy;
			}
		`;

		let fs=glsl`#version 300 es
			precision highp float;

			in vec2 pos;

			uniform vec2 resolution;
			uniform float stepSize;
			uniform bool isFirst;
			uniform float random;
			uniform float time;

			// out vec4 outColor;
			layout(location = 0) out vec4 outColor0;
			layout(location = 1) out uvec4 outColor1;

			uniform highp sampler2D canvas;
			uniform highp sampler2D lenia;

			//  1 out, 2 in...
			float hash12(vec2 p){
				vec3 p3  = fract(vec3(p.xyx) * .1031);
				p3 += dot(p3, p3.yzx + 33.33);
				return fract((p3.x + p3.y) * p3.z);
			}

			void main(){
				vec2 pos2=pos*vec2(.5,.5)+.5;
				vec2 pix=1./resolution;
				// float stretch=resolution.x/resolution.y;
				
				vec4 val=texture(lenia,pos2);

				float total=0.;
				float bestD=0.;
				vec2 bestPos=vec2(0.,0.);
				for(int x=-2;x<=2;x++){
					for(int y=-2;y<=2;y++){
						vec4 data=texture(lenia,pos2+pix*vec2(x,y));
						float density=clamp(data.x-1.,0.,1.);
						float diffuse=mix(1.5,3.,density);
						float diffuseOff=(diffuse-1.)/2.;
						vec2 velo=data.zw;
						vec2 offset=velo+vec2(x,y);
						vec2 boundMin=clamp(offset-diffuseOff,0.,1.);
						vec2 boundMax=clamp(offset+1.+diffuseOff,0.,1.);
						vec2 bound=boundMax-boundMin;
						float overlap=bound.x*bound.y;
						float add=data.x*overlap/(diffuse*diffuse);
						total+=add;
					}
				}
				vec4 drawData=texture(canvas,pos2);
				float drawn=max((drawData.r*2.-1.)*drawData.w,-total);

				outColor0=vec4(total+drawn,val.y,val.z,val.w);
			}
		`;

		let programInfo=twgl.createProgramInfo(gl,[vs,fs]);
		let arrays={
			position:{
				numComponents:2,
				data:[
					-1, 1,
					1, -1,
					1, 1,
					-1, 1,
					1, -1,
					-1, -1,
				]
			}
		};

		let bufferInfo=twgl.createBufferInfoFromArrays(gl,arrays);

		this.programInfo=programInfo;
		this.bufferInfo=bufferInfo;
	}
	run(channelId){
		let textures=sharedTextures.textures;
		let pingPong=(...args)=>sharedTextures.pingPong(...args);

		let uniforms={
			resolution: [gl.canvas.width,gl.canvas.height],
			canvas: textures.canvasTex,
			lenia: pingPong(`lenia${channelId}`),
			random:Math.random(),
		};

		let attachments=[
			{attachment:pingPong(`lenia${channelId}`,true)},
		];
		let frameBuffer=twgl.createFramebufferInfo(gl,attachments,textures.leniaBox.width,textures.leniaBox.height);
		twgl.bindFramebufferInfo(gl,frameBuffer);

		gl.useProgram(this.programInfo.program);
		twgl.setBuffersAndAttributes(gl,this.programInfo,this.bufferInfo);
		twgl.setUniforms(this.programInfo,uniforms);
		twgl.drawBufferInfo(gl,this.bufferInfo);

		// let attachments2=[
		// 	{attachment: textures.leniaPing?textures.dnaPingTex:textures.dnaPongTex},
		// ];
		// let frameBuffer2=twgl.createFramebufferInfo(gl,attachments2,textures.leniaBox.width,textures.leniaBox.height);
		// twgl.bindFramebufferInfo(gl,frameBuffer2);
		// let reuse=sharedTextures.reuse;
		// gl.readPixels(0,0,textures.leniaBox.width,textures.leniaBox.height,gl.RGBA_INTEGER,gl.UNSIGNED_INT,reuse.outputArr);
	}
}