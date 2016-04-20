module.exports = {

    aggregate: function(cheerio, bitly, request, md5, callback) {
        request("http://www.theverge.com/tech", function(error, response, body) {

            if (error) {
                console.log("Couldn’t get page because of error: " + error);
                return;
            }

            // load the body of the page into Cheerio so we can traverse the DOM
            var $ 		= cheerio.load(body),
				links 	= $(".m-entry-slot h3").children("a");
				
			console.log("The Verge total posts: " + links.length)
			
            links.each(function(i, link) {
                // get the href attribute of each link
                var text = $(link).text(),
                    url = $(link).attr("href"),
                    shortUrl = "";

                function shortResult(p) {

					var tweet = { };
						tweet.text = text;
						tweet.tweet = text + ' ' + p + ' ' + 'via @Verge';
						tweet.link = p;
						tweet.hash = md5(tweet.text);

					callback(tweet);
                }
				
              // compress url
              bitly.shorten(url)
			  .then(function(response){
                  shortResult(response.data.url);
                }, function(error) {
				  console.log(error);  	
              });
			  
            });
        });
    }
};