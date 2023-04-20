var fragmentShaderShadow = `
	precision mediump float;

	// get varyings
	varying vec3 vVertexPosition;
	varying vec2 vTextureCoord;

	// the uniform declared in javascript
	uniform vec2 onePixel;

	// our texture samplers
	uniform sampler2D uPingPong;
	uniform sampler2D uInputTexture;
	vec2 getCoords(vec2 coord, vec2 offset){
		return max(min(coord + onePixel * offset, 1.0),0.0);
	}
	vec4 getPixel(vec2 coord, vec2 offset){
		return texture2D(uInputTexture, getCoords(coord, offset));
	}
	bool isValidColor(vec4 pix){
		return (pix.r == 0.69803921568 && pix.g == 0.11764705882 && pix.b == 0.18431372549 ) ||
				(pix.r == 0.51372549019 && pix.g == 0.74509803921 && pix.b == 0.15686274509 ) ||
				(pix.r == 0.23529411764  && pix.g == 0.23529411764  && pix.b == 0.23529411764 ) ||
				(pix.r == 0.41960784313  && pix.g == 0.41960784313  && pix.b == 0.41960784313 );
	}

	void main() {
		// get our texture coords from our varying
		vec2 textureCoord = vTextureCoord;

		vec4 pix = getPixel(textureCoord, vec2(0.0, 0.0));
		vec4 pixUp2 = getPixel(textureCoord, vec2(-2.0, 2.0));

		// Show the pixel if it is full opacity or 1 value less. If it is one less then don't show any shadow.
		// 1-1/255 = 0.99607843
		if(
			(pix.a == 1.0 || pix.a == 0.99607843) && isValidColor(pix)
		){
			gl_FragColor = pix;
		}else if(pixUp2.a == 1.0 || pixUp2.a == 0.99607843){
			gl_FragColor = vec4(0.0,0.0,0.0,0.235294);
		}else{
			gl_FragColor = vec4(0.0,0.0,0.0,0.0);
		}
	}
`;








































