
SHADER_FUNCS.RADIANCE=glsl`

struct Level{
	float idx;
	float leng;
	float scale;//Grid Scale
	vec2 dims;
	vec2 size;
};
struct Cascade{
	float idx;
	float leng;
	float radius;//Cascade Scale
	vec2 pos;
};
struct Probe{
	float idx;
	float leng;
	float ang;
	vec2 dir;
	vec2 pos;
};
struct Ray{
	float idx;
	float ang;
	vec2 dir;
	vec2 pos;
};

float getLevelScale(float levelIdx){
	return pow(branching,levelIdx);
}
float getCascadeRadius(float levelIdx){
	// if(levelIdx==0.){//TODO
	// 	return 0.;
	// }
	return pow(branching,levelIdx)*${sqrt(2)}/2.*1.001;//(cos(t/50.)+1.)*25.;
}
float getCascadeLength(float levelIdx){
	return pow(branching,levelIdx)*4.;
}
float getProbeLength(float levelIdx){
	return pow(branching,levelIdx)*2.;
}

Level newLevel(float levelIdx,vec2 boundarySize){
	float scale=getLevelScale(levelIdx);
	vec2 dims=ceil(boundarySize/scale);
	return Level(
		levelIdx,
		dims.x*dims.y,
		scale,
		dims,
		dims*scale
	);
}
Cascade newCascade(float cascadeIdx,Level level){
	vec2 coord=vec2(getIdxCoord(int(cascadeIdx),level.dims));
	vec2 pos=(coord+.5)*level.scale;
	return Cascade(
		cascadeIdx,
		getCascadeLength(level.idx),
		getCascadeRadius(level.idx),
		pos
	);
}
Cascade newCascade(vec2 pos,Level level){
	vec2 coord=floor(pos/level.scale);
	float cascadeIdx=coord.y*level.dims.x+coord.x;
	return newCascade(mod(cascadeIdx,level.leng),level);
}
Probe newProbe(float probeIdx,Cascade cascade,Level level){
	// float ang=(probeIdx+.5)/cascade.leng*TAU;
	float ang=(probeIdx)/cascade.leng*TAU;
	vec2 dir=vec2(cos(ang),sin(ang));
	return Probe(
		mod(probeIdx,cascade.leng),
		getProbeLength(level.idx),
		ang,
		dir,
		cascade.pos+dir*cascade.radius
	);
}
Ray newRay(float rayIdx,Probe probe){
	float angOffset=probe.ang-PI/2.;
	float ang=(rayIdx+.5)/(probe.leng)*PI+angOffset;
	// float ang=rayIdx/(probe.leng-1.)*PI+angOffset;
	vec2 dir=vec2(cos(ang),sin(ang));
	return Ray(
		rayIdx,
		ang,
		dir,
		probe.pos
	);
}
vec2 rot(vec2 p,float r){
	float sn=sin(r);
	float cs=cos(r);
	// return vec2(
	// 	cs*p.x-sn*p.y,
	// 	sn*p.x+cs*p.y
	// );
    return mat2(cs,sn,-sn,cs)*p;
}
float angle(vec2 a,vec2 b){
	return atan(b.y-a.y,b.x-a.x);
}
vec2 intersect(vec2 linePos,float ang,vec2 circlePos,float radius){
	vec2 a=circlePos;
	a-=linePos;
	a=rot(a,-ang);

	if(radius<a.y){
		return linePos;
	}
	float intersectX=sqrt(pow(radius,2.)-pow(a.y,2.));
	a.x+=intersectX;
	a.y=0.;
	a=rot(a,ang);
	a+=linePos;
	return a;
}
vec4 getAt(Level level,Cascade cascade,Probe probe,Ray ray){
	ray.idx=clamp(ray.idx,0.,probe.leng-1.);//TODO
	if(ray.idx>=probe.leng||ray.idx<0.){
		return vec4(1.,0.,0.,1.);//TODO
	}
	if(probe.idx>=cascade.leng||probe.idx<0.){
		return vec4(0.,1.,0.,1.);//TODO
	}
	float idx=cascade.idx*cascade.leng*probe.leng
		+probe.idx*probe.leng
		+ray.idx;
	return texelFetch(radianceTex,getIdxCoord(int(idx),radianceSize),0);
}

float nrmAngTAU(float ang){
	return mod(ang,TAU);
}
float nrmAngPI(float ang){
	return mod(ang+PI,TAU)-PI;
}
vec3 mergeSegments(vec3 a,vec3 b){
	// return vec3(max(a.x,b.x),min(a.y,b.y),0.);
	// Assume there is never more than a single overlap even though it could loop around
	float aDist=a.y-a.x;
	float bDist=b.y-b.x;
	if(bDist>=TAU){
		return a;
	}
	float start=nrmAngTAU(b.x-a.x);
	float end=nrmAngTAU(b.y-a.x);
	if(end<bDist){
		return vec3(
			a.x,
			min(end,aDist)+a.x,
			0.
		);
	}else{
		return vec3(//TODO:check
			start+a.x,
			min(end,aDist)+a.x,
			0.
		);
	}
}
vec3 transformSegment(vec3 seg,float offset,float scale){
	return vec3(
		nrmAngPI(seg.x-offset)/scale,//TODO:check
		nrmAngPI(seg.y-offset)/scale,
		seg.z
	);
}
vec2 toEquation(vec3 seg){
	if(seg.z==1.){
		seg.xy=seg.yx;
	}
	return vec2(
		-1./(seg.x-seg.y),
		seg.x/(seg.x-seg.y)
	);
}
float integral(vec2 eqA){
	float a=eqA.x;
	float b=eqA.y;

	return a/2. + b;
}
float integral(vec2 eqA,vec2 eqB){
	float a=eqA.x;
	float b=eqA.y;

	float c=eqB.x;
	float d=eqB.y;
	return 1./6.*(2.*a*c + 3.*b*c + 3.*a*d + 6.*b*d);
}
float integral(vec2 eqA,vec2 eqB,vec2 eqC){
	float a=eqA.x;
	float b=eqA.y;

	float c=eqB.x;
	float d=eqB.y;

	float e=eqC.x;
	float f=eqC.y;
	return (1./12.)*(2.*b*(2.*c*e + 3.*d*e + 3.*c*f + 6.*d*f) + a*(3.*c*e + 4.*d*e + 4.*c*f + 6.*d*f));
}
float integral(vec3 segA,vec3 segB,vec3 segC){
	vec3 seg=mergeSegments(mergeSegments(segA,segB),segC);
	float start=seg.x;
	float end=seg.y;
	float dist=max(end-start,0.);
	if(dist==0.){
		return 0.;
	}
	// return dist;
	vec3 segA2=transformSegment(segA,start,dist);
	vec3 segB2=transformSegment(segB,start,dist);
	vec3 segC2=transformSegment(segC,start,dist);
	vec2 eqA=toEquation(segA2);
	vec2 eqB=toEquation(segB2);
	vec2 eqC=toEquation(segC2);
	return integral(eqA,eqB,eqC)*dist;
	// return integral(eqA)*dist;
}
float integral(vec3 segA,vec3 segB){
	vec3 seg=mergeSegments(segA,segB);
	float start=seg.x;
	float end=seg.y;
	float dist=max(end-start,0.);
	if(dist==0.){
		return 0.;
	}
	// return dist;
	vec3 segA2=transformSegment(segA,start,dist);
	vec3 segB2=transformSegment(segB,start,dist);
	vec2 eqA=toEquation(segA2);
	vec2 eqB=toEquation(segB2);
	return integral(eqA,eqB)*dist;
}

float[2] getProbeDomain(vec3 seg,vec2 origin,Cascade cascade){
	float start=seg.x;
	float end=seg.y;

	vec2 startPos=intersect(
		origin,start,
		cascade.pos,cascade.radius
	);
	vec2 endPos=intersect(
		origin,end,
		cascade.pos,cascade.radius
	);

	float startAng=angle(cascade.pos,startPos);
	float endAng=angle(cascade.pos,endPos);
	startAng=nrmAngTAU(startAng);
	endAng=nrmAngPI(endAng-startAng)+startAng;

	// float startIdx=floor(startAng/TAU*cascade.leng-.5);
	// float endIdx=ceil(endAng/TAU*cascade.leng-.5);
	float startIdx=floor(startAng/TAU*cascade.leng);
	float endIdx=ceil(endAng/TAU*cascade.leng);

	return float[2](startIdx,endIdx);
}
vec3 getProbeCone(float idx,vec2 origin,Cascade cascade,Level level){
	float mid=angle(
		origin,
		newProbe(idx,cascade,level).pos//TODO: simplify
	);
	float start=angle(
		origin,
		newProbe(idx-1.,cascade,level).pos
	);
	float end=angle(
		origin,
		newProbe(idx+1.,cascade,level).pos
	);

	mid=nrmAngTAU(mid);
	start=nrmAngPI(start-mid)+mid;
	end=nrmAngPI(end-mid)+mid;
	return vec3(start,mid,end);
}
float[2] getRayDomain(vec3 seg,Probe probe){
	float angOffset=probe.ang-PI/2.;
	float dist=seg.y-seg.x;
	float startAng=nrmAngPI(seg.x-angOffset);//This may be negative
	float endAng=startAng+dist;
	return float[2](
		floor(startAng/PI*(probe.leng)-.5),
		ceil(endAng/PI*(probe.leng)-.5)
		// floor(start/PI*(probe.leng-1.)),
		// ceil(end/PI*(probe.leng-1.))
	);
}
vec3 getRayCone(float idx,Probe probe){
	float mid=newRay(idx,probe).ang;
	float start=newRay(idx-1.,probe).ang;
	float end=newRay(idx+1.,probe).ang;
	return vec3(start,mid,end);
}
vec3 getRayCone2(float idx,Probe probe){
	float mid=newRay(idx,probe).ang;
	float start=newRay(idx-1.,probe).ang;//TODO
	float end=newRay(idx+1.,probe).ang;
	return vec3(start,mid,end);
}
vec3[2] getSegments(vec3 cone){
	return vec3[2](
		vec3(cone.x,cone.y,0.),
		vec3(cone.y,cone.z,1.)
	);
}
`;

