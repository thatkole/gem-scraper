var scraperjs = require('scraperjs');
var exec = require('child_process').exec;
var fs = require('fs');

var startpoint = 0

for (s = 1; s < 2; s++){
	var dirNum = "page_"+s;
	console.log("going for: "+dirNum+" starting:"+startpoint);
	scrape(startpoint,dirNum);
	startpoint= startpoint+20;
}

function puts(error, stdout, stderr) { 
	if(error){
		console.log(error); 
	}
}

function scrape(pg, dir){

var scrapeLink = "http://www.android-gems.com/user/thatkole?type=favorite&info_start="+pg;

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

		if (!fs.existsSync(dir)){
			fs.mkdirSync(dirNum);
		}

		fs.writeFile(dirNum+"/manifest.json", JSON.stringify(gems,null,2), function(err) {
			if(err) {
				return console.log(err);
			}
			console.log("The bckup"+dir+" file was saved!");
		}); 

		for(var i = 0; i < gems.repopics.length; i++){
			exec("wget -nc -P "+dir+" "+gems.repopics[i] , puts);
			console.log("downloading: "+gems.repopics[i]);
		}

		for(var i = 0; i < gems.ghlinks.length; i++){
			var ghbase = 'https://github.com/';
			var clone = ghbase+gems.ghlinks[i];

			exec("git clone "+clone, { cwd: dir}, puts);
			console.log("cloning: "+clone);
		}
		

	})

}
