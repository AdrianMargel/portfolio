
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
struct Ray{
	float idx;
	float ang;
	vec2 dir;
	vec2 pos;
};

float getLevelScale(float levelIdx){
	return pow(2.,levelIdx);
}
float getCascadeRadius(float levelIdx){
	// if(levelIdx==0.){//TODO
	// 	return 0.;
	// }
	return pow(branching,levelIdx)*${sqrt(2)}/2.*1.001;//(cos(t/50.)+1.)*25.;
}
float getCascadeLength(float levelIdx){
	return pow(branching,levelIdx)*8.;
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
Ray newRay(float rayIdx,Cascade cascade){
	float ang=(rayIdx+.5)/cascade.leng*TAU;
	vec2 dir=vec2(cos(ang),sin(ang));
	return Ray(
		rayIdx,
		ang,
		dir,
		cascade.pos+dir*cascade.radius
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

vec4 getAt(Level level,Cascade cascade,Ray ray){
	float idx=cascade.idx*cascade.leng
		+ray.idx;
	return texelFetch(radianceTex,getIdxCoord(int(idx),radianceSize),0);
}

float nrmAngTAU(float ang){
	return mod(ang,TAU);
}
float nrmAngPI(float ang){
	return mod(ang+PI,TAU)-PI;
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
					
					float cascadeIdx=floor(idx/(cascadeLength));
					float rayIdx=mod(idx,cascadeLength);
					
					// Get ray value
					vec4 rayVal;
					vec2 realPos1;
					vec2 realPos2;
					{
						// Setup data
						Level level=newLevel(levelIdx,boundarySize);
						Cascade cascade=newCascade(cascadeIdx,level);
						Ray ray=newRay(rayIdx,cascade);

						realPos1=cascade.pos;

						Level nextLevel=newLevel(levelIdx+1.,boundarySize);
						Cascade nextCascade=newCascade(realPos1,nextLevel);

						// Cast ray
						// vec2 intersect=intersect(
						// 	ray.pos,ray.ang,
						// 	nextCascade.pos,nextCascade.radius
						// );
						rayVal=castRay(
							ray.pos,
							nextCascade.pos+ray.dir*nextCascade.radius
						);
						realPos2=ray.pos;
					}

					// Get cascade value
					// vec4 cascadeVal;
					// {
					// 	Level level=newLevel(levelIdx+1.,boundarySize);

					// 	Level sourceLevel=newLevel(levelIdx,boundarySize);//TODO: reuse
					// 	Cascade sourceCascade=newCascade(cascadeIdx,sourceLevel);

					// 	vec4 valSum;
					// 	float weightSum;
					// 	vec2 realPos3=floor(realPos1/level.scale-.5)*level.scale;

					// 	for(float x=0.;x<2.;x++){
					// 		for(float y=0.;y<2.;y++){
					// 			vec2 gridP=floor(realPos3/level.scale+vec2(x,y));
					// 			if(gridP.x<0.||gridP.x>=level.dims.x||gridP.y<0.||gridP.y>=level.dims.y){
					// 				continue;
					// 			}
					// 			Cascade cascade=newCascade(realPos3+vec2(x,y)*level.scale,level);

					// 			for(float i=0.;i<branching;i++){
					// 				Ray ray=newRay(rayIdx*branching+i,cascade);
					// 				vec2 diff=abs(cascade.pos-sourceCascade.pos)/level.scale;
					// 				float weight=1.-diff.x*diff.y;
					// 				vec4 val=getAt(level,cascade,ray);
					// 				valSum+=val*weight;
					// 				weightSum+=weight;
					// 			}
					// 		}
					// 	}

					// 	if(weightSum>0.){
					// 		valSum/=weightSum;
					// 	}
					// 	cascadeVal=valSum;
					// }
					// Get cascade value
					vec4 cascadeVal;
					{
						// Setup data
						Level level=newLevel(levelIdx+1.,boundarySize);
						Cascade cascade=newCascade(realPos1,level);
					
						vec4 valSum;
						float weightSum;
						{
							for(float i=0.;i<branching;i++){
								Ray ray=newRay(rayIdx*branching+i,cascade);
								float weight=1.;
								vec4 val=getAt(level,cascade,ray);
								valSum+=val*weight;
								weightSum+=weight;
							}
						}

						if(weightSum>0.){
							valSum/=weightSum;
						}
						cascadeVal=valSum;
					}

					// Return
					vec4 val;
					cascadeVal.w=1.;//TODO: why?
					val=mergeAB(rayVal,cascadeVal);
					
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
		let branching=4.;
		let levelScale=pow(2.,level);
		let cascadeLength=pow(branching,level)*8.;
		
		let levelSize=boundarySize.cln().scl(1/levelScale).ceil();
		let levelLength=levelSize.x*levelSize.y*cascadeLength;

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
					{
						for(float i=0.;i<cascade.leng;i++){
							Ray ray=newRay(i,cascade);
							float weight=1.;
							vec4 val=getAt(level,cascade,ray);
							valSum+=val*weight;
							weightSum+=weight;
						}
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
		let branching=4.;
		this.uniforms={
			boundarySize,
			radianceTex:radianceTex.tex,
			radianceSize:radianceTex.size,
			levelIdx:level,
			branching,
			t:this.t=(this.t??0)+1
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