class RadianceShader extends Shader{
	constructor(){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				#define PI ${PI}
				precision highp float;
				precision highp isampler2D;

				uniform sampler2D worldTex;
				uniform vec2 worldSize;
				uniform vec2 boundarySize;
				uniform sampler2D radianceTex;
				uniform vec2 radianceSize;
				uniform float levelIdx;
				uniform float branching;

				uniform float t;

				flat out vec4 vColor;
				
				${SHADER_FUNCS.DATA_TEX}
				${SHADER_FUNCS.RADIANCE}

				float screen(float a,float b){
					return 1.-((1.-a)*(1.-b));
				}

				// A <--> A
				vec4 mergeAA(vec4 ray1,vec4 ray2,float mx){
					return mix(ray1,ray2,mx);
				}
				// A --> B
				vec4 mergeAB(vec4 ray1,vec4 ray2){
					return vec4(
						ray1.xyz+ray2.xyz*ray2.w*(1.-ray1.w),
						screen(ray1.w,ray2.w)
					);
					// return max(ray1,ray2);
				}

				vec4 castRay(vec2 start,vec2 end){
					vec2 dir=end-start;
					float dist=length(dir);
					dir/=dist;

					vec4 val=vec4(0);
					float stepDist=2.;//TODO
					for(float s=0.;s<=dist;s+=stepDist){
						vec2 rayPos=start+dir*s;
						vec2 samplePos=rayPos/worldSize;//TODO
						samplePos=vec2(samplePos.x,1.-samplePos.y);//invert y
						vec2 pixel=1./worldSize;
						// samplePos=mod(samplePos,1.);
						vec4 rayVal;
						if(samplePos.x<=0.||samplePos.x>=1.-pixel.x||samplePos.y<=0.||samplePos.y>=1.-pixel.y){
							rayVal=vec4(0.,0.,0.,1.);
						}else{
							rayVal=texture(worldTex,samplePos);
							// if(rayVal.xyz==vec3(0.)){
							// 	rayVal.w=0.;
							// }
							// rayVal.w*=.1;
						}
						// rayVal*=2.-(s/dist);

						val=mergeAB(val,rayVal);
						if(val.w>=1.){//TODO: decide tolerance
							break;
						}
					}
					return val;
				}

				void main(){
					gl_PointSize=1.;
					float idx=float(gl_VertexID);
					// Setup data
					float cascadeLength=getCascadeLength(levelIdx);
					float probeLength=getProbeLength(levelIdx);
					
					float cascadeIdx=floor(idx/(cascadeLength*probeLength));
					float probeIdx=mod(floor(idx/probeLength),cascadeLength);
					float rayIdx=mod(idx,probeLength);
					
					// Get ray value
					vec4 rayVal;
					vec2 realPos1;
					vec2 realPos2;
					{
						// Setup data
						Level level=newLevel(levelIdx,boundarySize);
						Cascade cascade=newCascade(cascadeIdx,level);
						Probe probe=newProbe(probeIdx,cascade,level);
						Ray ray=newRay(rayIdx,probe);

						realPos1=cascade.pos;

						Level nextLevel=newLevel(levelIdx+1.,boundarySize);
						Cascade nextCascade=newCascade(realPos1,nextLevel);

						// Cast ray
						vec2 intersect=intersect(
							ray.pos,ray.ang,
							nextCascade.pos,nextCascade.radius
						);
						rayVal=castRay(
							ray.pos,
							intersect
						);
						realPos2=ray.pos;
					}

					// Get cascade value
					vec4 cascadeVal;
					{
						// Setup data
						Level level=newLevel(levelIdx+1.,boundarySize);
						Cascade cascade=newCascade(realPos1,level);
						
						Level sourceLevel=newLevel(levelIdx,boundarySize);//TODO: reuse
						Cascade sourceCascade=newCascade(cascadeIdx,sourceLevel);
						// Cascade sourceCascade=newCascade(realPos1,sourceLevel);
						Probe sourceProbe=newProbe(probeIdx,sourceCascade,sourceLevel);

						vec4 valSum;
						float weightSum;

						// VIEW
						{
							vec3 viewCone=getRayCone2(rayIdx,sourceProbe);//TODO:why the offset?<<>>
							vec3[2] viewSegs=getSegments(viewCone);
							for(float viewSegI=0.;viewSegI<2.;viewSegI++){
								vec3 viewSeg=viewSegs[int(viewSegI)];
								
								// PROBE
								float[2] probeDomain=getProbeDomain(viewSeg,realPos2,cascade);
								for(float probeI=probeDomain[0];probeI<=probeDomain[1];probeI++){
									Probe probe=newProbe(probeI,cascade,level);
									vec3 probeCone=getProbeCone(probeI,realPos2,cascade,level);
									vec3[2] probeSegs=getSegments(probeCone);
									for(float probeSegI=0.;probeSegI<2.;probeSegI++){
										vec3 probeSeg=probeSegs[int(probeSegI)];

										// RAY
										float[2] rayDomain=getRayDomain(mergeSegments(probeSeg,viewSeg),probe);
										for(float rayI=rayDomain[0];rayI<=rayDomain[1];rayI++){
											Ray ray=newRay(rayI,probe);
											vec3 rayCone=getRayCone(rayI,probe);
											vec3[2] raySegs=getSegments(rayCone);
											for(float raySegI=0.;raySegI<2.;raySegI++){
												vec3 raySeg=raySegs[int(raySegI)];
												
												// VALUE
												float weight=integral(viewSeg,probeSeg,raySeg);
												vec4 val=getAt(level,cascade,probe,ray);
												valSum+=val*weight;
												weightSum+=weight;
											}
										}
									}
								}
							}
						}

						if(weightSum>0.){
							valSum/=weightSum;
						}
						cascadeVal=valSum;
					}

					// Return
					// Setup data
					Level level=newLevel(levelIdx,boundarySize);
					Cascade cascade=newCascade(cascadeIdx,level);
					Probe probe=newProbe(probeIdx,cascade,level);
					Ray ray=newRay(rayIdx,probe);
					// vec4 val=rayVal;
					// vec4 val=mergeAB(rayVal,cascadeVal);
					// vec4 val=vec4((ray.idx==8.||ray.idx==4.)&&probe.idx==7.);
					// vec4 val=vec4((ray.idx==9.)&&probe.idx==9.);
					// vec4 val=vec4(probe.idx==mod(floor(t*10.),probe.leng));
					vec4 val;
					// if(levelIdx==7.&&cascade.idx==10.){
					// 	val=vec4(
					// 		((probe.idx==probe.leng*3./8.&&ray.idx==100.)
					// 		||(probe.idx==190.&&ray.idx==130.))//130.//mod(t,256.)
					// 		&&cascade.idx==10.
					// 	);
						// val=vec4((ray.idx==8.)&&probe.idx==8.);
						// val=vec4((ray.idx==4.)&&probe.idx==4.);
						// val=vec4(
						// 	(probe.idx==probe.leng*3./8.&&ray.idx==400.)
						// 	||(probe.idx==100.&&ray.idx==50.)
						// );
					// }else{
						cascadeVal.w=1.;//TODO: why?
						val=mergeAB(rayVal,cascadeVal);
					// }
					// vec4 val=vec4(ray.idx==mod(floor(t),probe.leng)&&probe.idx==7.);
					// vec4 val=vec4(probe.idx==9.);
					
					vColor=val;
					gl_Position=vec4(getIdxPos(int(idx),radianceSize)*2.-1.,1.,1.);
				}
			`,
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;
				precision highp sampler2D;

				flat in vec4 vColor;
				out vec4 outColor;

				void main(){
					outColor=vColor;
				}
			`,
		);
		this.drawType=gl.POINTS;
	}
	run(level,boundarySize,radianceTexPP,worldTex){
		let branching=2.;
		let levelScale=pow(2.,level);
		let cascadeLength=pow(branching,level)*4.;
		let probeLength=pow(branching,level)*2.;
		
		let levelSize=boundarySize.cln().scl(1/levelScale).ceil();
		let levelLength=levelSize.x*levelSize.y*cascadeLength*probeLength;

		this.uniforms={
			worldTex:worldTex.tex,
			worldSize:boundarySize,
			boundarySize,
			radianceTex:radianceTexPP.tex,
			radianceSize:radianceTexPP.size,
			levelIdx:level,
			branching,
			t:this.t=(this.t??0)+1
		};
		this.attachments=[
			{
				attachment:radianceTexPP.flip().tex,
				...sizeObj(radianceTexPP.size)
			}
		];
		super.run(levelLength);
		// console.log("tex",probeTex.read(4,gl.RGBA,gl.FLOAT,Float32Array));
	}
}
class RadianceOutShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				#define PI ${PI}
				precision highp float;
				precision highp sampler2D;

				uniform vec2 boundarySize;
				uniform sampler2D radianceTex;
				uniform vec2 radianceSize;
				uniform float levelIdx;
				uniform float branching;

				uniform float t;
				
				in vec2 pos;

				out vec4 outColor;
				
				${SHADER_FUNCS.DATA_TEX}
				${SHADER_FUNCS.GAMMA}
				${SHADER_FUNCS.RADIANCE}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					vec2 realPos=pos2*boundarySize;
					// realPos=realPos*.25+vec2(0.,400.);
					
					// Setup data
					Level level=newLevel(levelIdx,boundarySize);
					Cascade cascade=newCascade(realPos,level);

					vec4 valSum;
					float weightSum;

					// VIEW
					{
						Level sourceLevel=newLevel(levelIdx-1.,boundarySize);//TODO: reuse
						Cascade sourceCascade=newCascade(realPos,sourceLevel);
						Probe sourceProbe=newProbe(0.,sourceCascade,sourceLevel);

						// vec3 viewCone=getRayCone(5.,sourceProbe);
						// vec3[2] viewSegs=getSegments(viewCone);
						// for(float viewSegI=0.;viewSegI<2.;viewSegI++){
						// 	vec3 viewSeg=viewSegs[int(viewSegI)];
							
							// PROBE
							// float[2] probeDomain=getProbeDomain(viewSeg,realPos,cascade);
							float[2] probeDomain=float[2](0.,cascade.leng-1.);
							for(float probeI=probeDomain[0];probeI<=probeDomain[1];probeI++){
								Probe probe=newProbe(probeI,cascade,level);
								vec3 probeCone=getProbeCone(probeI,realPos,cascade,level);
								vec3[2] probeSegs=getSegments(probeCone);
								for(float probeSegI=0.;probeSegI<2.;probeSegI++){
									vec3 probeSeg=probeSegs[int(probeSegI)];

									// RAY
									float[2] rayDomain=getRayDomain(probeSeg,probe);
									// float[2] rayDomain=float[2](0.,probe.leng-1.);
									for(float rayI=rayDomain[0];rayI<=rayDomain[1];rayI++){
										Ray ray=newRay(rayI,probe);
										vec3 rayCone=getRayCone(rayI,probe);
										vec3[2] raySegs=getSegments(rayCone);
										for(float raySegI=0.;raySegI<2.;raySegI++){
											vec3 raySeg=raySegs[int(raySegI)];
											
											// VALUE
											// float weight=integral(vec3(-1000.,1000.,0.),probeSeg,raySeg);
											float weight=integral(probeSeg,raySeg);
											vec4 val=getAt(level,cascade,probe,ray);
											valSum+=val*weight;
											weightSum+=weight;
										}
									}
								}
							}
						// }
					}
					
					if(weightSum>0.){
						valSum/=weightSum;
					}

					// outColor=vec4(gammaCorrect(val.xyz*15.*gammaShift(vec3(1.,.5,.1))),1.);
					outColor=vec4(gammaCorrect(valSum.xyz),1.);
					// outColor=vec4(val.www*10.,1.);
					// outColor=vec4(val.x,0.,val.w,1.);
				}
			`,
		);
	}
	run(level,boundarySize,radianceTex,outTex){
		let branching=2.;
		this.uniforms={
			boundarySize,
			radianceTex:radianceTex.tex,
			radianceSize:radianceTex.size,
			levelIdx:level,
			branching,
		};
		this.attachments=[
			{
				attachment:outTex.tex,
				...sizeObj(outTex.size)
			}
		];
		super.run();
	}
}