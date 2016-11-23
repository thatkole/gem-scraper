var image_downloader = require('image-downloader');
var scraperjs = require('scraperjs');
var scrapeLink = "http://www.android-gems.com/user/thatkole?type=favorite&info_start=420";
const gitclone = require('gitclone');

var num = 22
var dirNum = "./page_"+num;

var fs = require('fs');

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

		// clones with SSH 
		//gitclone('node-minibase/minibase', true)

		// Download to a directory and save with the original filename 

		if (!fs.existsSync(dirNum)){
			fs.mkdirSync(dirNum);
		}

		var util = require('util');

		fs.writeFile(dirNum+"/che", util.inspect(news), function(err) {
			if(err) {
				return console.log(err);
			}

			console.log("The file was saved!");
		}); 

		for(var i = 0; i < news.repopics.length; i++){
			//console.log(news.repopics[i]);
				console.log('saving', news.repopics[i]);

			var options = {
				url: news.repopics[i],
				dest: dirNum,
				done: function(err, filename, image) {
					if (err) {
						throw err;
					}
					console.log('file saved to', filename);
				},
			};

			image_downloader(options);
		}

	})
