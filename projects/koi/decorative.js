class Camera{
	constructor(){
		this.pos=new Vector(0,0);
		this.zoom=10;
	}
}

class Koi{
	constructor(pos){
		this.primaryColor=1;
		this.secondaryColor=1;
		this.highlightColor=1;

		this.segments=[];

		this.pos=new Vector(pos);
		this.lastPos=new Vector(this.pos);
		this.velo=new Vector();
		let currSegPos=new Vector(this.pos);
		for(let i=0;i<2;i++){
			let segLength=50;
			currSegPos.addVec(new Vector(segLength,0));
			let segPos=new Vector(currSegPos);
			this.segments.push(new Segment(segPos,segLength,1,i*20,0.5));
		}
		for(let i=0;i<4;i++){
			let scale=i/4;
			let segLength=(50-20)*(1-scale)+20;
			let stiff=(3-1)*scale+1;

			currSegPos.addVec(new Vector(segLength,0));
			let segPos=new Vector(currSegPos);
			this.segments.push(new Segment(segPos,segLength,stiff,20-i*3,0.5));
		}
		for(let i=0;i<3;i++){
			let segLength=10;
			currSegPos.addVec(new Vector(segLength,0));
			let segPos=new Vector(currSegPos);
			this.segments.push(new Segment(segPos,segLength,2,5,0.5));
		}

		this.widths=[
			{dist: 0, width: 5.5},
			{dist: 0.15, width: 19.8},
			{dist: 0.25, width: 22},
			{dist: 0.33, width: 22},
			{dist: 1, width: 3.3}
		];

		this.displayLines=[];

		let totalLength=this.getTotalLength();

		this.appendages=[];
		this.renderOver=[];
		this.renderUnder=[];

		let tailSegments=[];
		for(let i=0;i<8;i++){
			let segLength=10;
			let segLim=20;
			let stiff=1;
			if(i<=2){
				stiff=7.5;
			}
			let segPos=new Vector();
			tailSegments.push(new Segment(segPos,segLength,stiff,0,0.8,segLim));
		}
		let tail=new Fin(totalLength-40,tailSegments,new Vector(),0,3);
		this.appendages.push(tail);
		this.renderOver.push(tail);

		let whisker1Segments=[];
		for(let i=0;i<12;i++){
			let segLength=10;
			let stiff=0;
			if(i==0){
				stiff=5;
			}else if(i==1){
				stiff=3;
			}else if(i==2){
				stiff=1;
			}else if(i==3){
				stiff=0.5;
			}else if(i==4){
				stiff=0.1;
			}
			let segPos=new Vector();
			let toAdd=new Segment(segPos,segLength,stiff,0,0.5,1);
			if(i>0&&i<3){
				toAdd.bend=-1.2;
			}
			whisker1Segments.push(toAdd);
		}
		let whisker1=new Ribbon(10,whisker1Segments,new Vector(0,2),Math.PI*2/3);
		this.appendages.push(whisker1)
		this.renderUnder.push(whisker1);
		
		let whisker2Segments=[];
		for(let i=0;i<12;i++){
			let segLength=10;
			let stiff=0;
			if(i==0){
				stiff=5;
			}else if(i==1){
				stiff=3;
			}else if(i==2){
				stiff=1;
			}else if(i==3){
				stiff=0.5;
			}else if(i==4){
				stiff=0.1;
			}
			let segPos=new Vector();
			let toAdd=new Segment(segPos,segLength,stiff,0,0.5,1);
			if(i>0&&i<3){
				toAdd.bend=1.2;
			}
			whisker2Segments.push(toAdd);
		}
		let whisker2=new Ribbon(10,whisker2Segments,new Vector(0,-2),-Math.PI*2/3);
		this.appendages.push(whisker2)
		this.renderUnder.push(whisker2);

		let dorsalFinSegments=[];
		for(let i=0;i<9;i++){
			let segLength=10;
			let stiff=2;
			let segLim=10;
			let segPos=new Vector();
			let toAdd=new Segment(segPos,segLength,stiff,0,0.5,segLim);
			if(i==0){
				toAdd.attachMag=5;
			}
			dorsalFinSegments.push(toAdd);
		}
		let dorsal=new Fin(90,dorsalFinSegments,new Vector(),0,2);
		this.appendages.push(dorsal);
		this.renderOver.push(dorsal);
		
		let caudalD1=totalLength-60;
		let caudalD2=this.getWidthAt(caudalD1,totalLength)-5;

		let caudal1Segments=[];
		for(let i=0;i<5;i++){
			let segLength=10;
			let segLim=1000;
			let stiff=5;
			if(i==0){
				segLength=1;
			}
			let segPos=new Vector();
			let toAdd=new Segment(segPos,segLength,stiff,0,0.5,segLim);
			toAdd.attachMag=3;
			toAdd.bend=-0.2;
			caudal1Segments.push(toAdd);
		}
		let caudal1=new Fin(caudalD1,caudal1Segments,new Vector(0,caudalD2),Math.PI/3,3);
		//this.appendages.push(caudal1);
		//this.renderUnder.push(caudal1);

		let caudal2Segments=[];
		for(let i=0;i<5;i++){
			let segLength=10;
			let segLim=1000;
			let stiff=5;
			if(i==0){
				segLength=1;
			}
			let segPos=new Vector();
			let toAdd=new Segment(segPos,segLength,stiff,0,0.5,segLim);
			toAdd.attachMag=3;
			toAdd.bend=0.2;
			caudal2Segments.push(toAdd);
		}
		let caudal2=new Fin(caudalD1,caudal2Segments,new Vector(0,-caudalD2),-Math.PI/3,3);
		//this.appendages.push(caudal2);
		//this.renderUnder.push(caudal2);

		let caudalD1b=totalLength-110;
		let caudalD2b=this.getWidthAt(caudalD1b,totalLength)-5;

		let caudal1bSegments=[];
		for(let i=0;i<6;i++){
			let segLength=10;
			let segLim=1000;
			let stiff=5;
			if(i==0){
				segLength=1;
			}
			if(i<=3){
				stiff=7;
			}
			let segPos=new Vector();
			let toAdd=new Segment(segPos,segLength,stiff,0,0.5,segLim);
			toAdd.attachMag=5;
			toAdd.bend=-0.15;
			caudal1bSegments.push(toAdd);
		}
		let caudal1b=new Fin(caudalD1b,caudal1bSegments,new Vector(0,caudalD2b),Math.PI/3,4);
		caudal1b.skipRibs=1;
		//this.appendages.push(caudal1b);
		//this.renderUnder.push(caudal1b);

		let caudal2bSegments=[];
		for(let i=0;i<6;i++){
			let segLength=10;
			let segLim=1000;
			let stiff=2;
			if(i==0){
				segLength=1;
			}
			if(i<=3){
				stiff=7;
			}
			let segPos=new Vector();
			let toAdd=new Segment(segPos,segLength,stiff,0,0.5,segLim);
			toAdd.attachMag=5;
			toAdd.bend=0.15;
			caudal2bSegments.push(toAdd);
		}
		let caudal2b=new Fin(caudalD1b,caudal2bSegments,new Vector(0,-caudalD2b),-Math.PI/3,4);
		caudal2b.skipRibs=1;
		//this.appendages.push(caudal2b);
		//this.renderUnder.push(caudal2b);


		let pectoralD1=totalLength/3-20;
		let pectoralD2=this.getWidthAt(pectoralD1,totalLength)-5;

		let pectoral1Segments=[];
		for(let i=0;i<8;i++){
			let segLength=10;
			let segLim=1000;
			let stiff=15;
			if(i==0){
				segLength=1;
			}
			let segPos=new Vector();
			let toAdd=new Segment(segPos,segLength,stiff,0,0.5,segLim);
			toAdd.attachMag=3;
			toAdd.bend=-0.1;
			pectoral1Segments.push(toAdd);
		}
		let pectoral1=new Fin(pectoralD1,pectoral1Segments,new Vector(0,pectoralD2),Math.PI/2,7);
		pectoral1.skipRibs=2;
		this.appendages.push(pectoral1);
		this.renderUnder.push(pectoral1);

		let pectoral2Segments=[];
		for(let i=0;i<8;i++){
			let segLength=10;
			let segLim=1000;
			let stiff=15;
			if(i==0){
				segLength=1;
			}
			let segPos=new Vector();
			let toAdd=new Segment(segPos,segLength,stiff,0,0.5,segLim);
			toAdd.attachMag=3;
			toAdd.bend=0.1;
			pectoral2Segments.push(toAdd);
		}
		let pectoral2=new Fin(pectoralD1,pectoral2Segments,new Vector(0,-pectoralD2),-Math.PI/2,7);
		pectoral2.skipRibs=2;
		this.appendages.push(pectoral2);
		this.renderUnder.push(pectoral2);

		let head=new Head(0,40,18);
		this.appendages.push(head);
		this.renderUnder.push(head);
	}
	init(){
		this.initDisplayLines(0.2);
		for(let i=0;i<this.appendages.length;i++){
			this.appendages[i].init(this);
		}
	}

