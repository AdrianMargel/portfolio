class LeniaShader{
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
			uniform float globalRandom;
			uniform float localRandom;
			uniform bool init;
			uniform bool firstChannelFrame;
			uniform bool firstFrame;
			uniform float channels;

			// out vec4 outColor;
			layout(location = 0) out vec4 outColor0;
			layout(location = 1) out uvec4 outColor1;
			layout(location = 2) out vec4 outColor2;

			uniform highp sampler2D canvas;
			uniform highp sampler2D lenia;
			uniform highp sampler2D leniaOrigin;
			uniform highp sampler2D leniaCheck;
			uniform highp usampler2D dna;
			uniform highp sampler2D dnaMeta;

			

			${gammaFuncs()}

			//  1 out, 1 in...
			float hash11(float p){
				p = fract(p * .1031);
				p *= p + 33.33;
				p *= p + p;
				return fract(p);
			}
			//  1 out, 2 in...
			float hash12(vec2 p){
				vec3 p3  = fract(vec3(p.xyx) * .1031);
				p3 += dot(p3, p3.yzx + 33.33);
				return fract((p3.x + p3.y) * p3.z);
			}
			// 1 out, 3 in...
			float hash13(vec3 p3){
				p3  = fract(p3 * .1031);
				p3 += dot(p3, p3.zyx + 31.32);
				return fract((p3.x + p3.y) * p3.z);
			}
			//  2 out, 2 in...
			vec2 hash22(vec2 p){
				vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
				p3 += dot(p3, p3.yzx+33.33);
				return fract((p3.xx+p3.yz)*p3.zy);
			}
			//  2 out, 3 in...
			vec2 hash23(vec3 p3){
				p3 = fract(p3 * vec3(.1031, .1030, .0973));
				p3 += dot(p3, p3.yzx+33.33);
				return fract((p3.xx+p3.yz)*p3.zy);
			}
			
			float bell(float x, float m, float s){
				return exp(-(x-m)*(x-m)/s/s/2.);  // bell-shaped curve
			}
			float weight(float dist,float[16] dnaVals){
				// return bell(dist,dnaVals[0],dnaVals[1]);
				// return bell(dist,.5,.15);
				float idx=floor(clamp(dist*8.,0.,7.));
				float idxMix=dist*8.-idx;
				float v1=dnaVals[int(idx)];
				float v2;
				if(int(idx)+1==8){
					v2=0.;
				}else{
					v2=dnaVals[int(idx)+1];
				}
				return mix(v1,v2,idxMix);
			}
			float growth(float val,float[16] dnaVals){
				// return bell(val,dnaVals[8],dnaVals[9])*2.-1.;
				// return bell(val,.14,.014)*2.-1.;
				float idx=floor(clamp(val*7.,0.,6.));
				float idxMix=val*7.-idx;
				float v1=dnaVals[int(idx)+8]*2.-1.;
				float v2=dnaVals[int(idx)+8+1]*2.-1.;
				return mix(v1,v2,idxMix);
			}
			vec3 check(vec2 p,vec2 pix,float[16] dnaVals){
				float total=0.;
				float weightTotal=0.;
				int kSize=10;
				float bestD=0.;
				vec2 bestPos=vec2(0.,0.);
				float spreadRange=2.;
				for(int x=-kSize;x<=kSize;x++){
					for(int y=-kSize;y<=kSize;y++){
						vec2 offset=vec2(x,y);
						float l=length(offset);
						if(l<=float(kSize)){
							vec2 p2=p+pix*offset;
							float w=weight(l/float(kSize),dnaVals);
							float density=texture(leniaCheck,p2).r;
							total+=density*w;
							weightTotal+=w;
							
							if(l<=spreadRange){
								float rand=hash12((p2+globalRandom)*1000.);
								float oDensity=texture(leniaOrigin,p2).r*rand;
								if(oDensity>bestD){
									bestD=oDensity;
									bestPos=vec2(x,y);
								}
							}
						}
					}
				}
				if(weightTotal!=.0){
					total/=weightTotal;
				}
				return vec3(total,bestPos.x,bestPos.y);
			}

			float mutateFloat(float val,vec2 p,float mutRate){
				float mut=hash12(p)*2.-1.;
				// mut=pow(abs(mut),1./max(mutRate,.01))*sign(mut);
				mut=mut*mutRate;
				return val+mut;
			}
			uint mutateVal(float val,vec2 p,float mutRate){
				float sliceMax=float((1<<8)-1);
				return uint(clamp(mutateFloat(val,p,mutRate),0.,1.)*sliceMax);
			}
			uvec4 mutate(float[16] dnaVals,vec2 rPos,float mutRate){
				uvec4 randomMut=uvec4(0);
				float off=1000.;
				randomMut[0]=
					${Array(4).fill().map((_,i)=>
						glsl`(mutateVal(dnaVals[${i}],rPos+off*${i}.,mutRate)<<(8*${3-i}))`	
					).join("\n|")};
				randomMut[1]=
					${Array(4).fill().map((_,i)=>
						glsl`(mutateVal(dnaVals[${i+4}],rPos+off*${i+4}.,mutRate)<<(8*${3-i}))`	
					).join("\n|")};
				randomMut[2]=
					${Array(4).fill().map((_,i)=>
						glsl`(mutateVal(dnaVals[${i+8}],rPos+off*${i+8}.,mutRate)<<(8*${3-i}))`	
					).join("\n|")};
				randomMut[3]=
					${Array(4).fill().map((_,i)=>
						glsl`(mutateVal(dnaVals[${i+12}],rPos+off*${i+12}.,mutRate)<<(8*${3-i}))`	
					).join("\n|")};
				return randomMut;
			}
			float[16] parseDna(uvec4 dnaData){
				float[16] dnaVals;
				float sliceMax=float((1<<8)-1);
				${Array(4).fill().map((_,i)=>
					glsl`dnaVals[${i}]=float((dnaData.x&(uint(-1)<<24>>${8*i}))>>${24-8*i})/sliceMax;`	
				).join("\n")}
				${Array(4).fill().map((_,i)=>
					glsl`dnaVals[${i+4}]=float((dnaData.y&(uint(-1)<<24>>${8*i}))>>${24-8*i})/sliceMax;`	
				).join("\n")}
				${Array(4).fill().map((_,i)=>
					glsl`dnaVals[${i+8}]=float((dnaData.z&(uint(-1)<<24>>${8*i}))>>${24-8*i})/sliceMax;`	
				).join("\n")}
				${Array(4).fill().map((_,i)=>
					glsl`dnaVals[${i+12}]=float((dnaData.w&(uint(-1)<<24>>${8*i}))>>${24-8*i})/sliceMax;`	
				).join("\n")}
				return dnaVals;
			}

			void main(){
				vec2 pos2=pos*vec2(.5,.5)+.5;
				vec2 pix=1./resolution;
				// float stretch=resolution.x/resolution.y;
				
				// outColor=texture(prev,pos2)*.9+texture(canvas,pos2);
				// outColor=vec4(stepSize);
				// outColor=vec4(blur(pos2).xyz*1.02-.015+texture(canvas,pos2).xyz,1.);
				// uvec4 dnaData=uvec4(${flr(random(0,4294967295))},${flr(random(0,4294967295))},${flr(random(0,4294967295))},${flr(random(0,4294967295))});
				uvec4 dnaData=texture(dna,pos2);
				// if(dnaData==uvec4(0,0,0,0)){
					// dnaData[0]=uint(-1);
					// dnaData[1]=uint(-1);
					// dnaData[2]=uint(-1);
					// dnaData[3]=uint(-1);
				// }
				float[16] dnaVals=parseDna(dnaData);

				if(init){
					float result=hash12(pos2*1000.+localRandom*2000.);
					float seedSize=100.;
					vec2 rPos=floor(pos2*resolution/seedSize)+floor(localRandom*1000.)*seedSize;
					// vec2 rPos=vec2(floor(random*10000.));
					int join=(1<<8);
					float off=1000.;
					dnaData[0]=uint(-1);
					dnaData[1]=uint(-1);
					dnaData[2]=uint(-1);
					dnaData[3]=uint(-1);
					dnaData[0]=(uint(hash12(rPos+off*0.)*float(join))&uint(join-1))
						|(uint(hash12(rPos+off*1.)*float(join))&uint(join-1))<<uint(8*1)
						|(uint(hash12(rPos+off*2.)*float(join))&uint(join-1))<<uint(8*2)
						|(uint(hash12(rPos+off*3.)*float(join))&uint(join-1))<<uint(8*3);
					dnaData[1]=(uint(hash12(rPos+off*4.)*float(join))&uint(join-1))
						|(uint(hash12(rPos+off*5.)*float(join))&uint(join-1))<<uint(8*1)
						|(uint(hash12(rPos+off*6.)*float(join))&uint(join-1))<<uint(8*2)
						|(uint(hash12(rPos+off*7.)*float(join))&uint(join-1))<<uint(8*3);
					dnaData[2]=(uint(hash12(rPos+off*8.)*float(join))&uint(join-1))
						|(uint(hash12(rPos+off*9.)*float(join))&uint(join-1))<<uint(8*1)
						|(uint(hash12(rPos+off*10.)*float(join))&uint(join-1))<<uint(8*2)
						|(uint(hash12(rPos+off*11.)*float(join))&uint(join-1))<<uint(8*3);
					dnaData[3]=(uint(hash12(rPos+off*12.)*float(join))&uint(join-1))
						|(uint(hash12(rPos+off*13.)*float(join))&uint(join-1))<<uint(8*1)
						|(uint(hash12(rPos+off*14.)*float(join))&uint(join-1))<<uint(8*2)
						|(uint(hash12(rPos+off*15.)*float(join))&uint(join-1))<<uint(8*3);
					// outColor0=vec4(result*1.*pow(pos2.x,2.)*pow(1.-pos2.y,2.),0.,0.,0.);
					outColor0=vec4(result*.2,0.,0.,0.);
					outColor1=dnaData;
					// outColor1=uvec4(-1.);
					outColor2=vec4(hash12(rPos+off*16.),1,0.,0.);
					// outColor2=vec4(.3,1.,1.,0.);
					
				}else{
					float speed=.1;
					vec4 curr=texture(lenia,pos2);
					float val=curr.x;
					float affinity=curr.y;
					vec3 neighborCheck=check(pos2,pix,dnaVals);
					float neighbor=neighborCheck.x;
					float delta=growth(neighbor,dnaVals);
					// float result=clamp(val+drawn+delta*speed,0.,1.);
					// outColor0=vec4(result,delta,0.,1.);
					// outColor0=vec4(val-max(val-2.,.0)*.1+drawn,delta,0.,0.);
					if(firstChannelFrame){
						outColor0=vec4(val,delta,0.,0.);
					}else{
						outColor0=vec4(val,affinity+delta,0.,0.);
					}

					uvec4 prevDna=texture(dna,pos2+neighborCheck.yz*pix);
					vec4 meta;
					if(firstFrame){
						meta=texture(dnaMeta,pos2+neighborCheck.yz*pix);
					}else{
						//meta should only move on the first frame
						meta=texture(dnaMeta,pos2);
					}
					float mutRate=meta.z;

					float seedSize=1.;
					vec2 rPos=floor(pos2*resolution/seedSize+floor(localRandom*1000.)*seedSize);
					if(hash12(rPos+1000.*50.)<.001){
						prevDna=mutate(parseDna(prevDna),rPos,mutRate);
						meta.x=mod(mutateFloat(meta.x,rPos+1000.*51.,mutRate/(channels*channels)*.5),1.);
						meta.z=clamp(mutateFloat(meta.z,rPos+1000.*52.,.01),0.,1.);
					}
					outColor1=prevDna;
					outColor2=meta;
				}
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
	run(time,channelId,checkId,rand,firstFrame=false,firstChannelFrame=false,channels){
		let textures=sharedTextures.textures;
		let pingPong=(...args)=>sharedTextures.pingPong(...args);

		let uniforms={
			resolution: [gl.canvas.width,gl.canvas.height],
			canvas: textures.canvasTex,
			lenia: pingPong(`lenia${channelId}`),
			leniaCheck: pingPong(`lenia${checkId}`),
			leniaOrigin: pingPong(`lenia${0}`),
			dnaMeta: pingPong(`dnaMETA`),
			dna: pingPong(`dna${channelId}${checkId}`),
			globalRandom:rand,
			localRandom:Math.random(),
			init:time==0.,
			firstChannelFrame,
			firstFrame,
			channels
		};

		let attachments=[
			{attachment: pingPong(`lenia${channelId}`,true)},
			{attachment: pingPong(`dna${channelId}${checkId}`,true)},
			{attachment: pingPong(`dnaMETA`,true)},
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