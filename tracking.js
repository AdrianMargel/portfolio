function trackPage(pageName){
	let name=pageName;
	if(name[0]=="/"){
		name=name.substring(1);
	}
	if(name[name.length-1]=="/"){
		name=name.substring(0,name.length-1);
	}
	fetch("https://website-tracking.deno.dev/page",{
		body: pageName,
		method: "POST",
	});
}