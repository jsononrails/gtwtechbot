module.exports = {
    aggregate: function(parseXML, bitly, request, md5, callback) {
        var baseUrl = "http://www.engadget.com/rss.xml";
        request(baseUrl, function(error, response, body) {
            if (error) {
                console.log("Couldn’t get page because of error: " + error);
                return;
            }
            parseXML(body, function(err, result) {
                var items = result.rss.channel[0].item;
                for (i = 0; i < items.length; i++) {
                    
					var tweet = {};
					var title = items[i].title;
                    tweet.text = items[i].title;
					tweet.tweet = items[i].title;
                    console.log(tweet);
					
	                function shortResult(p) {
	                    tweet.tweet = title + ' ' + p + ' ' + 'via @engadget';
	                    tweet.link = p;    
						console.log(tweet);
	                    callback(tweet);
	                }
	                // compress url
	                bitly.shorten(items[i].link)
	                    .then(function(response) {
	                        shortResult(response.data.url);
	                    }, function(error) {
	                        console.log(error);
	                    });
                }
            });
        });
    }
};