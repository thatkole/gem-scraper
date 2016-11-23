var scraperjs = require('scraperjs');
var fs = require('fs');

var num = 1
var dirNum = "./page_"+num;

scrape(0,dirNum);

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
	.then(function(news) {
		//console.log(news.repopics[0]);

		if (!fs.existsSync(dir)){
			fs.mkdirSync(dirNum);
		}

		var util = require('util');

		fs.writeFile(dirNum+"/che", util.inspect(news), function(err) {
			if(err) {
				return console.log(err);
			}
			console.log("The bckup file was saved!");
		}); 

		//for(var i = 0; i < news.repopics.length; i++){
				//console.log('saving', news.repopics[i]);
		//}

	})

}
