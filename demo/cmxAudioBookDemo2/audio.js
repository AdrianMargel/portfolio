
class AudioPlayer{
	constructor(v){
		this.audio=new Audio();
		this.volume=v;
	}

	selectChapter(book,chapter){
		this.pause();
		if(chapter!=null){
			let file=chapter.file[0].data;
			// this.audio=new Audio(`/books/${book.id.data}/${file}`);
			this.audio.setAttribute("src",`/books/${book.id.data}/${file}`);
			// console.log(`/books/${book.id.data}/${file}`);
			this.setTime(chapter.progress.data);
			this.prepare();
		}
	}
	prepare(){
		this.audio.volume=this.volume;
	}
	play(){
		// console.log(this.audio.duration*1000);
		this.audio.play();
	}
	pause(){
		this.audio.pause();
	}
	getTime(){
		return Math.floor(this.audio.currentTime*1000);
	}
	setTime(t){
		this.audio.currentTime=t/1000;
	}
	setVolume(v){
		this.volume=v;
		this.audio.volume=this.volume;
	}
}