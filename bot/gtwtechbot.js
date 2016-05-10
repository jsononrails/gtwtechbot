var mongoClient = require('mongodb').MongoClient,
    request = require('request'),
    assert = require('assert'),
    url = 'mongodb://localhost:27017/gtwtech',
    Twit = require('twit'),
	parseXML = require('xml2js').parseString;
    Bitly = require('bitly'),
    bitly = new Bitly('297477ea34f5d1aee0925ea9a58b7a0b5b9a6141'),
    twitterApi = new Twit({
        consumer_key: 'eG1WVmKdvHgIiFJPWr8rDdhY3', //process.env.PICKTWOBOT_TWIT_CONSUMER_KEY,
        consumer_secret: 'YDznS0E5N4x0MkQstXlIRVdW2YwU9VtJRw941O2nXKa6xtiTAO', //process.env.PICKTWOBOT_TWIT_CONSUMER_SECRET,
        access_token: '781570350-AaqycCXFDvOpIuSnB7GL3vGPnzRP7aNvL9hKvFkO', //process.env.PICKTWOBOT_TWIT_ACCESS_TOKEN,
        access_token_secret: 'HNoOCIoJk1EpK4wzhgDcYbRwYvArcOkfYzpPLLnucvEfg', //process.env.PICKTWOBOT_TWIT_ACCESS_TOKEN_SECRET
    }),

    // collectors 
    techcrunch = require('./collectors/techcrunch'),
    endgadget = require('./collectors/endgadget'),
    cnet = require('./collectors/cnet');
	techradar = require('./collectors/techradar');
	wired = require('./collectors/wired');
	verge = require('./collectors/verge'),
	technobuffalo = require('./collectors/technobuffalo'),
    arstechnica = require('./collectors/arstechnica');

// final tweets list
tweets = [];
var self;

module.exports = {
	tweets: tweets,
	
    appendTweet: function(tw) {
        this.tweets.push(tw);
    },
	
	appendTweets: function(tws) {
		for(i=0; i < tws.length; i++) {
			this.tweets.push(tws[i]);
		}
	},

    viewTweets: function() {
        console.log(this.tweets);
    },

    aggregateNews: function() {
		self = this;
		
        // collect endgadget
        setTimeout(
            techcrunch.aggregate(self.appendTweets),
            10000);
	
	    setTimeout(
	    	endgadget.aggregate(self.appendTweets),
	        20000);
			
		setTimeout(
			cnet.aggregate(self.appendTweets),
		    30000);
		
		setTimeout(
			techradar.aggregate(self.appendTweets),
		    40000);

		setTimeout(
			wired.aggregate(self.appendTweets),
		    50000);
		
		setTimeout(
			verge.aggregate(self.appendTweets),
		    60000);
/*			
		setTimeout(
			technobuffalo.aggregate(self.appendTweets),
		    70000);
*/				
		setTimeout(
			arstechnica.aggregate(self.appendTweets),
		    60000);
			
		setTimeout(self.shuffleTweets, 10000);	
	
    },

    shuffleTweets: function() {

        var m = tweets.length,
            t, i;

        // While there remain elements to shuffle…
        while (m) {

            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = tweets[m];
            tweets[m] = tweets[i];
            tweets[i] = t;
        }

        tweets = tweets;
		
		self.postTweets(self.insertPost);
    },

    postTweets: function() {

		var insertPost = this.insertPost;
        mongoClient.connect(url, function(err, db) {
            assert.equal(null, err);

            var collection = db.collection("post");

            for (i = 0; i < tweets.length; i++) {
            	self.insertPost(tweets[i], i, collection);
            }
        });

    },
	
    insertPost: function(tweet, delay, collection) {

        // Fetch the document
        collection.findOne({
            text: tweet.text
        }, function(err, item) {
            assert.equal(null, err);

            if (item !== null && tweet.text === item.text) {
				console.log('Tweet already exists: ' + tweet.text);
            } else {
				
                // compress url
                bitly.shorten(tweet.link)
                    .then(function(response) {
                        tweet.tweet = tweet.tweet + ' ' + response.data.url;
						tweet.status_code = response.status_code;
                    }, function(error) {
                        console.log(error);
                    }).then(function() {
						if(tweet.status_code == 200) {
							console.log('Posting tweet: ' + tweet.tweet);
							self.postTweet(tweet, delay);
						}
						else
							console.log('Bitly error: ' + tweet.status_code);
                    });		
            }
            return;
        });
    },
	
    postTweet: function(tweet, delay) {
		console.log('posting');
        var randTime = Math.floor(Math.random() * (1200000 - 300000) + 300000);
		
		console.log('Post ' + (i+1) + ' in ' + ((randTime / 1000)/60) + ' minutes \n\n' + tw.tweet + ' link: ' + tw.link);
		
		mongoClient.connect(url, function(err, db) { 
            
			assert.equal(null, err);
            var collection = db.collection("post");
			
            // Fetch the document
            collection.findOne({
                text: tweet.text
            }, function(err, item) {
                assert.equal(null, err);

                if (item !== null && tweet.text === item.text) {
					console.log('Tweet already exists: ' + tweet.text);
                } else {

                    postTweet(tweet.tweet, delay);

                    function postTweet(tw, i) {
                        
                        var randTime = Math.floor(Math.random() * (1200000 - 300000) + 300000);
						
						console.log('Post ' + (i+1) + ' in ' + ((randTime / 1000)/60) + ' minutes');
						
                        setTimeout(function() {
                            twitterApi.post('statuses/update', {
                                status: tw
                            }, function(err, data, response) {
                                if (!err) {
                                    console.log("Tweet successful");
									console.log("Saving Tweet");
									// insert post
			                        collection.insert({
			                            text: tweet.text
			                        });
								}
								else
									console.log(err);
                            })
                        }, i * randTime); // random
                    }
                }
                return;
            });
			
		});
    }
};