	//Get info for any point along the body

	getWidthAt(point,totalLength){
		let d=point/totalLength;
		let index=0;
		let tarDist=this.widths[index].dist;
		let nextTarDist=this.widths[index+1].dist;
		while(nextTarDist<d&&index<this.widths.length-1){
			index++;
			tarDist=this.widths[index].dist;
			nextTarDist=this.widths[index+1].dist;
		}
		let relativeDist=(d-tarDist)/(nextTarDist-tarDist);

		let p1=new Vector(0,this.widths[index].width);
		let p2=new Vector(1,this.widths[index+1].width);
		let cp1=new Vector(p1);
		let cp2=new Vector(p2);
		let bp=bezierPoint(relativeDist,p1,cp1,cp2,p2);

		return bp.y;
	}
	getScaleWidthAt(point,totalLength){
		return (5*(1-point/totalLength)+6)*1.76;
	}
	getScaleLengthAt(point,totalLength){
		return (5*(1-point/totalLength)+6)*0.5;
	}
	getScaleColor(x,y){

		if(x==0&&y==5){
			return this.highlightColor;
		}
		if(y>6){
			return this.primaryColor;
		}
		if(y>4){
			return -2;
		}

		return -1;
	}

	//Get general info for the fish

	getTotalLength(){
		let totalLength=0;
		for(let i=1;i<this.segments.length;i++){
			totalLength+=this.segments[i].dist;
		}
		return totalLength;
	}

