var FeedParser = require('feedparser');
var request = require('request');

module.exports = {
	
    aggregate: function(cb) {
		var tweets = [];
		var options = {
			url: 'http://feeds.arstechnica.com/arstechnica/features',
			method: 'GET'
		};
        var req = request(options),
		feedparser = new FeedParser();
		
		req.on('error', function(error) {
			console.log('Http Request error: ' + error);
		});
		
		req.on('response', function(res) {
			var stream = this;
			
			if(res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

			stream.pipe(feedparser);
		});
		
		feedparser.on('error', function(error) {
			console.log('Feed parser error: ' + error);
		});
		
		feedparser.on('readable', function() {

			var stream = this,
				meta = this.meta,
			item;
			
			while(item = stream.read()) {
				var tweet = {
					text: item.title,
					tweet: item.title,
					link: item.link
				};
				tweets.push(tweet);
			}
		})
		
		feedparser.on('end', function() {
			cb(tweets);
		});

    }
};