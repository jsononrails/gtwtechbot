module.exports = {

    aggregate: function(parseXML, bitly, request, md5, callback) {
		var baseUrl = "http://www.engadget.com/rss.xml";
		 
        request(baseUrl, function(error, response, body) {

            if (error) {
                console.log("Couldn’t get page because of error: " + error);
                return;
            }

			
			parseXML(body, function(err, result) {
				//console.dir(JSON.stringify(result));
				console.log(result.rss.channel[0].item[0].title);
			});
			
			return;
			
            // load the body of the page into Cheerio so we can traverse the DOM
            var $ 		= cheerio.load(body),
				links 	= $("h3").children("a");
			
			console.log("Engadget total posts: " + links.length)
            
			links.each(function(i, link) {
                // get the href attribute of each link
                var text = $(link).find('span').text(),
                    url = "http://www.engadget.com/" + $(link).attr("href"),
                    shortUrl = "";

                function shortResult(p) {

					var tweet = { };
						tweet.text = text;
						tweet.tweet = text + ' ' + p + ' ' + 'via @engadget';
						tweet.link = p;
						tweet.hash = md5(tweet.text);
						console.log(tweet);
					callback(tweet);
                }
				
              // compress url
              /*bitly.shorten(url)
			  .then(function(response){
                  shortResult(response.data.url);
                }, function(error) {
				  console.log(error);  	
              });*/
			  
            });
        });
    }
};