	//Init info needed for displaying the fish

	initDisplayLines(depth){
		let totalLength=this.getTotalLength();
		let currentNum=0;
		let lineLength=0;
		let yCount=0;
		for(let n=0;n<totalLength-lineLength;n+=lineLength){
			let isOffset=currentNum%2==0;
			currentNum++;
			let width=this.getWidthAt(n,totalLength);
			let sLength=this.getScaleLengthAt(n,totalLength);
			let sWidth=this.getScaleWidthAt(n,totalLength);
			lineLength=sLength;
			let points=this.getDisplayPoints(width,depth,sWidth,isOffset,yCount);
			this.displayLines.push({
				dist: n,
				width: width,
				length: sLength,
				scaleWidth: sWidth,
				points: points
			});
			yCount++;
		}
	}
	getDisplayPoints(width,depth,scaleWidth,isOffset,y){
		let points=[];
		let offset=0;
		if(isOffset){
			offset=this.getOffset(width,depth,scaleWidth);
		}
		let wide=width-offset;
		let splitNum=Math.ceil(wide/scaleWidth);
		let p1=new Vector(0,0);
		let p2=new Vector(wide,0);
		let cp1=new Vector(wide*depth,0);
		let cp2=new Vector(wide,0);
		let newPoints=[];
		for(let n=0;n<splitNum;n++){
			let midPos=bezierPoint(n/splitNum,p1,cp1,cp2,p2);
			let dist=midPos.x+offset;
			let toAdd={
				dist: dist,
				skew: 1,
				color: 1
			};
			newPoints.push(toAdd);
		}
		for(let i=0;i<newPoints.length;i++){
			let skewDist;
			if(i==newPoints.length-1){
				skewDist=(width-newPoints[i].dist);
			}else{
				skewDist=(newPoints[i+1].dist-newPoints[i].dist);
			}
			newPoints[i].skew=Math.min(skewDist/scaleWidth,1);
			newPoints[i].color=this.getScaleColor(i,y);

			if(isOffset||i!=0){
				let mirror={
					dist: -newPoints[i].dist,
					skew: newPoints[i].skew,
					color: this.getScaleColor(-(i+1),y)
				};
				points.push(mirror);
			}
			points.push(newPoints[i]);
		}
		return points;
	}
	getOffset(width,depth,scaleWidth){
		let wide=width;
		let splitNum=Math.ceil(wide/scaleWidth);
		let p1=new Vector(0,0);
		let p2=new Vector(wide,0);
		let cp1=new Vector(wide*depth,0);
		let cp2=new Vector(wide,0);
		
		let midPos=bezierPoint(1/splitNum,p1,cp1,cp2,p2);
		return midPos.x/2;
	}

	//calculate the movement for the fish

	run(angle){
		this.prime();
		for(let n=0;n<10;n++){
			let ang=angle;
			for(let i=1;i<this.segments.length;i++){
				this.segments[i].run(this.segments[i-1].pos,ang);
				ang=this.segments[i-1].pos.getAng(this.segments[i].pos);
			}
			for(let i=0;i<this.segments.length;i++){
				this.segments[i].move();
			}
		}
		for(let n=0;n<5;n++){
			for(let i=0;i<this.segments.length;i++){
				if(i==0){
					this.segments[i].correct(this.pos);
				}else{
					this.segments[i].correct(this.segments[i-1].pos);
				}
			}
		}

		let forceBuild=new Vector();
		for(let i=0;i<this.segments.length;i++){
			if(i==0){
				this.segments[i].swim(this.pos,this.lastPos,forceBuild);
			}else{
				this.segments[i].swim(this.segments[i-1].pos,this.segments[i-1].lastPos,forceBuild);
			}
		}

		this.velo.addVec(forceBuild); //generate movement

		this.velo.sclVec(0.93);
		this.move();

		for(let i=0;i<this.appendages.length;i++){
			this.appendages[i].run(this);
		}
	}
	prime(){
		for(let i=0;i<this.segments.length;i++){
			this.segments[i].prime();
		}
		for(let i=0;i<this.appendages.length;i++){
			this.appendages[i].prime();
		}
		this.lastPos=new Vector(this.pos);
	}
	move(){
		this.pos.addVec(this.velo);
	}

	// utility

