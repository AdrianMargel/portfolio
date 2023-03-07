function nrmAngTAU(ang){
	let newAng=ang;
	while(newAng<0){
		newAng+=2*Math.PI;
	}
	while(newAng>2*Math.PI){
		newAng-=2*Math.PI;
	}
	return newAng;
}
function nrmAngPI(ang){
	let newAng=ang;
	while(newAng<-Math.PI){
		newAng+=2*Math.PI;
	}
	while(newAng>Math.PI){
		newAng-=2*Math.PI;
	}
	return newAng;
}
function mod(a,n) {
	return ((a%n)+n)%n;
}
function mix(a,b,m) {
	return a*(1-m)+b*m;
}
function clamp(a,min,max) {
	return Math.max(Math.min(a,max),min);
}
function aabb(hb1,hb2){
	return !(hb1[0].x>hb2[1].x||hb1[1].x<hb2[0].x
		|| hb1[0].y>hb2[1].y||hb1[1].y<hb2[0].y);
}
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
function updateTexture(tex,arr,texOpts){
	return twgl.setTextureFromArray(gl,tex,arr,texOpts);
}
function samplerVar(name){
	return glsl`
	uniform vec2 ${name}Resolution;
	uniform highp sampler2D ${name};
	`;
}
function idxFunc(name){
	return glsl`
	highp float ${name}AtIdx(highp uint idx){
		uint width=uint(${name}Resolution.x);
		vec2 halfPix=vec2(0.5,0.5);

		uint y=idx/width;
		uint x=idx-(y*width);

		vec2 idxPos=vec2(x,y);
		//make sure to sample from the center of the pixel
		idxPos+=halfPix;
		if(idxPos.y>=${name}Resolution.y){
			return 0.;
		}
		return texture(${name}, idxPos/${name}Resolution).r;
	}`;
}
function idxFuncVec4(name){
	return glsl`
	highp vec4 ${name}AtIdx(highp uint idx){
		uint width=uint(${name}Resolution.x);
		vec2 halfPix=vec2(0.5,0.5);

		uint y=idx/width;
		uint x=idx-(y*width);

		vec2 idxPos=vec2(x,y);
		//make sure to sample from the center of the pixel
		idxPos+=halfPix;
		if(idxPos.y>=${name}Resolution.y){
			return vec4(0.);
		}
		return texture(${name}, idxPos/${name}Resolution);
	}`;
}