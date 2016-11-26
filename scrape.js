var scraperjs = require('scraperjs');
var exec = require('child_process').exec;
var fs = require('fs');

const path = require('path');

var startpage = 21
var startpoint = (20 * startpage) - 20; //page 1 has 0 startingpoint

for (s = startpage; s < startpage+1; s++){
	var folder = "page_"+s;
	console.log("going for: "+folder+" starting:"+startpoint+"\n");
	scrape(startpoint,folder);
	startpoint= startpoint+20;
}

function puts(error, stdout, stderr) { 
	if(error){
		console.log(error); 
	}
}

function writeManifest(data,dir) {

	fs.writeFile(dir+"/manifest.json", JSON.stringify(data,null,2), function(err) {
		if(err) {
			return console.log(err);
		}
		console.log("\nsaved bckup @ "+dir);
	}); 
}

function fetchImages(gems, dir) {

	var imglist = gems.repopics;

	for(var i = 0; i < imglist.length; i++){
		var aPic = imglist[i];
		var completed = 0;

		var child = exec("wget -nc -P "+dir+" "+aPic, puts);

		child.on('close', function(code) {
			completed++;
			console.log("downloaded: "+completed+"/"+imglist.length+" @ "+dir);

			if(completed == imglist.length){
				console.log("\n=== Cloning repos ===\n");
				cloneRepos(gems.ghlinks,dir);
			}
		});

	}
}

function cloneRepos(repolist, dir) {
	var clonedRepos = 0;

	for(var i = 0; i < repolist.length; i++){
		var ghbase = 'https://github.com/';
		var clone = ghbase+repolist[i];

		var folderName = path.join(dir, path.basename(clone));

		//only clone if repo folders don't exist
		if (!fs.existsSync(folderName)){
			var child = exec("git clone "+clone, { cwd: dir}, puts);

			child.on('close', function(code) {
				clonedRepos++;
				console.log("completed cloning process: "+clonedRepos+"/"+repolist.length);

				if(clonedRepos == repolist.length){
					console.log("\n === done! ===");
				}
			});
		} else{
			clonedRepos++;
		}

	}
	
	if(clonedRepos == repolist.length){
		console.log("all repos cloned");
	}else if(clonedRepos > 0){
		console.log("already cloned : "+clonedRepos);
	}

}

function scrape(count, dwnl_folder){

	var scrapeLink = "http://www.android-gems.com/user/thatkole/?type=favorite&uid=1551650237972482&pageinfo_start="+startpoint;

	scraperjs.StaticScraper.create(scrapeLink)
	.scrape(function($) {
		var user = $(".heading-title a:first-child").map(function() {
			return $(this).text().trim();
		}).get();

		var repo = $(".heading-title a.lib-title").map(function() {
			return $(this).text().trim();
		}).get();

		var imgs = $(".js-load-image").map(function() {
			return $(this).attr('data-src');
		}).get();

		var match = [];

		for(var u = 0; u < user.length; u++){
			var gitlink = user[u] + "/"+ repo[u];
			match.push(gitlink);
		};

		var endpoint = { ghlinks: match, repopics: imgs}

		return endpoint;
	})
	.then(function(gems) {

		if (!fs.existsSync(dwnl_folder)){
			fs.mkdirSync(dwnl_folder);
		}

		writeManifest(gems,dwnl_folder)
		fetchImages(gems,dwnl_folder);

	})

}