	getPointAt(dist,time){
		let tarTime=time||1;
		//TODO: better handling for in and out of bound values (x<0 and x>1)
		let currentDist=dist;
		let currentSegmentIndex=1;

		let currentSegment=this.segments[currentSegmentIndex];
		let relativeDist=currentDist/currentSegment.dist;
		//make sure you are on the correct segment
		while(relativeDist>1&&currentSegmentIndex<this.segments.length-1){
			currentDist-=currentSegment.dist;
			currentSegmentIndex++;

			currentSegment=this.segments[currentSegmentIndex];
			relativeDist=currentDist/currentSegment.dist;
		}
		if(relativeDist>1){
			console.warn("tried to get a point outside of the range of segments");
			relativeDist=1;
		}

		//get the previous segment
		let lastSegment=this.segments[currentSegmentIndex-1];

		//calculate the curve
		let pos1=lastSegment.getPosTimed(tarTime);
		let pos2=currentSegment.getPosTimed(tarTime);
		let angle=pos1.getAng(pos2);
		let mag=currentSegment.dist;

		let controlMag=mag/3;
		let controlPos1=null;
		let controlPos2=null;
		if(currentSegmentIndex>1){
			controlPos1=new Vector(this.segments[currentSegmentIndex-2].pos);
			let cAng1a=controlPos1.getAng(pos1);
			let cAng1b=pos1.getAng(pos2);
			let cAng1=nrm2Ang(cAng1a-cAng1b)/2;
			cAng1+=cAng1b;
			controlPos1=new Vector(cAng1,controlMag,true);
			controlPos1.addVec(pos1);
		}else{
			controlPos1=new Vector(angle,controlMag,true);
			controlPos1.addVec(pos1);
			//controlPos1=new Vector(pos1);
		}
		if(currentSegmentIndex<this.segments.length-1){
			controlPos2=new Vector(this.segments[currentSegmentIndex+1].pos);
			let cAng2a=controlPos2.getAng(pos2);
			let cAng2b=pos2.getAng(pos1);
			let cAng2=nrm2Ang(cAng2a-cAng2b)/2;
			cAng2+=cAng2b;
			controlPos2=new Vector(cAng2+Math.PI*2,controlMag,true);
			controlPos2.addVec(pos2);
		}else{
			controlPos2=new Vector(angle+Math.PI*2,controlMag,true);
			controlPos2.addVec(pos2);
		}

		//calculate the line pos with bending
		let linePos=bezierPoint(relativeDist,pos1,controlPos1,controlPos2,pos2);
		return linePos;
	}
	getPointsAt(dists,time){
		let tarTime=time||1;

		let points=[];
		let currentDist=0;
		let currentSegmentIndex=1;
		for(let i=0;i<dists.length;i++){
			currentDist+=dists[i];

			let currentSegment=this.segments[currentSegmentIndex];
			let relativeDist=currentDist/currentSegment.dist;
			//make sure you are on the correct segment
			while(relativeDist>1&&currentSegmentIndex<this.segments.length-1){
				currentDist-=currentSegment.dist;
				currentSegmentIndex++;

				currentSegment=this.segments[currentSegmentIndex];
				relativeDist=currentDist/currentSegment.dist;
			}
			if(relativeDist>1){
				console.warn("tried to get a point outside of the range of segments (list)");
				relativeDist=1;
			}

			//get the previous segment
			let lastSegment=this.segments[currentSegmentIndex-1];

			//calculate the curve
			let pos1=lastSegment.getPosTimed(tarTime);
			let pos2=currentSegment.getPosTimed(tarTime);
			let angle=pos1.getAng(pos2);
			let mag=currentSegment.dist;

			let controlMag=mag/3;
			let controlPos1=null;
			let controlPos2=null;
			if(currentSegmentIndex>1){
				controlPos1=new Vector(this.segments[currentSegmentIndex-2].pos);
				let cAng1a=controlPos1.getAng(pos1);
				let cAng1b=pos1.getAng(pos2);
				let cAng1=nrm2Ang(cAng1a-cAng1b)/2;
				cAng1+=cAng1b;
				controlPos1=new Vector(cAng1,controlMag,true);
				controlPos1.addVec(pos1);
			}else{
				controlPos1=new Vector(angle,controlMag,true);
				controlPos1.addVec(pos1);
				//controlPos1=new Vector(pos1);
			}
			if(currentSegmentIndex<this.segments.length-1){
				controlPos2=new Vector(this.segments[currentSegmentIndex+1].pos);
				let cAng2a=controlPos2.getAng(pos2);
				let cAng2b=pos2.getAng(pos1);
				let cAng2=nrm2Ang(cAng2a-cAng2b)/2;
				cAng2+=cAng2b;
				controlPos2=new Vector(cAng2+Math.PI*2,controlMag,true);
				controlPos2.addVec(pos2);
			}else{
				controlPos2=new Vector(angle+Math.PI*2,controlMag,true);
				controlPos2.addVec(pos2);
			}

			//calculate the line pos with bending
			let addPos=bezierPoint(relativeDist,pos1,controlPos1,controlPos2,pos2);
			points.push(addPos);
		}
		return points;
	}
	getAngAt(dist,time){
		let offsetAmount=0.1;
		let distList=[dist-offsetAmount,offsetAmount*2];
		let posList=this.getPointsAt(distList,time);
		return posList[0].getAng(posList[1]);
	}

	//display the fish

