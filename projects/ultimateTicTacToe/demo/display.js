class Camera{
	constructor(){
		this.pos=new Vector(-20,-20);
		this.zoom=1;
	}
}
class Display{
	constructor(forground,background){
		this.cam=new Camera();
		this.forground=forground;
		this.ctxF=this.forground.getContext("2d");
		this.ctxF.imageSmoothingEnabled = false;

		this.background=background;
		this.ctxB=this.background.getContext("2d");
		this.ctxB.imageSmoothingEnabled = false;

		this.canvasSize=new Vector(200,200);

		this.timer=0;
	}

	getScreenMin(){
		let min=new Vector(this.cam.pos);
		return min;
	}
	getScreenMax(){
		let max=new Vector(this.canvasSize);
		max.addVec(this.cam.pos);
		return max;
	}
	getScreenSize(){
		return new Vector(this.canvasSize);
	}
	resize(width,height){
		this.canvasSize=new Vector(width,height);
		this.forground.width=width;
		this.forground.height=height;
		this.background.width=width;
		this.background.height=height;
		this.background.style.width=width*4+"px";
		this.background.style.height=height*4+"px";
	}

	drawWorm(x,y,col){
		this.ctxF.strokeStyle=overlayColor("#858585",col);
		this.ctxF.lineWidth=10;
		this.ctxF.lineCap = 'round';
		this.ctxF.beginPath();
		this.ctxF.moveTo(x+5,y);
		this.ctxF.lineTo(x-5,y);
		this.ctxF.stroke();
	}
	setCamPos(x,y){
		this.cam.pos=new Vector(x,y);
	}
	setCamPosX(x){
		this.cam.pos.x=x;
	}
	setCamPosY(y){
		this.cam.pos.y=y;
	}
	alignCam(){
		this.ctxF.translate(-this.cam.pos.x, -this.cam.pos.y);
		// this.ctxB.translate(-this.cam.pos.x, -this.cam.pos.y);
		// this.ctxF.translate(-Math.floor(this.cam.pos.x), -Math.floor(this.cam.pos.y));
		this.ctxB.translate(-Math.floor(this.cam.pos.x), -Math.floor(this.cam.pos.y));
	}
	drawOrb(x,y,col){
		this.ctxF.fillStyle=overlayColor("#858585",col);
		this.ctxF.beginPath();
		this.ctxF.arc(x, y, 3, 0, 2 * Math.PI);
		this.ctxF.fill();
	}

	drawImageF(x,y,w,h,img){
		this.ctxF.drawImage(img, x, y, w, h);
	}
	drawImageB(x,y,w,h,img){
		this.ctxB.drawImage(img, x, y, w, h);
	}

	mt(x,y){
		this.ctxF.moveTo(x*this.cam.zoom,y*this.cam.zoom);
	}
	lt(x,y){
		this.ctxF.lineTo(x*this.cam.zoom,y*this.cam.zoom);
	}
	mt2(x,y){
		this.ctxF.moveTo((x-this.cam.pos.x)*this.cam.zoom,(y-this.cam.pos.y)*this.cam.zoom);
	}
	lt2(x,y){
		this.ctxF.lineTo((x-this.cam.pos.x)*this.cam.zoom,(y-this.cam.pos.y)*this.cam.zoom);
	}
	start(){
		this.ctxF.beginPath();
	}
	end(){
		this.ctxF.closePath();
	}
	stroke(){
		this.ctxF.stroke();
	}
	fill(){
		this.ctxF.fill();
	}
	rect(x,y,w,h){
		this.ctxF.fillRect(x*this.cam.zoom,y*this.cam.zoom,w*this.cam.zoom,h*this.cam.zoom);
		this.ctxF.strokeRect(x*this.cam.zoom,y*this.cam.zoom,w*this.cam.zoom,h*this.cam.zoom);
	}
	rectMid(x,w,h){
		this.ctxF.fillRect(x*this.cam.zoom,-h/2*this.cam.zoom,w*this.cam.zoom,h*this.cam.zoom);
		this.ctxF.strokeRect(x*this.cam.zoom,-h/2*this.cam.zoom,w*this.cam.zoom,h*this.cam.zoom);
	}
	circle(x,y,r){
		this.ctxF.arc(x*this.cam.zoom, y*this.cam.zoom, r*this.cam.zoom, 0, 2 * Math.PI);
	}
	ellipse(x,y,w,h){
		this.ctxF.ellipse(x*this.cam.zoom, y*this.cam.zoom, w*this.cam.zoom, h*this.cam.zoom, 0, 0, 2 * Math.PI);
	}
	noStroke(){
		this.ctxF.strokeStyle="#FFFFFF00";
	}
	noFill(){
		this.ctxF.fillStyle="#FFFFFF00";
	}
	rotate(a){
		this.ctxF.rotate(a);
		this.ctxB.rotate(a);
	}
	translate(x,y){
		this.ctxF.translate(x*this.cam.zoom, y*this.cam.zoom);
		this.ctxB.translate(x*this.cam.zoom, y*this.cam.zoom);
	}
	translate2(x,y){
		this.ctxF.translate((x-this.cam.pos.x)*this.cam.zoom, (y-this.cam.pos.y)*this.cam.zoom);
	}
	reset(){
		this.ctxB.resetTransform();
		this.ctxF.resetTransform();
	}
	clear(){
		this.ctxB.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);
		this.ctxF.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);
	}
	nextTick(){
		this.timer++;
	}
}