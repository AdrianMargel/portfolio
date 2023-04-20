

var vertexShader2 = `
	precision mediump float;

	// those are the mandatory attributes that the lib sets
	attribute vec3 aVertexPosition;
	attribute vec2 aTextureCoord;

	// those are mandatory uniforms that the lib sets and that contain our model view and projection matrix
	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;

	// our texture matrix that will handle image cover
	uniform mat4 uTextureMatrix0;

	// pass your vertex and texture coords to the fragment shader
	varying vec3 vVertexPosition;
	varying vec2 vTextureCoord;

	void main() {
		vec3 vertexPosition = aVertexPosition;
		//gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);
		gl_Position = vec4(vertexPosition, 1.0);
		
		// set the varyings
		// here we use our texture matrix to calculate the accurate texture coords
		//vTextureCoord = (uTextureMatrix0 * vec4(aTextureCoord, 0.0, 1.0)).xy;
		vTextureCoord = (vec4(aTextureCoord, 0.0, 1.0)).xy;
		vVertexPosition = vertexPosition;
	}
`;