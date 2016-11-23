var scraperjs = require('scraperjs');
var exec = require('child_process').exec;
var fs = require('fs');

var startpage = 2
var startpoint = (20 * startpage) - 20; //page 1 has 0 startingpoint

for (s = startpage; s < 4; s++){
	var folder = "page_"+s;
	console.log("going for: "+folder+" starting:"+startpoint);
	scrape(startpoint,folder);
	startpoint= startpoint+20;
}

function puts(error, stdout, stderr) { 
	if(error){
		console.log(error); 
	}
}

function scrape(count, dwnl_folder){

//var scrapeLink = "http://www.android-gems.com/user/thatkole?type=favorite&info_start="+count;
	
var scrapeLink = "http://www.android-gems.com/user/thatkole/?type=favorite&uid=1551650237972482&pageinfo_start="+startpoint;

console.log(scrapeLink);

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

		fs.writeFile(dwnl_folder+"/manifest.json", JSON.stringify(gems,null,2), function(err) {
			if(err) {
				return console.log(err);
			}
			console.log("saved bckup @ "+dwnl_folder);
		}); 

		for(var i = 0; i < gems.repopics.length; i++){
			//exec("wget -nc -P "+dwnl_folder+" "+gems.repopics[i] , puts);
			//console.log("downloading: "+gems.repopics[i]);
		}

		for(var i = 0; i < gems.ghlinks.length; i++){
			var ghbase = 'https://github.com/';
			var clone = ghbase+gems.ghlinks[i];

			//exec("git clone "+clone, { cwd: dwnl_folder}, puts);
			//console.log("cloning: "+clone);
		}
		
	})

}