	display(ctx,time){
		ctx.lineCap="round";
		this.calcDisplayLines(time);

		for(let i=0;i<this.renderUnder.length;i++){
			this.renderUnder[i].display(this,ctx,time);
		}

		ctx.strokeStyle="#FFF";
		ctx.fillStyle="#28282E";
		ctx.lineWidth=4;
		for(let i=this.displayLines.length-1;i>=1;i--){
			let line=this.displayLines[i];
			let lastLine=this.displayLines[i-1];
			let ang=line.pos.getAng(lastLine.pos)+Math.PI/2;
			let points=line.points;

			for(let t=points.length-1;t>=0;t--){
				let color=points[t].color;
				if(color==3){
					ctx.strokeStyle="#28282E";
					ctx.fillStyle="#FF1E47";
				}else if(color==2){
					ctx.strokeStyle="#FFF";
					ctx.fillStyle="#FF1E47";
				}else if(color==1){
					ctx.strokeStyle="#28282E";
					ctx.fillStyle="#FFF";
				}else if(color==0){
					ctx.strokeStyle="#FFF";
					ctx.fillStyle="#28282E";
				}else if(color==-1){
					continue;
				}else if(color==-2){
					ctx.fillStyle="#28282E";
				}
				let scalePos=new Vector(ang,points[t].dist,true);
				scalePos.addVec(line.pos);
				let scaleSize=line.scaleWidth;
				let scaleSkew=points[t].skew;
				if(color==-2){
					this.displayScale3(scalePos,ang,scaleSize,scaleSkew,ctx);
				}else{
					this.displayScale2(scalePos,ang,scaleSize,scaleSkew,ctx);
				}
			}
		}

		for(let i=0;i<this.renderOver.length;i++){
			this.renderOver[i].display(this,ctx,time);
		}
	}
	//calculate the display lines after they have considered bending
	calcDisplayLines(time){
		let lineDists=[];
		for(let i=0;i<this.displayLines.length;i++){
			lineDists.push(this.displayLines[i].length);
		}
		let linePoints=this.getPointsAt(lineDists,time);
		for(let i=0;i<this.displayLines.length;i++){
			this.displayLines[i].pos=linePoints[i];
		}
	}
	displayScale(dispPos,dispAng,dispLength,skew,ctx){
		ctx.lineJoin = "miter";
		ctx.translate(dispPos.x,dispPos.y);
		ctx.rotate(dispAng+Math.PI);

		ctx.beginPath();
		ctx.ellipse(-dispLength/2*skew,0, dispLength*skew, dispLength, 0, Math.PI/3*5, 2 * Math.PI);
		ctx.ellipse(0,dispLength/2, dispLength/2*skew, dispLength/2, 0, 0, Math.PI);
		ctx.ellipse(dispLength/2*skew,0, dispLength*skew, dispLength, 0, Math.PI, Math.PI/3*4);
		ctx.stroke();

		let offY=2;

		ctx.translate(0,-offY);
		ctx.beginPath();
		ctx.ellipse(-dispLength/2*skew,0, dispLength*skew, dispLength, 0, Math.PI/3*5, 2 * Math.PI);
		ctx.ellipse(0,dispLength/2, dispLength/2*skew, dispLength/2, 0, 0, Math.PI);
		ctx.ellipse(dispLength/2*skew,0, dispLength*skew, dispLength, 0, Math.PI, Math.PI/3*4);
		ctx.fill();

		ctx.resetTransform();
	}
	displayScale2(dispPos,dispAng,dispLength,skew,ctx){
		ctx.lineJoin = "miter";
		ctx.translate(dispPos.x,dispPos.y);
		ctx.rotate(dispAng+Math.PI);

		ctx.beginPath();
		ctx.ellipse(-dispLength/2*skew,0, dispLength*skew, dispLength, 0, Math.PI/3*5, 2 * Math.PI);
		ctx.ellipse(0,0, dispLength/2*skew, dispLength/2, 0, 0, Math.PI);
		ctx.ellipse(dispLength/2*skew,0, dispLength*skew, dispLength, 0, Math.PI, Math.PI/3*4);
		ctx.stroke();

		let offY=2;

		ctx.translate(0,-offY);
		ctx.beginPath();
		ctx.ellipse(-dispLength/2*skew,0, dispLength*skew, dispLength, 0, Math.PI/3*5, 2 * Math.PI);
		ctx.ellipse(0,0, dispLength/2*skew, dispLength/2, 0, 0, Math.PI);
		ctx.ellipse(dispLength/2*skew,0, dispLength*skew, dispLength, 0, Math.PI, Math.PI/3*4);
		ctx.fill();

		ctx.resetTransform();
	}
	displayScale3(dispPos,dispAng,dispLength,skew,ctx){
		ctx.lineJoin = "miter";
		ctx.translate(dispPos.x,dispPos.y);
		ctx.rotate(dispAng+Math.PI);

		ctx.beginPath();
		ctx.ellipse(-dispLength/2*skew,0, dispLength*skew, dispLength, 0, Math.PI/3*5, 2 * Math.PI);
		ctx.ellipse(0,0, dispLength/2*skew, dispLength/2, 0, 0, Math.PI);
		ctx.ellipse(dispLength/2*skew,0, dispLength*skew, dispLength, 0, Math.PI, Math.PI/3*4);
		ctx.fill();

		ctx.resetTransform();
	}
}

