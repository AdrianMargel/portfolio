class RenderShader{
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
			uniform float random;
			uniform float channels;

			out vec4 outColor;

			uniform highp sampler2D channel0;
			uniform highp sampler2D channel1;
			uniform highp sampler2D channel2;
			uniform highp sampler2D dnaMeta;

			${gammaFuncs()}
			vec3 rgb2hsv(vec3 c){
				vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
				vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
				vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

				float d = q.x - min(q.w, q.y);
				float e = 1.0e-10;
				return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
			}

			vec3 hsv2rgb(vec3 c){
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}

			void main(){
				vec2 pos2=pos*vec2(.5,-.5)+.5;

				vec4 val0=texture(channel0,pos2);
				vec4 val1=texture(channel1,pos2);
				vec4 val2=texture(channel2,pos2);
				// uvec4 val1u=texture(channel1,pos2);
				// uvec4 val2u=texture(channel2,pos2);
				// vec4 val1=vec4(val1u<<8)/float(uint(-1)<<8);
				// vec4 val2=vec4(val2u<<8)/float(uint(-1)<<8);
				// outColor=vec4((val.y+1.)/2.,(val.z+1.)/2.,(val.w+1.)/2.,1.);
				// outColor=vec4(val.x,(val.z+1.)/2.,(val.w+1.)/2.,1.);
				
				// outColor=vec4(vec3(val0.x+.5,val0.x/4.,val0.x/16.)*((val0.z+1.)/4.+(val0.w+1.)/4.),1.);
				// outColor=vec4(
				// 	vec3(val0.x+.5,val0.x/4.,val0.x/16.)*((val0.z+1.)/4.+(val0.w+1.)/4.)
				// 	+vec3(val1.x/16.,val1.x+.5,val1.x/4.)*((val1.z+1.)/4.+(val1.w+1.)/4.)
				// 	+vec3(val2.x/4.,val2.x/16.,val2.x+.5)*((val2.z+1.)/4.+(val2.w+1.)/4.)
				// ,1.);
				// outColor=vec4(val0.x,val0.x/4.,val0.x/16.,1.);
				// outColor=vec4(val0.x,val1.x,val2.x,1.);
				vec4 val=(val0+val1+val2)/3.;
				if(channels<3.){
					val2*=0.;
				}
				if(channels<2.){
					val1*=0.;
				}
				// outColor=vec4(vec3(val.x,val.x/4.,val.x/16.),1.);
				outColor=vec4(vec3(val.x+.5,val.x/4.,val.x/16.)*((val.z+1.)/4.+(val.w+1.)/4.),1.);
				outColor=vec4((
					vec3(val0.x,val0.x/4.,val0.x/16.)
					+vec3(val1.x/16.,val1.x,val1.x/4.)
					+vec3(val2.x/4.,val2.x/16.,val2.x)
					+.5*channels
				)/channels*((val.z+1.)/4.+(val.w+1.)/4.),1.);
				// outColor=vec4(
				// 	(
				// 		vec3(.5)
				// 		+vec3(.8,.6,.4)*val.x
				// 		+vec3(.2,.5,.1)*(max(val.y+1.,0.))/2.
				// 	)*
				// 	vec3(1.,1.,1.)*((val.z+1.)/4.+(val.w+1.)/4.)
				// ,1.);

				// outColor=vec4(val0.x,val1.x,val2.x,1.);
				// outColor=vec4((
				// 	vec3(val0.x,val0.x/4.,val0.x/16.)
				// 	+vec3(val1.x/16.,val1.x,val1.x/4.)
				// 	+vec3(val2.x/4.,val2.x/16.,val2.x)
				// )/channels,1.);

				// outColor=vec4(hsv2rgb(vec3(texture(dnaMeta,pos2).x,1.,val.x)),1.);
				vec2 meta=texture(dnaMeta,pos2).xy;
				// outColor=vec4(hsv2rgb(vec3(meta.x,clamp(meta.y,0.,.9),val.x)),1.);
				// outColor=vec4(hsv2rgb(vec3(texture(dnaMeta,pos2).xy,1.)),1.);
				// outColor=vec4(0.,texture(dnaMeta,pos2).x,val2.x,1.);
				outColor=vec4(
					hsv2rgb(vec3(texture(dnaMeta,pos2).xy*vec2(1.,.9),val.x))+.2
				*((val.z+1.)/4.+(val.w+1.)/4.),1.);

				// outColor=vec4(
				// 	hsv2rgb(vec3(0.,0.,texture(dnaMeta,pos2).z))+.5
				// /channels*((val.z+1.)/4.+(val.w+1.)/4.),1.);
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
	run(channels){
		let textures=sharedTextures.textures;
		let pingPong=(...args)=>sharedTextures.pingPong(...args);
		let channel0=0;
		let channel1=min(1,channels-1);
		let channel2=min(2,channels-1);

		let uniforms={
			resolution: [gl.canvas.width,gl.canvas.height],
			// canvas: leniaPing?textures[`leniaPongTex${channelId}`]:textures[`leniaPingTex${channelId}`],
			channel0: pingPong(`lenia${channel0}`),
			channel1: pingPong(`lenia${channel1}`),
			channel2: pingPong(`lenia${channel2}`),
			// channel1: pingPong(`dna${channel0}${channel0}`),
			// channel2: pingPong(`dna${channel1}${channel0}`),
			dnaMeta: pingPong(`dnaMETA`),
			random: Math.random(),
			channels
		};

		gl.useProgram(this.programInfo.program);
		twgl.bindFramebufferInfo(gl,null);
		twgl.setBuffersAndAttributes(gl,this.programInfo,this.bufferInfo);
		twgl.setUniforms(this.programInfo,uniforms);
		twgl.drawBufferInfo(gl,this.bufferInfo);
	}
}