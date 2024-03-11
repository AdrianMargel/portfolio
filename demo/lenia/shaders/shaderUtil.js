
function glsl(strings,...keys){
	return strings[0]+keys.map((k,i)=>k+strings[i+1]).join("");
}
function boxArray(arr,components=1,w=0){
	let length=arr.length/components;

	let width=w==0?Math.ceil(Math.sqrt(length)):w;
	let height=Math.ceil(length/width);
	let requiredLength=width*height*components;
	for(let i=arr.length;i<requiredLength;i++){
		arr.push(0);
	}
	return {
		arr,
		width,
		height
	};
}
function boxTypedArray(arr,components=1,w=0){
	let length=arr.length/components;

	let width=w==0?Math.ceil(Math.sqrt(length)):w;
	let height=Math.ceil(length/width);
	return {
		arr,
		width,
		height
	};
}
function toTexture(texOpts,callback){
	return twgl.createTexture(gl,texOpts,callback);
}
function updateArrayTexture(tex,arr,texOpts){
	return twgl.setTextureFromArray(gl,tex,arr,texOpts);
}
function updateCanvasTexture(tex,elm,texOpts){
	return twgl.setTextureFromElement(gl,tex,elm,texOpts);
}
function samplerVar(name){
	return glsl`
	uniform vec2 ${name}Resolution;
	uniform highp sampler2D ${name};
	`;
}
function usamplerVar(name){
	return glsl`
	uniform vec2 ${name}Resolution;
	uniform highp usampler2D ${name};
	`;
}
function idxFunc(name,resolutionName=name){
	return glsl`
	highp float ${name}AtIdx(highp uint idx){
		uint width=uint(${resolutionName}Resolution.x);
		vec2 halfPix=vec2(0.5,0.5);

		uint y=idx/width;
		uint x=idx-(y*width);

		vec2 idxPos=vec2(x,y);
		//make sure to sample from the center of the pixel
		idxPos+=halfPix;
		if(idxPos.y>=${resolutionName}Resolution.y){
			return 0.;
		}
		return texture(${name}, idxPos/${resolutionName}Resolution).r;
	}`;
}
function idxFuncUInt(name,resolutionName=name){
	return glsl`
	highp uint ${name}AtIdx(highp uint idx){
		uint width=uint(${resolutionName}Resolution.x);
		vec2 halfPix=vec2(0.5,0.5);

		uint y=idx/width;
		uint x=idx-(y*width);

		vec2 idxPos=vec2(x,y);
		//make sure to sample from the center of the pixel
		idxPos+=halfPix;
		if(idxPos.y>=${resolutionName}Resolution.y){
			return uint(0);
		}
		return texture(${name}, idxPos/${resolutionName}Resolution).r;
	}`;
}
function idxFuncVec4(name,resolutionName=name){
	return glsl`
	highp vec4 ${name}AtIdx(highp uint idx){
		uint width=uint(${resolutionName}Resolution.x);
		vec2 halfPix=vec2(0.5,0.5);

		uint y=idx/width;
		uint x=idx-(y*width);

		vec2 idxPos=vec2(x,y);
		//make sure to sample from the center of the pixel
		idxPos+=halfPix;
		if(idxPos.y>=${resolutionName}Resolution.y){
			return vec4(0.);
		}
		return texture(${name}, idxPos/${resolutionName}Resolution);
	}`;
}
function gammaFuncs(){
	return glsl`
	vec3 gammaCorrect(vec3 col){
		float gammaExp=${1./2.2};
		return vec3(pow(col.x,gammaExp),pow(col.y,gammaExp),pow(col.z,gammaExp));
	}
	vec3 gammaShift(vec3 col){
		float gammaExp=2.2;
		return vec3(pow(col.x,gammaExp),pow(col.y,gammaExp),pow(col.z,gammaExp));
	}`;
}
function overlayFuncs(){
	return glsl`
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
	}`;
}