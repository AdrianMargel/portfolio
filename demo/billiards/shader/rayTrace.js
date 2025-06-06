class RayTraceShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				#define PI ${PI}
				precision highp float;

				uniform sampler2D tex;
				uniform vec2 refPos;
				
				in vec2 pos;
				out vec4 outColor;
				
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

				// float angle(vec2 a,vec2 b){
				// 	return acos(dot(normalize(a),normalize(b)));
				// }
				float angle(vec2 a){
					return atan(a.y,a.x);
				}
				vec2 rotate(vec2 v,float a){
					float s=sin(a);
					float c=cos(a);
					mat2 m=mat2(c,s,-s,c);
					return m*v;
				}
				vec2 vecA(float mag,float ang){
					return vec2(cos(ang),sin(ang))*mag;
				}

				int modI(int a,int b){
					return int(mod(float(a),float(b)));
				}

				vec3 rayTrace(vec2 mid,float x,float rayAng){
					int pathIdx=0;
					// bool path[1000];

					vec2 corners[3]=vec2[](vec2(0,0),vec2(1,0),mid);
					float lengths[3]=float[](
						distance(corners[0],corners[1]),
						distance(corners[1],corners[2]),
						distance(corners[2],corners[0])
					);
					float angles[3]=float[](
						angle(corners[0]-corners[1]),
						angle(corners[1]-corners[2]),
						angle(corners[2]-corners[0])
					);
					float turns[3]=float[](
						angles[0]-angles[2]+PI,
						angles[1]-angles[0]+PI,
						angles[2]-angles[1]+PI
					);

					int[3] balance=int[](0,0,0);

					bool dir=true;
					int lineIdx=0;
					float ang=-rayAng;
					vec2 pos=rotate(corners[1]-vec2(x,0),-rayAng);
					vec2 anchor=rotate(corners[0]-vec2(x,0),-rayAng);
					bool invert=false;

					for(int i=0;i<1000;i++){
						if(dir){
							float nextLength=invert
								?lengths[lineIdx]
								:lengths[modI(lineIdx-1,3)];
							
							float nextAng=ang-turns[lineIdx];
							vec2 nextPos=anchor+vecA(
								nextLength,
								nextAng
							);
							if(nextPos.x>0.){
								balance[lineIdx]++;
								
								ang=nextAng;
								pos=nextPos;
								invert=!invert;
								// path[pathIdx++]=false;
								pathIdx++;
							}else{
								dir=!dir;
								anchor=pos;
								ang=ang+PI;
								if(invert){
									lineIdx=modI(lineIdx-1,3);
								}else{
									lineIdx=modI(lineIdx+1,3);
								}
							}
						}else{
							float nextLength=invert
								?lengths[modI(lineIdx-1,3)]
								:lengths[lineIdx];

							float nextAng=ang+turns[lineIdx];
							vec2 nextPos=anchor+vecA(
								nextLength,
								nextAng
							);
							if(nextPos.x<0.){
								balance[lineIdx]--;

								ang=nextAng;
								pos=nextPos;
								invert=!invert;
								// path[pathIdx++]=true;
								pathIdx++;
							}else{
								dir=!dir;
								anchor=pos;
								ang=ang+PI;
								if(invert){
									lineIdx=modI(lineIdx+1,3);
								}else{
									lineIdx=modI(lineIdx-1,3);
								}
							}
						}
						if(i!=0&&balance[0]==0&&balance[1]==0&&balance[2]==0){
							vec2 start=corners[int(invert)];

							return vec3(pathIdx,angle(anchor-start),distance(anchor,start));
							// return vec3(angle(anchor-start)*10.,pathIdx,distance(anchor,start));
						}
					}
					return vec3(-1,0,-1);
				}
				void main(){
					vec2 pos2=(pos+1.)*.5;
					// pos2*=2.;

					vec3 val=rayTrace(pos2,clamp(refPos.x,0.,1.),clamp(refPos.y,-1.,1.)*PI);

					// vec3 dispVal=vec3(
					// 	val.x/PI*2.,
					// 	1.,
					// 	clamp(val.z*1.,0.,1.)
					// );
					vec3 dispVal=vec3(
						val.y*10.,
						1.,
						clamp(val.x,0.,1.)
					);
					outColor=vec4(hsv2rgb(dispVal),clamp(val.z*1.,0.,1.));
				}
			`,
		);
	}
	run(path,refPos,triangleTex){
		this.uniforms={
			size:triangleTex.size,
			path,
			refPos:Vec(refPos.x,refPos.y-.5),
		};
		this.attachments=[
			{
				attachment:triangleTex.tex,
				...sizeObj(triangleTex.size)
			}
		];
		super.run();
	}
}