class Head{
	constructor(start,end,width){
		this.attachStart=start;
		this.attachEnd=end;
		this.width=width;
	}
	init(fish){

	}
	run(fish){

	}
	prime(){

	}
	display(fish,ctx,time){
		let startPos=fish.getPointAt(this.attachStart,time);
		let endPos=fish.getPointAt(this.attachEnd,time);
		let dispAng=startPos.getAng(endPos);
		let dispSize=startPos.getMag(endPos);

		let dispPos=new Vector(startPos);
		dispPos.addVec(endPos);
		dispPos.sclVec(0.5);

		let offset=new Vector(dispAng,dispSize/2,true);

		dispPos.addVec(offset);

		ctx.translate(dispPos.x,dispPos.y);
		ctx.rotate(dispAng);

		ctx.beginPath();
		ctx.ellipse(0,0, dispSize, this.width, 0, Math.PI/2, Math.PI*3/2);

		ctx.fillStyle="#28282E";
		ctx.fill();

		ctx.lineWidth=5;
		ctx.strokeStyle="#28282E";
		ctx.stroke();

		ctx.lineWidth=2;
		ctx.strokeStyle="#FFF";
		ctx.stroke();

		ctx.resetTransform();
	}
}
class Ribbon{
	constructor(connectDist,segs,posOff,rotOff){
		this.connectDist=connectDist;
		this.segments=segs;
		this.pos=new Vector();
		this.posOffset=new Vector(posOff);
		this.rotOffset=rotOff;

		this.lastPos=new Vector(this.pos);
	}
	init(fish){
		let attachedPos=fish.getPointAt(this.connectDist);
		for(let i=0;i<this.segments.length;i++){
			this.segments[i].pos=new Vector(attachedPos);
			this.segments[i].lastPos=new Vector(attachedPos);
		}
	}
	getPosTimed(time){
		let midPos=new Vector(this.pos);
		midPos.subVec(this.lastPos);
		midPos.sclVec(time);
		midPos.addVec(this.lastPos);
		return midPos;
	}
	prime(){
		this.lastPos=new Vector(this.pos);
		for(let i=0;i<this.segments.length;i++){
			this.segments[i].prime();
		}
	}
	run(fish){
		let attachedPos=fish.getPointAt(this.connectDist);
		let attachedAng=fish.getAngAt(this.connectDist);

		let offset=new Vector(this.posOffset);
		offset.rotVec(attachedAng);
		attachedPos.addVec(offset);
		attachedAng+=this.rotOffset;
		this.pos=attachedPos;

		for(let n=0;n<20;n++){
			let ang=attachedAng;
			for(let i=0;i<this.segments.length;i++){
				if(i==0){
					this.segments[i].run(this.pos,ang);
				}else{
					this.segments[i].run(this.segments[i-1].pos,ang);
				}
				ang+=this.segments[i].bend;
			}
			for(let i=0;i<this.segments.length;i++){
				this.segments[i].move();
			}
		}
		for(let n=0;n<5;n++){
			for(let i=0;i<this.segments.length;i++){
				if(i==0){
					this.segments[i].correct(this.pos);
				}else{
					this.segments[i].correct(this.segments[i-1].pos);
				}
			}
		}
	}
	display(fish,ctx,time){
		ctx.beginPath();
		let lastDraw=new Vector();
		for(let i=0;i<this.segments.length;i++){
			let drawPos=new Vector(this.segments[i].getPosTimed(time));

			if(i==0){
				ctx.moveTo(drawPos.x,drawPos.y);
			}else{
				let mid=new Vector(lastDraw);
				mid.addVec(drawPos);
				mid.sclVec(0.5);
				ctx.quadraticCurveTo(lastDraw.x,lastDraw.y, mid.x, mid.y);
			}
			lastDraw=new Vector(drawPos);
		}
		ctx.lineWidth=2;
		ctx.strokeStyle="#FFF";
		ctx.stroke();
	}
}
class Fin{
	constructor(connectDist,segs,posOff,rotOff,detail){
		this.connectDist=connectDist;
		this.segments=segs;
		this.pos=new Vector();
		this.posOffset=new Vector(posOff);
		this.rotOffset=rotOff;
		this.detail=detail;
		this.skipRibs=0;

		this.lastPos=new Vector(this.pos);
	}
	init(fish){
		let attachedPos=fish.getPointAt(this.connectDist);
		for(let i=0;i<this.segments.length;i++){
			this.segments[i].pos=new Vector(attachedPos);
			this.segments[i].lastPos=new Vector(attachedPos);
		}
	}
	run(fish){
		let attachedPos=fish.getPointAt(this.connectDist);
		let attachedAng=fish.getAngAt(this.connectDist);

		let offset=new Vector(this.posOffset);
		offset.rotVec(attachedAng);
		attachedPos.addVec(offset);
		attachedAng+=this.rotOffset;
		this.pos=attachedPos;

		let fishLength=fish.getTotalLength();

		let attachDists=[];
		let totalDist=this.connectDist;
		for(let i=0;i<this.segments.length;i++){
			let distToAdd=this.segments[i].attachMag;
			totalDist+=distToAdd;
			if(i==0){
				distToAdd+=this.connectDist;
			}
			if(totalDist<=fishLength){
				attachDists.push(distToAdd);
			}
		}
		let attachPoints=fish.getPointsAt(attachDists);

		for(let n=0;n<10;n++){
			let ang=attachedAng;
			for(let i=0;i<this.segments.length;i++){
				if(i==0){
					this.segments[i].run(this.pos,ang);
				}else{
					this.segments[i].run(this.segments[i-1].pos,ang);
				}
				ang+=this.segments[i].bend;
			}
			for(let i=0;i<this.segments.length;i++){
				this.segments[i].move();
			}
		}
		for(let n=0;n<5;n++){
			for(let i=0;i<this.segments.length;i++){
				if(i==0){
					this.segments[i].correct(this.pos);
				}else{
					this.segments[i].correct(this.segments[i-1].pos);
				}
			}
		}

		for(let n=0;n<5;n++){
			for(let i=0;i<attachPoints.length;i++){
				let anchor=attachPoints[i];
				let tarSeg=this.segments[i];
				tarSeg.limit(anchor);
			}
		}
	}
	getPosTimed(time){
		let midPos=new Vector(this.pos);
		midPos.subVec(this.lastPos);
		midPos.sclVec(time);
		midPos.addVec(this.lastPos);
		return midPos;
	}
	prime(){
		this.lastPos=new Vector(this.pos);
		for(let i=0;i<this.segments.length;i++){
			this.segments[i].prime();
		}
	}
	display(fish,ctx,time){
		let attachedAng=fish.getAngAt(this.connectDist,time);
		let offset=new Vector(this.posOffset);
		offset.rotVec(attachedAng);

		ctx.lineJoin = "round";
		let fishLength=fish.getTotalLength();

		let attachDists=[];
		let totalDist=this.connectDist;
		for(let i=0;i<this.segments.length;i++){
			let distToAdd=this.segments[i].attachMag;
			totalDist+=distToAdd;
			if(i==0){
				distToAdd+=this.connectDist;
			}
			if(totalDist<=fishLength){
				attachDists.push(distToAdd);
			}
		}
		let attachPoints=fish.getPointsAt(attachDists,time);
		for(let i=0;i<attachPoints.length;i++){
			attachPoints[i].addVec(offset);
		}

		let skip=1-(this.skipRibs/this.detail);
		let detailAdd=1/this.detail;
		for(let n=skip;n>=0;n-=detailAdd){
			ctx.beginPath();
			for(let i=0;i<this.segments.length;i++){
				let anchorIndex=Math.min(i,attachPoints.length-1);
				let anchor=attachPoints[anchorIndex];
				let drawPos=new Vector(anchor);
				let segPos=this.segments[i].getPosTimed(time);
				drawPos.subVec(segPos);
				drawPos.sclVec(n);
				drawPos.addVec(segPos);

				if(i==0){
					ctx.moveTo(drawPos.x,drawPos.y);
				}else{
					ctx.lineTo(drawPos.x,drawPos.y);
				}
			}
			ctx.lineWidth=6;
			ctx.strokeStyle="#28282E";
			ctx.strokeStyle="#FFF";
			ctx.stroke();

			ctx.lineWidth=3;
			ctx.strokeStyle="#FFF";
			ctx.strokeStyle="#28282E";
			ctx.stroke();
		}

		ctx.beginPath();
		for(let i=0;i<this.segments.length;i++){
			let drawPos=new Vector(this.segments[i].getPosTimed(time));

			if(i==0){
				ctx.moveTo(drawPos.x,drawPos.y);
			}else{
				ctx.lineTo(drawPos.x,drawPos.y);
			}
		}
	}
}
class Segment{
	constructor(pos,dist,stiffness,width,resistance,limDist){
		this.stiffness=stiffness;
		this.dist=dist;
		this.pos=new Vector(pos);
		this.velo=new Vector();
		this.lastPos=new Vector(this.pos);
		this.width=width;
		this.resistance=resistance;
		this.limitDist=limDist;
		this.attachMag=dist;
		this.bend=0;
	}
	run(target,ang){
		let desired=this.getDesiredPos(target,ang);

		this.attract(desired);

		this.velo.sclVec(this.resistance);
	}
	getPosTimed(time){
		let midPos=new Vector(this.pos);
		midPos.subVec(this.lastPos);
		midPos.sclVec(time);
		midPos.addVec(this.lastPos);
		return midPos;
	}
	move(){
		this.pos.addVec(this.velo);
	}
	nudge(force){
		this.velo.addVec(force);
	}
	swim(segPos,segLastPos,forceBuild){
		let line1=new Vector(this.lastPos);
		line1.subVec(this.pos);

		let line2=new Vector(segLastPos);
		line2.subVec(this.lastPos);
		
		let line3=new Vector(segPos);
		line3.subVec(segLastPos);

		let line4=new Vector(this.pos);
		line4.subVec(segPos);

		let d1=line1.getMag();
		let d2=line2.getMag();
		let d3=line3.getMag();
		let d4=line4.getMag();
		let ang1=nrmAng(line1.getAng()-line2.getAng()-Math.PI);
		let ang2=nrmAng(line3.getAng()-line4.getAng()-Math.PI);

		let area=quadArea(d1,d2,d3,d4,ang1,ang2);

		let diff1=new Vector(this.pos);
		diff1.subVec(segPos);

		let diff2=new Vector(this.lastPos);
		diff2.subVec(segLastPos);

		let diffAvg=new Vector(diff1);
		diffAvg.addVec(diff2);
		diffAvg.sclVec(0.5);
		let avgAng=diffAvg.getAng();

		let endForce1=new Vector(this.pos);
		endForce1.subVec(this.lastPos);
		let efAng1=endForce1.getAng();
		let efMag1=endForce1.getMag();
		let pushAng1=avgAng+Math.PI/2;
		if(Math.abs(nrm2Ang(efAng1-pushAng1))>Math.PI/2){
			pushAng1+=Math.PI;
		}
		let push1=new Vector(pushAng1,efMag1,true);

		let endForce2=new Vector(segPos);
		endForce2.subVec(segLastPos);
		let efAng2=endForce2.getAng();
		let efMag2=endForce2.getMag();
		let pushAng2=avgAng+Math.PI/2;
		if(Math.abs(nrm2Ang(efAng2-pushAng2))>Math.PI/2){
			pushAng2+=Math.PI;
		}
		let push2=new Vector(pushAng2,efMag2,true);

		let pushForce=new Vector(push2);
		pushForce.addVec(push2);
		pushForce.sclVec(0.5);

		let forceAng=pushForce.getAng();

		let force=new Vector(forceAng,area,true);
		force.sclVec(0.01);

		forceBuild.subVec(force);
	}
	prime(){
		this.lastPos=new Vector(this.pos);
	}
	getDesiredPos(target,ang){
		let tarVec=new Vector(target);
		tarVec.addVec(new Vector(ang,this.dist,true));

		return tarVec;
	}
	limit(target){
		if(this.pos.getMag(target)>this.limitDist){
			this.correct(target,this.limitDist);
		}
	}
	correct(target,limDist){
		let limitDist=limDist||this.dist;
		let corrected=this.getCorrectedPos(target,limitDist);
		this.snap(corrected);

		let align=corrected.getAng(this.pos);
	}
	getCorrectedPos(target,limDist){
		let tarVec=new Vector(this.pos);
		tarVec.subVec(target);
		tarVec.nrmVec(limDist);
		tarVec.addVec(target);

		return tarVec;
	}
	attract(target){
		let accel=new Vector(target);
		accel.subVec(this.pos);
		accel.sclVec(0.005*this.stiffness);

		this.velo.addVec(accel);
	}
	snap(target){
		let move=new Vector(target);
		move.subVec(this.pos);
		move.sclVec(0.5);

		this.pos.addVec(move);
	}
}

