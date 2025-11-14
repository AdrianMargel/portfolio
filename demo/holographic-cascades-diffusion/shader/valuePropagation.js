class ValuePropagationShader extends Shader{
	constructor(){
		super(
			glsl`#version 300 es
				#define PI ${PI}
				#define TAU ${TAU}
				precision highp float;
				precision highp int;
				precision highp sampler2D;

				uniform sampler2D cascadeMatrixTex;
				uniform vec2 cascadeMatrixSize;
				uniform sampler2D valueTex;
				uniform vec2 size;
				uniform int cascadeNum;
				uniform int cascadeNumMax;
				uniform bool isHalf;
				uniform int channelCount;
				uniform int channelIdx;

				flat out float val;
				
				${SHADER_FUNCS.INT_MATH}
				${SHADER_FUNCS.DATA_TEX}
				${SHADER_FUNCS.CASCADE}
				${SHADER_FUNCS.CASCADE_COORD}

				//A propagation matrix is basically the same as the cascade matrix
				//but with only one channel. This is because we only propagate one
				//channel at a time.
				Matrix newPropagationMatrix(Block blk){
					int edgeCount=2*(blk.size.x-1+blk.size.y-1);
					int midCount=blk.size.y-2;
					int channelCount=1;
					ivec2 dims=ivec2(
						midCount,
						edgeCount+channelCount
					);
					return Matrix(
						blk,

						dims,
						edgeCount,
						midCount,
						channelCount
					);
				}

				int getPropagationMatrixCount(Level lvl){
					Block blk=newBlock(0,lvl);
					Matrix mtx=newPropagationMatrix(blk);
					return int(mtx.dims.x*mtx.dims.y);
				}
				int propIdx(int globalIdx,Level lvl){
					int count=getPropagationMatrixCount(lvl);
					return globalIdx/count;
				}

				void main(){//TODO: double check all this
					gl_PointSize=1.;
					
					int idx=gl_VertexID;

					Level lvl=newLevel(cascadeNum,isHalf);
					Block blk=newBlock(propIdx(idx,lvl),lvl);
					Matrix propMtx=newPropagationMatrix(blk);
					Element propElm=newElement(elmIdx(idx,propMtx),propMtx);

					bool isYEdge=propElm.coord.y<propMtx.edgeCount;
					Matrix cscMtx=newCascadeMatrix(blk);
					Element cscElm=newElement(
						ivec2(
							propElm.coord.x,
							//if the y idx is a channel then set it to the correct channel idx
							propElm.coord.y+channelIdx*int(!isYEdge) //branchless
						),
						cscMtx
					);
					float cscVal=getVal(cscElm,cascadeMatrixTex,cascadeMatrixSize);

					if(isYEdge){
						ivec2 edgeCoord=getEdgeCoord(propElm.coord.y,blk);
						val=texelFetch(valueTex,edgeCoord,0).r*cscVal;
					}else{
						val=cscVal;
					}

					ivec2 midCoord=getMidCoord(propElm.coord.x,blk);
					//align to center of the pixel
					gl_Position=vec4(
						((vec2(midCoord)+.5)/size)*2.-1.,
						1.,
						1.
					);
				}
			`,
			glsl`#version 300 es
				#define PI ${PI}
				#define TAU ${TAU}
				precision highp float;
				precision highp int;
				precision highp sampler2D;

				flat in float val;

				out vec4 outColor;

				void main(){
					outColor=vec4(val,0.,0.,0.);
				}
			`,
		);
		this.drawType=gl.POINTS;
	}
	run(channelIdx,cascadeNum,isHalf,cascadeNumMax,channelCount,cascadeMatrixTex,valueTexPP){
		
		let lvlH=pow(2,cascadeNumMax-cascadeNum);
		let lvlW=lvlH/(isHalf?2:1);
		
		let scaleBase=pow(2,cascadeNum);
		let blkH=scaleBase+1;
		let blkW=scaleBase*(isHalf?2:1)+1;
		
		let edgeCount=2*(blkW-1+blkH-1);
		let midCount=blkH-2;
		let propMtxW=midCount;
		let propMtxH=edgeCount+1;

		let propMtxCount=lvlH*lvlW*propMtxW*propMtxH;

		this.uniforms={
			cascadeNum,
			isHalf,
			cascadeNumMax,
			channelCount,
			channelIdx,
			cascadeMatrixTex:cascadeMatrixTex.tex,
			cascadeMatrixSize:cascadeMatrixTex.size,
			valueTex:valueTexPP.tex,
			size:valueTexPP.size,
		};
		this.attachments=[
			{
				attachment:valueTexPP.flip().tex,
				...sizeObj(valueTexPP.size)
			}
		];
		
		gl.enable(gl.BLEND);
		gl.blendEquation(gl.FUNC_ADD);
		gl.blendFunc(gl.ONE,gl.ONE);

		super.run(propMtxCount);
		gl.disable(gl.BLEND);
	}
}