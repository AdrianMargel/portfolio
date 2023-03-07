class BackgroundShader{
	constructor(){
		this.init();
		this.time=0;
	}
	init(){
		//TODO: init with cloud settings
		let vs=glsl`#version 300 es
			in vec4 position;

			void main(){
				gl_Position=position;
			}
		`;

		let fs=glsl`#version 300 es
			precision highp float;

			uniform vec2 resolution;
			uniform vec2 position;
			uniform float zoom;
			uniform float random;
			uniform uint time;
			uniform vec2 cloudMetaSize;

			out vec4 outColor;

			${samplerVar("water")}
			${samplerVar("shadow")}
			${samplerVar("clouds")}
			${idxFunc("water")}
			${idxFunc("shadow")}
			${idxFuncVec4("clouds")}

			uniform highp usampler2D cloudTimes;
			highp uint cloudTimesAtIdx(highp uint idx){
				uint width=uint(cloudsResolution.x);
				vec2 halfPix=vec2(0.5,0.5);
		
				uint y=idx/width;
				uint x=idx-(y*width);
		
				vec2 idxPos=vec2(x,y);
				//make sure to sample from the center of the pixel
				idxPos+=halfPix;
				if(idxPos.y>=cloudsResolution.y){
					return uint(0);
				}
				return texture(cloudTimes, idxPos/cloudsResolution).r;
			}

			vec3 gammaCorrect(vec3 col){
				float gammaExp=${1./2.2};
				return vec3(pow(col.x,gammaExp),pow(col.y,gammaExp),pow(col.z,gammaExp));
			}
			vec3 gammaShift(vec3 col){
				float gammaExp=2.2;
				return vec3(pow(col.x,gammaExp),pow(col.y,gammaExp),pow(col.z,gammaExp));
			}
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
			//  3 out, 2 in...
			vec3 hash32(vec2 p){
				vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
				p3 += dot(p3, p3.yxz+33.33);
				return fract((p3.xxy+p3.yzz)*p3.zyx);
			}
			//  2 out, 2 in...
			vec2 hash22(vec2 p){
				vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
				p3 += dot(p3, p3.yzx+33.33);
				return fract((p3.xx+p3.yz)*p3.zy);
			}

			float getWaterline(float x,float y){
				if(y<-500.){
					return 0.;
				}
				float between=mod(x,100.)/100.;

				float idx=mod(floor(x/100.),100.);

				float idx1=idx;
				float idx2=mod(idx+1.,100.);

				float y1=waterAtIdx(uint(idx1));
				float y2=waterAtIdx(uint(idx2));

				return mix(y1,y2,between);
			}
			float getShadowline(float x,float y){
				x=x-y*.5;

				float idx=mod(floor(x/1.),10000.);
				float yS=shadowAtIdx(uint(idx));
				
				return min(max((y-yS)/500.,0.),1.);
			}
			float getShadowlineDepth(float x,float y){
				x=x-y*.5;
				float between=1.;//mod(x,10.)/10.;

				float idx=mod(floor(x/1.),10000.);

				return shadowAtIdx(uint(idx));
			}
			// float noise2D(vec2 p,float s){
			// 	vec2 tileP=floor(p/s);
			// 	vec2 tileMix=mod(p,s)/s;
			// 	float randPP=hash12(tileP+vec2(1.,1.));
			// 	float randPN=hash12(tileP+vec2(1.,0.));
			// 	float randNP=hash12(tileP+vec2(0.,1.));
			// 	float randNN=hash12(tileP+vec2(0.,0.));
			// 	float valPX=mix(randNP,randPP,tileMix.x);
			// 	float valNX=mix(randNN,randPN,tileMix.x);
			// 	float val=mix(valNX,valPX,tileMix.y);
			// 	return val;
			// }
			float noise1D(float x,float s){
				float tileP=floor(x/s);
				float tileMix=mod(x,s)/s;
				float randP=hash11(tileP+1.);
				float randN=hash11(tileP);
				float val=mix(randN,randP,tileMix);
				return val;
			}
			float noise2D(in vec2 x, float u, float v){
				vec2 p = floor(x);
				vec2 f = fract(x);

				float k = 1.0 + 63.0*pow(1.0-v,4.0);
				float va = 0.0;
				float wt = 0.0;
				for( int j=-2; j<=2; j++ )
					for( int i=-2; i<=2; i++ ){
						vec2  g = vec2( float(i), float(j) );
						vec3  o = hash32( p + g )*vec3(u,u,1.0);
						vec2  r = g - f + o.xy;
						float d = dot(r,r);
						float w = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), k );
						va += w*o.z;
						wt += w;
					}

				return va/wt;
			}
			float worley2D(in vec2 x){
				// return 1.;
				ivec2 p = ivec2(floor( x ));
				vec2  f = fract( x );
			
				ivec2 mb;
				vec2 mr;
			
				float res = 8.0;
				for( int j=-1; j<=1; j++ )
				for( int i=-1; i<=1; i++ )
				{
					ivec2 b = ivec2(i, j);
					vec2  r = vec2(b) + hash22(vec2(p+b))-f;
					float d = dot(r,r);
			
					if( d < res)
					{
						res = d;
						mr = r;
						mb = b;
					}
				}
			
				// res = 8.0;
				// for( int j=-2; j<=2; j++ )
				// for( int i=-2; i<=2; i++ )
				// {
				// 	ivec2 b = mb + ivec2(i, j);
				// 	vec2  r = vec2(b) + hash22(vec2(p+b)) - f;
				// 	float d = dot(0.5*(mr+r), normalize(r-mr));
			
				// 	res = min( res, d );
				// }
			
				return 1.-res;
			}
			float smoothVoronoi( in vec2 x ){
				ivec2 p = ivec2(floor( x ));
				vec2  f = fract( x );

				float res = 0.0;
				for( int j=-1; j<=1; j++ )
				for( int i=-1; i<=1; i++ )
				{
					ivec2 b = ivec2( i, j );
					vec2  r = vec2( b ) - f + hash22(vec2(p + b));
					float d = dot( r, r );

					res += 1.0/pow( d, 8.0 );
				}
				return pow( 1.0/res, 1.0/16.0 );
			}
			vec4 cloudsAtPure(vec2 p){
				//TODO: prevent y looping
				vec2 metaP=mod(floor(p/40.),cloudMetaSize);
				uint metaIdx=uint(metaP.x+metaP.y*cloudMetaSize.x);

				// return (vec4(metaIdx)+1.)*.1;

				vec2 tileP=floor(mod(p,40.));
				uint tileIdx=uint(tileP.x+tileP.y*40.);
				uint idx=tileIdx+metaIdx*uint(${(40**2).toFixed(1)});
				vec4 c=cloudsAtIdx(idx);
				float tDelta=1.-clamp(float(time-cloudTimesAtIdx(idx))/1000.,0.,1.);

				float spaceStart=${(4000/(1000/40)).toFixed(1)};
				float spaceEnd=${(8000/(1000/40)).toFixed(1)};
				if(-p.y>spaceStart){
					c.w*=max((p.y+spaceEnd)/(spaceEnd-spaceStart),0.);
				}
				c.w*=tDelta;
				if(c.w==0.){
					return vec4(1.,1.,1.,0.);
				}else{
					return vec4(gammaShift(c.xyz),c.w);
				}
			}
			vec4 cloudsAtLinear(vec2 p){
				vec2 tileMix=mod(p,1.)/1.;
				vec4 pp=cloudsAtPure(p+vec2(1.,1.));
				vec4 pn=cloudsAtPure(p+vec2(1.,0.));
				vec4 np=cloudsAtPure(p+vec2(0.,1.));
				vec4 nn=cloudsAtPure(p);
				return mix(mix(nn,pn,tileMix.x),mix(np,pp,tileMix.x),tileMix.y);
			}
			vec4 cloudBlur(vec4 i0,vec4 i1,vec4 i2,vec4 i3,vec4 i4,vec4 i5,vec4 i6,vec4 i7,vec4 i8){
				float totalA=i0.w*.0625 + i1.w*.125 + i2.w*.0625
					+ i3.w*.125 + i4.w*.25 + i5.w*.125
					+ i6.w*.0625 + i7.w*.125 + i8.w*.0625;
				i0.xyz*=i0.w;
				i1.xyz*=i1.w;
				i2.xyz*=i2.w;
				i3.xyz*=i3.w;
				i4.xyz*=i4.w;
				i5.xyz*=i5.w;
				i6.xyz*=i6.w;
				i7.xyz*=i7.w;
				i8.xyz*=i8.w;
				if(totalA==0.){
					return vec4(1.,1.,1.,0.);
				}
				return vec4((i0*.0625 + i1*.125 + i2*.0625
					+ i3*.125 + i4*.25 + i5*.125
					+ i6*.0625 + i7*.125 + i8*.0625).xyz/totalA,totalA);
			}
			vec4 cloudMix(vec4 pp,vec4 pn,vec4 np,vec4 nn,vec2 mixP){
				pp.xyz*=pp.w;
				pn.xyz*=pn.w;
				np.xyz*=np.w;
				nn.xyz*=nn.w;
				vec4 result=mix(mix(nn,pn,mixP.x),mix(np,pp,mixP.x),mixP.y);
				if(result.w>0.){
					result.xyz/=result.w;
				}
				return result;
			}
			vec4 cloudsAt(vec2 p){
				vec2 tileMix=mod(p,1.)/1.;
				vec4 i0,i1,i2,i3,
					i4,i5,i6,i7,
					i8,i9,i10,i11,
					i12,i13,i14,i15;
				// float=cloudsAtLinear(p+vec2(x,y))*41.;
				float i=0.;
				for(float x=-1.;x<=2.;x++){
					for(float y=-1.;y<=2.;y++){
						if(i==0.){
							i0=cloudsAtPure(p+vec2(x,y));
						}${Array(15).fill().map((_,i)=>glsl`
						else if(i==${i+1}.){
							i${i+1}=cloudsAtPure(p+vec2(x,y));
						}`).join("")}
						i++;
					}
				}
				vec4 nn=cloudBlur(i0,i1,i2, i4,i5,i6, i8,i9,i10);
				vec4 np=cloudBlur(i1,i2,i3, i5,i6,i7, i9,i10,i11);
				vec4 pn=cloudBlur(i4,i5,i6, i8,i9,i10, i12,i13,i14);
				vec4 pp=cloudBlur(i5,i6,i7, i9,i10,i11, i13,i14,i15);
				vec4 result=cloudMix(pp,pn,np,nn,tileMix);
				return vec4(gammaCorrect(result.xyz),result.w);
			}
			vec4 getCloud(vec2 p,vec4 cloudPaint,vec3 back){
				// return cloudPaint.xyz;
				float scale=.5;
				float cloudSeed=pow(noise1D(p.x,5000.)+0.4,3.)-0.4;
				// float n1=noise2D(p/100.,1.,1.)/2.+0.2;
				// float water=.35;
				vec2 p2=p+vec2(1.,0.)*float(time);
				vec2 p3=p+vec2(-.5,0.)*float(time);
				p3*=vec2(1.,2.)*1.;
				float water=noise2D(p3/200.,1.,1.)*noise2D(p3/400.,1.,1.)*noise2D(p3/1000.,1.,1.);
				// water*=2.0;
				// float altitude=clamp(1.-abs(p.y+2000.)/500.,0.,1.)*5.;
				float ceiling=1500.;
				float bottomWidth=200.;
				float topWidth=2000.;
				float spaceStart=4000.;
				float spaceEnd=8000.;
				float a1=clamp(-(p.y+ceiling-bottomWidth)/bottomWidth,0.,1.);
				float a2=pow(clamp((p.y+ceiling+topWidth)/topWidth,0.,1.),2.);
				float a3=1000.;
				if(-p.y>spaceStart){
					a3=max((p.y+spaceEnd)/(spaceEnd-spaceStart),0.);
				}
				float a4=clamp((1.-a3)*3.,0.,1.);
				cloudSeed=max(a4,cloudSeed);
				float altitude=min(min(a1,a2)*10.+.5,a3);
				float cloudTexture=worley2D(p2/100.*scale)*2.+noise2D(p2/20.*scale,1.,1.);

				float waterPaint=cloudPaint.w*cloudTexture*2.;
				float waterNatural=water*altitude*cloudSeed*cloudTexture;
				float cloud=pow(waterPaint+waterNatural,2.);

				float cloudDensity=mix(.75*min(cloud,1.),.9,
					clamp(cloud-2.,0.,1.)
				);
				if(waterPaint>0.){
					float cloudN=pow(waterNatural,2.);
					float cMix=cloudN/cloud;
					vec3 cloudCol=mix(cloudPaint.xyz,vec3(1.),cMix);
					vec3 colP=(1.-(1.-cloudDensity)*(1.-back))*(1.-cloudDensity*(1.-cloudCol.xyz));
					return vec4(colP,1.);
				}else{
					return vec4((1.-(1.-cloudDensity)*(1.-back)),1.);
				}
			}
			float getShadow(vec2 p){
				float sd1=getShadowlineDepth(p.x,p.y);
				float sd2=getShadowlineDepth(p.x+50.,p.y);
				float sd3=getShadowlineDepth(p.x-50.,p.y);
				float shadowDepth=min(min(sd1,sd2),sd3);
				float shadowWidth=floor(max(min((p.y-shadowDepth)/20.,50.),1.));
				float shadow=0.;
				float sampleRate=max(min(10.,shadowWidth/2.),1.);
				float sampleDist=ceil(shadowWidth/sampleRate);
				float samples=0.;
				for(float i=0.;i<shadowWidth;i+=sampleDist){
					shadow+=getShadowline(p.x+i,p.y);
					shadow+=getShadowline(p.x-i,p.y);
					samples+=2.;
				}
				shadow/=samples;
				return shadow;
			}

			void main(){
				vec2 coord=gl_FragCoord.xy;
				vec2 uv=gl_FragCoord.xy/resolution;
				// vec2 uv2=vec2(uv.x*2.-1.,uv.y*2.-1.);

				vec2 real=vec2(coord.x,resolution.y-coord.y)/zoom+position;
				float waterline=getWaterline(real.x,real.y);

				float noise=(hash13(vec3(random,coord))*2.-1.)*0.01;
				if(real.y<waterline){
					float alt=min(max(1.+real.y/10000.,0.),1.);
					float alt1=pow(alt,1.5);
					float alt2=pow(alt,2.5);
					float alt3=pow(alt,5.5);
					float haze=min(max(1.+real.y/5000.,0.),1.);
					float haze1=pow(haze,2.5);
					float haze2=pow(haze,1.5);
					float haze3=pow(haze,5.5);
					vec3 ambient=vec3(.01,.015,.02);
					vec3 sky=vec3(0.1*alt3,0.9*alt2,1.2*alt1)*1.;
					vec3 fog=vec3(0.5*haze3,0.1*haze2,0.2*haze1)*.5;
					vec3 back=gammaCorrect(min(sky+fog+ambient,1.));

					// float shadow=getShadow(real);
					vec4 cloudPaint=cloudsAt(real/(${(1000/40).toFixed(1)}));//TODO
					outColor=getCloud(real,cloudPaint,back);
					// vec3 cloudCol=cloudPaint.xyz;
					// vec3 cShadow=(vec3(1.)-shadow*cloud*(1.-back)*.2);
				}else{
					float topX=real.x-real.y*0.5;
					float waterline1=getWaterline(topX-50.,real.y);
					float waterline2=getWaterline(topX+50.,real.y);

					float shadow=getShadow(real);

					float depthReal=real.y;
					float depthWater=real.y-waterline;
					float godrays=abs(waterline1-waterline2)*1.5;
					// godrays+=shadow*-50.;
					godrays+=shadow*-min(depthWater/1500.,1.)*200.;

					float scale=min(max(1.-depthReal/500.,0.),1.);
					float depthScaled=mix(depthReal,depthWater,scale)-godrays;
					float depth=min(max(1.-depthScaled/3000.,0.),1.);
					float depth1=pow(depth,20.);
					float depth2=pow(depth,5.);
					float depth3=pow(depth,4.);
					vec3 ambient=vec3(0.,0.02,.05);
					vec3 water=vec3(0.1*depth1,.9*depth2,0.8*depth3);

					if(depthWater<20.){
						water*=0.9;
					}
					outColor=vec4(gammaCorrect(water+ambient)+noise,1.);
					// outColor=vec4(godrays,1.);
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
		
		this.reuse={};
	}
	run(cam,waterArr,shadowArr,cloudsObj,time){
		twgl.resizeCanvasToDisplaySize(gl.canvas);
		gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

		let waterBox;
		let waterTex;
		if(textures.waterTex!=null){
			waterBox=boxArray(waterArr,1);
			waterTex=textures.waterTex;

			let f32Arr=this.reuse.waterF32Arr;
			f32Arr.set(waterBox.arr);

			updateTexture(waterTex,f32Arr,{
				width: waterBox.width,
				height: waterBox.height,
				minMag: gl.NEAREST,
				internalFormat: gl.R16F,
			});

			textures.waterBox=waterBox;
		}else{
			waterBox=boxArray(waterArr,1);

			let f32Arr=this.reuse.waterF32Arr=new Float32Array(waterBox.arr);

			waterTex=toTexture({
				src: f32Arr,
				width: waterBox.width,
				height: waterBox.height,
				minMag: gl.NEAREST,
				internalFormat: gl.R16F,
			});

			textures.waterBox=waterBox;
			textures.waterTex=waterTex;
		}

		let shadowBox;
		let shadowTex;
		if(textures.shadowTex!=null){
			shadowBox=boxArray(shadowArr,1);
			shadowTex=textures.shadowTex;

			let f32Arr=this.reuse.shadowF32Arr;
			f32Arr.set(shadowBox.arr);

			updateTexture(shadowTex,f32Arr,{
				width: shadowBox.width,
				height: shadowBox.height,
				minMag: gl.NEAREST,
				internalFormat: gl.R16F,
			});

			textures.shadowBox=shadowBox;
		}else{
			shadowBox=boxArray(shadowArr,1);
			
			let f32Arr=this.reuse.shadowF32Arr=new Float32Array(shadowBox.arr);

			shadowTex=toTexture({
				src: f32Arr,
				width: shadowBox.width,
				height: shadowBox.height,
				minMag: gl.NEAREST,
				internalFormat: gl.R16F,
			});

			textures.shadowBox=shadowBox;
			textures.shadowTex=shadowTex;
		}

		let cloudsBox;
		let cloudsTex;
		if(textures.cloudsTex!=null){
			cloudsBox=boxTypedArray(cloudsObj.arr,4,cloudsObj.width);
			cloudsTex=textures.cloudsTex;
			
			updateTexture(cloudsTex,cloudsBox.arr,{
				width: cloudsBox.width,
				height: cloudsBox.height,
				minMag: gl.NEAREST,
				internalFormat: gl.RGBA8,
			});

			textures.cloudsBox=cloudsBox;
		}else{
			cloudsBox=boxTypedArray(cloudsObj.arr,4,cloudsObj.width);

			cloudsTex=toTexture({
				src: cloudsBox.arr,
				width: cloudsBox.width,
				height: cloudsBox.height,
				minMag: gl.NEAREST,
				internalFormat: gl.RGBA8,
			});

			textures.cloudsBox=cloudsBox;
			textures.cloudsTex=cloudsTex;
		}

		let cloudTimesBox;
		let cloudTimesTex;
		if(textures.cloudTimesBox!=null){
			cloudTimesBox=boxTypedArray(cloudsObj.timeArr,1,cloudsObj.width);
			cloudTimesTex=textures.cloudTimesTex;
			
			updateTexture(cloudTimesTex,cloudTimesBox.arr,{
				width: cloudTimesBox.width,
				height: cloudTimesBox.height,
				minMag: gl.NEAREST,
				internalFormat: gl.R32UI,
			});

			textures.cloudTimesBox=cloudTimesBox;
		}else{
			cloudTimesBox=boxTypedArray(cloudsObj.timeArr,1,cloudsObj.width);

			cloudTimesTex=toTexture({
				src: cloudTimesBox.arr,
				width: cloudTimesBox.width,
				height: cloudTimesBox.height,
				minMag: gl.NEAREST,
				internalFormat: gl.R32UI,
			});

			textures.cloudTimesBox=cloudTimesBox;
			textures.cloudTimesTex=cloudTimesTex;
		}

		let uniforms={
			resolution: [gl.canvas.width,gl.canvas.height],

			waterResolution: [waterBox.width,waterBox.height],
			water: waterTex,
			shadowResolution: [shadowBox.width,shadowBox.height],
			shadow: shadowTex,
			cloudsResolution: [cloudsBox.width,cloudsBox.height],
			clouds: cloudsTex,
			cloudTimes: cloudTimesTex,

			cloudMetaSize: [cloudsObj.metaWidth,cloudsObj.metaHeight],
			position:cam.pos,
			zoom:cam.zoom,
			random:Math.random(),
			time
		};

		gl.useProgram(this.programInfo.program);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		twgl.setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo);
		twgl.setUniforms(this.programInfo, uniforms);
		twgl.drawBufferInfo(gl, this.bufferInfo);
	}
}
class RenderShader{
	constructor(){
		this.loaded=false;
		this.init();
		this.prime();
	}
	prime(){
		this.position=[];
		this.rotation=[];
		this.texturePos=[];
		this.textureSize=[];
		this.objectPos=[];
		this.objectSize=[];
		this.objectAngle=[];
		this.offset=[];
		this.indices=[];
		this.count=0;
	}
	img(x,y,sizeX,sizeY,angle,imgX,imgY,imgSizeX,imgSizeY,flip,offsetX=0,offsetY=0){
		let rotX=Math.cos(angle);
		let rotY=Math.sin(angle);
		this.position.push(
			1, 1,
			1, -1,
			-1, 1,
			-1, -1
		);
		this.rotation.push(
			rotX,rotY,
			rotX,rotY,
			rotX,rotY,
			rotX,rotY,
		);
		if(flip){
			this.texturePos.push(
				imgX+imgSizeX, imgY,
				imgX+imgSizeX, imgY+imgSizeY,
				imgX, imgY,
				imgX, imgY+imgSizeY,
			);
			this.offset.push(
				offsetX,-offsetY,
				offsetX,-offsetY,
				offsetX,-offsetY,
				offsetX,-offsetY,
			);
		}else{
			this.texturePos.push(
				imgX+imgSizeX, imgY+imgSizeY,
				imgX+imgSizeX, imgY,
				imgX, imgY+imgSizeY,
				imgX, imgY,
			);
			this.offset.push(
				offsetX,offsetY,
				offsetX,offsetY,
				offsetX,offsetY,
				offsetX,offsetY,
			);
		}
		this.textureSize.push(
			imgSizeX, imgSizeY,
			imgSizeX, imgSizeY,
			imgSizeX, imgSizeY,
			imgSizeX, imgSizeY,
		);
		this.objectPos.push(
			x,y,
			x,y,
			x,y,
			x,y,
		);
		this.objectSize.push(
			sizeX,sizeY,
			sizeX,sizeY,
			sizeX,sizeY,
			sizeX,sizeY,
		);
		if(flip){
			angle=-angle;
			angle-=0.4636476090008061+PI/2;//angle is used for lighting and the sun is at an angle of (1,2)
		}else{
			angle+=0.4636476090008061+PI/2;//angle is used for lighting and the sun is at an angle of (1,2)
		}
		this.objectAngle.push(
			angle,angle,angle,angle
		);
		this.indices.push(
			this.count+0,this.count+1,this.count+2,
			this.count+1,this.count+2,this.count+3
		);
		this.count+=4;
	}
	init(){
		let vs=glsl`#version 300 es
			in vec4 position;

			in vec2 rotation;
			in vec2 texturePos;
			in vec2 textureSize;
			in vec2 objectPos;
			in vec2 objectSize;
			in vec2 offset;
			in float objectAngle;
			uniform vec2 resolution;

			uniform vec2 camPos;
			uniform float camZoom;

			out vec2 texCoord;
			out vec2 texSize;
			out vec2 real;
			out vec2 size;
			out vec2 rot;
			out float angle;

			void main(){
				vec4 pos=position;
				pos.xy*=objectSize/2.;
				pos.xy+=offset;

				pos.xy=vec2(
					pos.x*rotation.x - pos.y*rotation.y,
					pos.x*rotation.y + pos.y*rotation.x);
				vec2 realPos=pos.xy+objectPos;
				pos.xy+=objectPos-camPos;
				pos.xy*=camZoom/resolution;

				pos.xy=pos.xy*2.-1.;
				pos.y*=-1.;

				gl_Position=pos;
  				texCoord=texturePos;
				texSize=textureSize;
  				real=realPos;
				size=objectSize;
				rot=rotation;
				angle=objectAngle;
			}
		`;

		let fs=glsl`#version 300 es
			#define PI 3.1415926535897932384626433832795
			precision highp float;
			uniform vec2 resolution;
			in vec2 texCoord;
			in vec2 texSize;
			in vec2 real;
			in vec2 size;
			in vec2 rot;
			in float angle;

			${samplerVar("spriteSheet")}

			out vec4 outColor;

			${samplerVar("water")}
			${idxFunc("water")}
			vec3 gammaCorrect(vec3 col){
				float gammaExp=${1./2.2};
				return vec3(pow(col.x,gammaExp),pow(col.y,gammaExp),pow(col.z,gammaExp));
			}
			vec3 gammaShift(vec3 col){
				float gammaExp=2.2;
				return vec3(pow(col.x,gammaExp),pow(col.y,gammaExp),pow(col.z,gammaExp));
			}
			float getWaterline(float x,float y){
				if(y<-500.){
					return 0.;
				}
				float between=mod(x,100.)/100.;

				float idx=mod(floor(x/100.),100.);

				float idx1=idx;
				float idx2=mod(idx+1.,100.);

				float y1=waterAtIdx(uint(idx1));
				float y2=waterAtIdx(uint(idx2));

				return mix(y1,y2,between);
			}
			float overlayPart(float a,float b){
				if(b==0.){
					return 0.;
				}
				if(a<0.5){
					return 2.*a*b;
				}else{
					return 1.-2.*(1.-a)*(1.-b);
				}
			}
			vec3 overlay(vec3 a,vec3 b){
				return vec3(
					overlayPart(a.x,b.x),
					overlayPart(a.y,b.y),
					overlayPart(a.z,b.z)
				);
			}

			void main(){
				vec4 col=texture(spriteSheet,texCoord/spriteSheetResolution);
				if(col.w==0.){
					discard;
					return;
				}
				vec2 metaTexCoord=texCoord;//TODO: firefox color spaces are slightly off
				metaTexCoord.y+=texSize.y+1.;

				float ang=-angle;

				vec3 lightDir=normalize(vec3(cos(ang),sin(ang),1.));
				vec4 metaCol=texture(spriteSheet,(metaTexCoord)/spriteSheetResolution);
				if(metaCol.w>0.&&metaCol.xy!=vec2(0.)){
					metaCol=(metaCol-.5)*2.;
					vec2 nrm=metaCol.xy;
					float light=dot(
							lightDir,
							normalize(vec3(nrm,.25))
						);
					float lightShade=0.5;
					// float dither=(mod(floor(metaTexCoord.x)+floor(metaTexCoord.y),2.)-1.)*.1;
					// float dither=0.;
					// float dX=mod(floor(metaTexCoord.x),3.);
					// float dY=mod(floor(metaTexCoord.y),3.);
					// if(dX==dY){
					// 	dither=1.;
					// }
					// if(dX==2.&&dY==0.){
					// 	dither=1.;
					// }
					// if(dY==2.&&dX==0.){
					// 	dither=1.;
					// }
					// dither*=0.1;
					light+=metaCol.z;
					if(light>0.98){
						lightShade=.8;
					}else if(light>0.8){
						lightShade=.6;
					}else if(light<0.1){
						lightShade=.3;
					}
					// lightShade=(light-0.5)*0.4+0.5;
					// col.xyz*=light*vec3(1.);
					col.xyz=overlay(vec3(lightShade),col.xyz);
					// col.xyz*=vec3(lightShade)+vec3(0.5);
				}else{
					// col.x=1.;
				}

				float waterline=getWaterline(real.x,real.y);
				if(real.y<waterline){
					outColor=vec4(col);
				}else{
					float topX=real.x-real.y*0.5;
					float waterline1=getWaterline(topX-50.,real.y);
					float waterline2=getWaterline(topX+50.,real.y);

					float depthReal=real.y;
					float depthWater=real.y-waterline;
					float scale=min(max(1.-depthReal/500.,0.),1.);
					float depthScaled=mix(depthReal,depthWater,scale);
					float depth=min(max(1.-depthScaled/3000.,0.),1.);
					float depth1=pow(depth,20.);
					float depth2=pow(depth,5.);
					float depth3=pow(depth,4.);
					vec3 ambient=vec3(0.,0.02,.05);
					vec3 water=vec3(0.1*depth1,.9*depth2,0.8*depth3);

					if(depthWater<20.){
						water*=0.9;
					}
					vec3 shade=water+ambient;
					shade.x=pow(shade.x,1.5);
					shade.y=pow(shade.y,1.5);
					shade.z=pow(shade.z,1.5);
					outColor=vec4(gammaCorrect(shade)*col.xyz,col.w);
				}
			}
		`;
		let spriteSheetTex=toTexture({
			src: "img/sprites.png",
			minMag: gl.NEAREST,
			wrap: gl.CLAMP_TO_EDGE
		},(_,__,img)=>{
			textures.spriteSheetSize=[img.width,img.height];
			this.loaded=true;
		});
		textures.spriteSheetTex=spriteSheetTex;

		let programInfo=twgl.createProgramInfo(gl,[vs,fs]);

		this.programInfo=programInfo;
	}
	run(cam){

		if(this.count<=0||!this.loaded)
			return;
		twgl.resizeCanvasToDisplaySize(gl.canvas);
		gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

		let uniforms={
			resolution: [gl.canvas.width,gl.canvas.height],

			waterResolution: [textures.waterBox.width,textures.waterBox.height],
			water: textures.waterTex,

			spriteSheetResolution:textures.spriteSheetSize,
			spriteSheet: textures.spriteSheetTex,

			camPos:[cam.pos.x,cam.pos.y],
			camZoom:cam.zoom,
			random:Math.random(),
		};
		let arrays={
			position:{
				numComponents:2,
				data:this.position
			},
			rotation:{
				numComponents:2,
				data:this.rotation
			},
			texturePos:{
				numComponents:2,
				data:this.texturePos
			},
			textureSize:{
				numComponents:2,
				data:this.textureSize
			},
			objectPos:{
				numComponents:2,
				data:this.objectPos
			},
			objectSize:{
				numComponents:2,
				data:this.objectSize
			},
			offset:{
				numComponents:2,
				data:this.offset
			},
			objectAngle:{
				numComponents:1,
				data:this.objectAngle
			},
			indices:{
				numComponents:3,
				data:this.indices
			}
		};

		let bufferInfo=twgl.createBufferInfoFromArrays(gl,arrays);

		gl.useProgram(this.programInfo.program);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		twgl.setBuffersAndAttributes(gl, this.programInfo, bufferInfo);
		twgl.setUniforms(this.programInfo, uniforms);
		twgl.drawBufferInfo(gl, bufferInfo);
	}
}
class BulletShader{
	constructor(){
		this.init();
		this.prime();
	}
	prime(){
		this.position=[];
		this.objectPos=[];
		this.objectVelo=[];
		this.objectSize=[];
		this.objectColor=[];
		this.objectAge=[];
		this.indices=[];
		this.count=0;
	}
	line(x,y,size,veloX,veloY,age,colorR,colorG,colorB){
		this.position.push(
			1, 1,
			1, -1,
			-1, 1,
			-1, -1
		);
		this.objectPos.push(
			x,y,
			x,y,
			x,y,
			x,y,
		);
		this.objectVelo.push(
			veloX,veloY,
			veloX,veloY,
			veloX,veloY,
			veloX,veloY,
		);
		this.objectSize.push(
			size,size,size,size
		);
		this.objectColor.push(
			colorR,colorG,colorB,
			colorR,colorG,colorB,
			colorR,colorG,colorB,
			colorR,colorG,colorB
		);
		this.objectAge.push(
			age,age,age,age
		);
		this.indices.push(
			this.count+0,this.count+1,this.count+2,
			this.count+1,this.count+2,this.count+3
		);
		this.count+=4;
	}
	init(){
		let vs=glsl`#version 300 es
			in vec4 position;

			in vec2 objectPos;
			in vec2 objectVelo;
			in float objectSize;
			in vec3 objectColor;
			in float objectAge;
			uniform vec2 resolution;

			uniform vec2 camPos;
			uniform float camZoom;

			out vec2 real;
			out vec2 center;
			out float size;
			out vec2 velo;
			out vec3 color;

			void main(){
				float leng=min(objectAge,3.);
				vec4 pos=position;
				float mag=length(objectVelo*leng);
				bool moving=objectVelo.x!=0.||objectVelo.y!=0.;
				vec2 rotation=moving?
					normalize(objectVelo):
					vec2(1.,0.);

				vec2 oS=vec2(objectSize);
				if(position.x==-1.&&objectAge>0.&&moving){
					oS.x+=mag+objectSize;
				}
				pos.xy*=oS;

				pos.xy=vec2(
					pos.x*rotation.x - pos.y*rotation.y,
					pos.x*rotation.y + pos.y*rotation.x);
				vec2 realPos=pos.xy+objectPos;
				pos.xy+=objectPos-camPos;
				pos.xy*=camZoom/resolution;

				pos.xy=pos.xy*2.-1.;
				pos.y*=-1.;

				gl_Position=pos;
  				real=realPos;
				center=objectPos;
				size=objectSize*2.;
				color=objectColor;
				velo=objectVelo*leng*2.;
			}
		`;

		let fs=glsl`#version 300 es
			precision highp float;
			uniform vec2 resolution;
			in vec2 real;
			in vec2 center;
			in float size;
			in vec2 velo;
			in vec3 color;

			out vec4 outColor;

			${samplerVar("water")}
			${idxFunc("water")}
			vec3 gammaCorrect(vec3 col){
				float gammaExp=${1./2.2};
				return vec3(pow(col.x,gammaExp),pow(col.y,gammaExp),pow(col.z,gammaExp));
			}
			vec3 gammaShift(vec3 col){
				float gammaExp=2.2;
				return vec3(pow(col.x,gammaExp),pow(col.y,gammaExp),pow(col.z,gammaExp));
			}
			float getWaterline(float x,float y){
				if(y<-500.){
					return 0.;
				}
				float between=mod(x,100.)/100.;

				float idx=mod(floor(x/100.),100.);

				float idx1=idx;
				float idx2=mod(idx+1.,100.);

				float y1=waterAtIdx(uint(idx1));
				float y2=waterAtIdx(uint(idx2));

				return mix(y1,y2,between);
			}

			void main(){
				float mag=length(velo);
				float centerDist=max(1.-length(real-center)/size,0.);
				// vec3 col=gammaCorrect(
				// 	vec3(.9,.2,.05)*mix(5.,1.,pow(dist,3.))
				// );
				float veloDist1=1.-abs(dot(
					center-real,
					normalize(vec2(velo.y,-velo.x))
				))/size;
				if(dot(center-real,velo)<0.){
					veloDist1=0.;
				}
				float dist=max(veloDist1,centerDist)*
					pow(min(1.-(length(real-center)-size)/mag,1.),1.);
				vec3 col=color*pow(.5+dist,2.);
				if(dist<=0.5){
					discard;
					return;
				}
				float waterline=getWaterline(real.x,real.y);
				if(real.y<waterline){
					outColor=vec4(col,1.);
				}else{
					float topX=real.x-real.y*0.5;
					float waterline1=getWaterline(topX-50.,real.y);
					float waterline2=getWaterline(topX+50.,real.y);

					float depthReal=real.y;
					float depthWater=real.y-waterline;
					float scale=min(max(1.-depthReal/500.,0.),1.);
					float depthScaled=mix(depthReal,depthWater,scale);
					float depth=min(max(1.-depthScaled/3000.,0.),1.);
					float depth1=pow(depth,20.);
					float depth2=pow(depth,5.);
					float depth3=pow(depth,4.);
					vec3 ambient=vec3(0.,0.02,.05);
					vec3 water=vec3(0.1*depth1,.9*depth2,0.8*depth3);

					if(depthWater<20.){
						water*=0.9;
					}
					vec3 shade=water+ambient;
					shade.x=pow(shade.x,1.5);
					shade.y=pow(shade.y,1.5);
					shade.z=pow(shade.z,1.5);
					outColor=vec4(gammaCorrect(shade)*col,1.);
				}
			}
		`;

		let programInfo=twgl.createProgramInfo(gl,[vs,fs]);

		this.programInfo=programInfo;
	}
	run(cam){

		if(this.count<=0)
			return;
		twgl.resizeCanvasToDisplaySize(gl.canvas);
		gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

		let uniforms={
			resolution: [gl.canvas.width,gl.canvas.height],

			waterResolution: [textures.waterBox.width,textures.waterBox.height],
			water: textures.waterTex,

			camPos:[cam.pos.x,cam.pos.y],
			camZoom:cam.zoom,
			random:Math.random(),
		};
		let arrays={
			position:{
				numComponents:2,
				data:this.position
			},
			objectPos:{
				numComponents:2,
				data:this.objectPos
			},
			objectVelo:{
				numComponents:2,
				data:this.objectVelo
			},
			objectSize:{
				numComponents:1,
				data:this.objectSize
			},
			objectColor:{
				numComponents:3,
				data:this.objectColor
			},
			objectAge:{
				numComponents:1,
				data:this.objectAge
			},
			indices:{
				numComponents:3,
				data:this.indices
			}
		};

		let bufferInfo=twgl.createBufferInfoFromArrays(gl,arrays);

		gl.useProgram(this.programInfo.program);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		twgl.setBuffersAndAttributes(gl, this.programInfo, bufferInfo);
		twgl.setUniforms(this.programInfo, uniforms);
		twgl.drawBufferInfo(gl, bufferInfo);
	}
}
class ParticleShader{
	constructor(){
		this.init();
		this.prime();
	}
	prime(){
		this.position=[];
		this.objectPos=[];
		this.objectVelo=[];
		this.objectSize=[];
		this.objectColor=[];
		this.objectAirOnly=[];
		this.indices=[];
		this.count=0;
	}
	spot(x,y,size,veloX,veloY,colorR,colorG,colorB,airOnly){
		this.position.push(
			1, 1,
			1, -1,
			-1, 1,
			-1, -1
		);
		this.objectPos.push(
			x,y,
			x,y,
			x,y,
			x,y,
		);
		this.objectVelo.push(
			veloX,veloY,
			veloX,veloY,
			veloX,veloY,
			veloX,veloY,
		);
		this.objectSize.push(
			size,size,size,size
		);
		this.objectColor.push(
			colorR,colorG,colorB,
			colorR,colorG,colorB,
			colorR,colorG,colorB,
			colorR,colorG,colorB
		);
		this.objectAirOnly.push(
			airOnly,airOnly,airOnly,airOnly
		)
		this.indices.push(
			this.count+0,this.count+1,this.count+2,
			this.count+1,this.count+2,this.count+3
		);
		this.count+=4;
	}
	init(){
		let vs=glsl`#version 300 es
			in vec4 position;

			in vec2 objectPos;
			in vec2 objectVelo;
			in float objectSize;
			in vec3 objectColor;
			in float objectAirOnly;
			uniform vec2 resolution;

			uniform vec2 camPos;
			uniform float camZoom;

			out vec2 real;
			out vec2 center;
			out float size;
			out vec2 velo;
			out vec3 color;
			out float airOnly;
			
			void main(){
				float leng=4.;
				vec4 pos=position;
				float mag=length(objectVelo*leng);
				bool moving=objectVelo.x!=0.||objectVelo.y!=0.;
				vec2 rotation=moving?
					normalize(objectVelo):
					vec2(1.,0.);

				vec2 oS=vec2(objectSize);
				if(position.x==-1.&&moving){
					oS.x+=mag;
				}
				pos.xy*=oS;

				pos.xy=vec2(
					pos.x*rotation.x - pos.y*rotation.y,
					pos.x*rotation.y + pos.y*rotation.x);
				vec2 realPos=pos.xy+objectPos;
				pos.xy+=objectPos-camPos;
				pos.xy*=camZoom/resolution;

				pos.xy=pos.xy*2.-1.;
				pos.y*=-1.;

				gl_Position=pos;
  				real=realPos;
				center=objectPos;
				size=objectSize;
				color=objectColor;
				velo=objectVelo*4.;
				airOnly=objectAirOnly;
			}
		`;

		let fs=glsl`#version 300 es
			precision highp float;
			uniform vec2 resolution;
			in vec2 real;
			in vec2 center;
			in float size;
			in vec2 velo;
			in vec3 color;
			in float airOnly;

			out vec4 outColor;

			${samplerVar("water")}
			${idxFunc("water")}
			vec3 gammaCorrect(vec3 col){
				float gammaExp=${1./2.2};
				return vec3(pow(col.x,gammaExp),pow(col.y,gammaExp),pow(col.z,gammaExp));
			}
			vec3 gammaShift(vec3 col){
				float gammaExp=2.2;
				return vec3(pow(col.x,gammaExp),pow(col.y,gammaExp),pow(col.z,gammaExp));
			}
			float getWaterline(float x,float y){
				if(y<-500.){
					return 0.;
				}
				float between=mod(x,100.)/100.;

				float idx=mod(floor(x/100.),100.);

				float idx1=idx;
				float idx2=mod(idx+1.,100.);

				float y1=waterAtIdx(uint(idx1));
				float y2=waterAtIdx(uint(idx2));

				return mix(y1,y2,between);
			}

			void main(){
				float mag=length(velo);
				float centerDist1=max(1.-length(real-center)/size,0.);
				float centerDist2=max(1.-length(real+velo-center)/size,0.);
				if(dot(center-real,velo)>0.){
					centerDist1=1.;
				}
				if(dot(center-real-velo,velo)<0.){
					centerDist2=1.;
				}
				float dist=min(centerDist2,centerDist1);
				if(dist<=0.){
					discard;
					return;
				}

				float waterline=getWaterline(real.x,real.y);
				if(real.y<waterline){
					if(airOnly==-1.){
						discard;
						return;
					}
					outColor=vec4(color,1.);
				}else{
					if(airOnly==1.){
						discard;
						return;
					}
					float topX=real.x-real.y*0.5;
					float waterline1=getWaterline(topX-50.,real.y);
					float waterline2=getWaterline(topX+50.,real.y);

					float depthReal=real.y;
					float depthWater=real.y-waterline;
					float scale=min(max(1.-depthReal/500.,0.),1.);
					float depthScaled=mix(depthReal,depthWater,scale);
					float depth=min(max(1.-depthScaled/3000.,0.),1.);
					float depth1=pow(depth,20.);
					float depth2=pow(depth,5.);
					float depth3=pow(depth,4.);
					vec3 ambient=vec3(0.,0.02,.05);
					vec3 water=vec3(0.1*depth1,.9*depth2,0.8*depth3);

					if(depthWater<20.){
						water*=0.9;
					}
					vec3 shade=water+ambient;
					outColor=vec4(gammaCorrect(shade)*color,1.);
				}
			}
		`;

		let programInfo=twgl.createProgramInfo(gl,[vs,fs]);

		this.programInfo=programInfo;
	}
	run(cam){

		if(this.count<=0)
			return;
		twgl.resizeCanvasToDisplaySize(gl.canvas);
		gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

		let uniforms={
			resolution: [gl.canvas.width,gl.canvas.height],

			waterResolution: [textures.waterBox.width,textures.waterBox.height],
			water: textures.waterTex,

			camPos:[cam.pos.x,cam.pos.y],
			camZoom:cam.zoom,
			random:Math.random(),
		};
		let arrays={
			position:{
				numComponents:2,
				data:this.position
			},
			objectPos:{
				numComponents:2,
				data:this.objectPos
			},
			objectVelo:{
				numComponents:2,
				data:this.objectVelo
			},
			objectSize:{
				numComponents:1,
				data:this.objectSize
			},
			objectColor:{
				numComponents:3,
				data:this.objectColor
			},
			objectAge:{
				numComponents:1,
				data:this.objectAge
			},
			objectAirOnly:{
				numComponents:1,
				data:this.objectAirOnly
			},
			indices:{
				numComponents:3,
				data:this.indices
			}
		};

		let bufferInfo=twgl.createBufferInfoFromArrays(gl,arrays);

		gl.useProgram(this.programInfo.program);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		twgl.setBuffersAndAttributes(gl, this.programInfo, bufferInfo);
		twgl.setUniforms(this.programInfo, uniforms);
		twgl.drawBufferInfo(gl, bufferInfo);
	}
}