class ArticKoi extends Koi{
	constructor(pos,varient){
		super(pos);
		if(varient=="sun"){
			this.primaryColor=1;
			this.secondaryColor=0;
			this.highlightColor=0;
		}else if(varient=="moon"){
			this.primaryColor=0;
			this.secondaryColor=1;
			this.highlightColor=1;
		}
	}
}

class KoiAI{
	constructor(centerPos,domain){
		this.centerPos=centerPos;
		this.domain=domain;

		this.targetPos=new Vector(centerPos);

		this.rhythm=0;
		this.rhythmCycle=100;
		this.pause=0;
		this.lastAng=0;
		this.ease=1;
	}
	getControl(fish){

		let dist=this.targetPos.getMag(fish.pos);
		if(dist<50){
			this.randomTarget();
		}

		if(this.pause>=1){
			this.pause--;
			if(this.pause==1){
				this.rhythm=Math.floor(this.rhythmCycle/2);
				this.ease=1;
			}
			return this.lastAng;
		}
		if(this.ease>0){
			this.ease=Math.max(this.ease-0.01,0);
		}

		this.rhythm++;
		if(this.rhythm>this.rhythmCycle){
			this.rhythm=0;
		}
		let time=this.rhythm/this.rhythmCycle;
		let ang=this.targetPos.getAng(fish.pos);
		let angOffset=Math.sin(time*Math.PI*2)*0.6;
		ang+=angOffset;
		ang=(this.lastAng*(this.ease)+ang*(1-this.ease));
		this.lastAng=ang;
		return ang;
	}
	randomTarget(){
		let rx=(Math.random()*2-1)*this.domain+this.centerPos.x;
		let ry=(Math.random()*2-1)*this.domain+this.centerPos.y;
		this.targetPos=new Vector(rx,ry);
		this.pause=10;
		if(Math.random()<0.1){
			//sometimes the fish will take a break
			this.pause+=Math.random()*200;
		}
	}
}

