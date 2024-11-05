let SHADER_FUNCS={
	DATA_TEX:glsl`
		ivec2 getIdxCoord(int idx,vec2 size){
			int width=int(size.x);
		
			int y=idx/width;
			int x=idx-(y*width);

			if(y<0||y>=int(size.y)){
				return ivec2(-1);
			}
			return ivec2(x,y);
		}
		vec2 getIdxPos(int idx,vec2 size){
			ivec2 coord=getIdxCoord(idx,size);
			if(coord.x==-1){
				return vec2(-1.);
			}
			//sample from center of the pixel
			return (vec2(coord)+.5)/size;
		}
	`,
	HASH:glsl`
		//1 out, 1 in...
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
		//  1 out, 3 in...
		float hash13(vec3 p3){
			p3  = fract(p3 * .1031);
			p3 += dot(p3, p3.zyx + 31.32);
			return fract((p3.x + p3.y) * p3.z);
		}
		// 4 out, 2 in...
		vec4 hash42(vec2 p){
			vec4 p4 = fract(vec4(p.xyxy) * vec4(.1031, .1030, .0973, .1099));
			p4 += dot(p4, p4.wzxy+33.33);
			return fract((p4.xxyz+p4.yzzw)*p4.zywx);

		}
	`,
	GAMMA:glsl`
		vec3 gammaCorrect(vec3 col){
			float gammaExp=${1./2.2};
			return vec3(pow(col.x,gammaExp),pow(col.y,gammaExp),pow(col.z,gammaExp));
		}
		vec3 gammaShift(vec3 col){
			float gammaExp=2.2;
			return vec3(pow(col.x,gammaExp),pow(col.y,gammaExp),pow(col.z,gammaExp));
		}
	`,
	VECTOR:glsl`
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
		float nrmAngTAU(float ang){
			return mod(ang,TAU);
		}
		float nrmAngPI(float ang){
			return mod(ang+PI,TAU)-PI;
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
	`
};