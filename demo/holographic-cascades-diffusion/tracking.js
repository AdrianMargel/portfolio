function trackPage(pageName){
	let host=window.location.hostname;
	if(host.toLowerCase()=="localhost"||host=="127.0.0.1"){
		// Don't bother tracking localhost
		return;
	}

	let name=pageName;
	// Remove starting and ending "/", for example "/projects/thing/" becomes "projects/thing"
	if(name[0]=="/"){
		name=name.substring(1);
	}
	if(name[name.length-1]=="/"){
		name=name.substring(0,name.length-1);
	}
	fetch("https://website-tracking.deno.dev/page",{
		body: name,
		method: "POST",
	});
}