let canvas=document.getElementsByClassName("decorative")[0];
let context=canvas.getContext("2d");

let control=new Control();
control.connect(canvas);

let fishList=[];
let aiList=[];

fishList.push(new ArticKoi(new Vector(800,750),"sun"));
fishList.push(new ArticKoi(new Vector(800,850),"moon"));

for(let i=0;i<fishList.length;i++){
	fishList[i].init();
	aiList.push(new KoiAI(new Vector(800,800),700));
}

let runSpeed=1000/10;
setInterval(()=>{
	for(let i=0;i<fishList.length;i++){
		let controlAng=aiList[i].getControl(fishList[i]);
		fishList[i].run(controlAng);
	}
	primeAnimation();
}, runSpeed);

var displaying=true;
var last;
var totalElapsed=0;
function primeAnimation(){
	totalElapsed=0;
}
function displayAnimation(time){
	context.clearRect(0, 0, 1600, 1600);
	for(let i=0;i<fishList.length;i++){
		fishList[i].display(context,time);
	}
}

function animation(timestamp) {
	if(last===undefined){
		last=timestamp;
	}
	let elapsed=timestamp-last;
	let animAmount=elapsed/runSpeed;
	last=timestamp;
	totalElapsed+=animAmount;
	if(totalElapsed>1){
		animAmount=0;
	}

	let animeTime=Math.min(totalElapsed,1)
	displayAnimation(totalElapsed);

	if(displaying){
		window.requestAnimationFrame(animation);
	}
}
window.requestAnimationFrame(animation);
