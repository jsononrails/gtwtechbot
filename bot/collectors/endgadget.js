module.exports = {

    aggregate: function(cheerio, bitly, request, cb) {
        request("http://www.engadget.com", function(error, response, body) {

            if (error) {
                console.log("Couldn’t get page because of error: " + error);
                return;
            }

            // load the body of the page into Cheerio so we can traverse the DOM
            var $ = cheerio.load(body),
                links = $("li.lede-item.post").children("a"),
                links2 = $("h2.h2").children("a");
			console.log("Engadget total posts: " + (links.length + links2.length))
            links.each(function(i, link) {
                // get the href attribute of each link
                var text = $(link).find('.lede-post-title').find('span').text(),
                    url = 'http://www.engadget.com' + $(link).attr("href"),
                    shortUrl = "";

                function shortResult(p) {
                    var tweet = text + ' ' + p + ' ' + 'via @engadget';
                    cb(tweet);
                }

                // compress url
                bitly.shorten(url, function(err, response) {
                    if (err) throw err;
                    shortResult(response.data.url);
                });

            });

            // links 2
            links2.each(function(i, link) {
                // get the href attribute of each link
                var text = $(link).text(),
                    url = 'http://www.engadget.com/' + $(link).attr("href"),
                    shortUrl = "";

                function shortResult(p) {
                    var tweet = text + ' ' + p + ' ' + 'via @engadget';
                    cb(tweet);
                }

                // compress url
                bitly.shorten(url, function(err, response) {
                    if (err) throw err;
                    shortResult(response.data.url);
                });

            });
        });
    }
};