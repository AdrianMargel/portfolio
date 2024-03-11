class GradientShader{
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

			void main(){
				vec2 pos2=pos*vec2(.5,.5)+.5;
				vec2 pix=1./resolution;
				// float stretch=resolution.x/resolution.y;
				
				vec4 val=texture(lenia,pos2);
				vec4 pxy=texture(lenia,pos2+pix*vec2(1.,0.));
				vec4 nxy=texture(lenia,pos2+pix*vec2(-1.,0.));
				vec4 xpy=texture(lenia,pos2+pix*vec2(0.,1.));
				vec4 xny=texture(lenia,pos2+pix*vec2(0.,-1.));
				vec4 pxpy=texture(lenia,pos2+pix*vec2(1.,1.));
				vec4 nxny=texture(lenia,pos2+pix*vec2(-1.,-1.));
				vec4 pxny=texture(lenia,pos2+pix*vec2(1.,-1.));
				vec4 nxpy=texture(lenia,pos2+pix*vec2(-1.,1.));
				vec2 sobelFlow;
				vec2 sobelDensity;
				{
					float sobelX=(nxny.y+nxy.y*2.+nxpy.y)-(pxny.y+pxy.y*2.+pxpy.y);
					float sobelY=(nxny.y+xny.y*2.+pxny.y)-(nxpy.y+xpy.y*2.+pxpy.y);
					sobelFlow=vec2(sobelX,sobelY);
				}
				// {
				// 	float sobelX=(nxny.x+nxy.x*2.+nxpy.x)-(pxny.x+pxy.x*2.+pxpy.x);
				// 	float sobelY=(nxny.x+xny.x*2.+pxny.x)-(nxpy.x+xpy.x*2.+pxpy.x);
				// 	sobelDensity=vec2(sobelX,sobelY);
				// }
				vec2 sobel=sobelFlow*clamp(2.-val.x,0.,1.);
				// vec2 sobel=sobelFlow*clamp(1.-val.x,-1.,1.);
				// vec2 sobel=sobelFlow;
				float sLeng=length(sobel);
				if(sLeng>1.){
					sobel/=sLeng;
				}
				float speed=1.;
				sobel*=speed;

				outColor0=vec4(val.x,val.y,sobel.x,sobel.y);
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
			{attachment: pingPong(`lenia${channelId}`,true)},
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