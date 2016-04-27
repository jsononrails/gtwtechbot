var mongoClient = require('mongodb').MongoClient,
    request = require('request'),
    assert = require('assert'),
    url = 'mongodb://localhost:27017/gtwtech',
    Twit = require('twit'),
	md5 = require('md5'),
    cheerio = require("cheerio"),
	parseXML = require('xml2js').parseString;
    Bitly = require('bitly'),
    bitly = new Bitly('297477ea34f5d1aee0925ea9a58b7a0b5b9a6141'),
    twitterApi = new Twit({
        consumer_key: 'uRqwvIyhOWGnvNdkh2JasUpTE', //process.env.PICKTWOBOT_TWIT_CONSUMER_KEY,
        consumer_secret: '5SdqctrFR27c6Zm7AsEHVci4kOggKYVkaVPWmTuMAR2BtkKZit', //process.env.PICKTWOBOT_TWIT_CONSUMER_SECRET,
        access_token: '781570350-gfgZuDPgZqdHU294Bi9zkNAGKerOgEMODhTWaxw0', //process.env.PICKTWOBOT_TWIT_ACCESS_TOKEN,
        access_token_secret: 'yYOjBYlpk9drRXblfEeL0lkAA8du0OMIOjnFsaLThWtR6', //process.env.PICKTWOBOT_TWIT_ACCESS_TOKEN_SECRET
    }),

    // collectors 
    techCrunch = require('./collectors/techcrunch'),
    endgadget = require('./collectors/endgadget'),
    verge = require('./collectors/verge'),
    technobuffalo = require('./collectors/technobuffalo'),
    cnet = require('./collectors/cnet');
    arstechnica = require('./collectors/arstechnica');

// final tweets list
tweets = [];

module.exports = {

    appendTweet: function(tw) {
        tweets.push(tw);
    },

    viewTweets: function() {
        console.log(tweets);
    },

    aggregateNews: function() {

        // collect techcrunch
       setTimeout(
            techCrunch.aggregate(cheerio, bitly, request, md5,  this.appendTweet),
            5000);

        // collect endgadget
       /*setTimeout(
            endgadget.aggregate(parseXML, bitly, request, md5,  this.appendTweet),
            10000);*/
	  
      
  		// collect verge
        setTimeout(
            verge.aggregate(cheerio, bitly, request, md5,  this.appendTweet),
            15000);

        // collect cnet
        setTimeout(
            cnet.aggregate(cheerio, bitly, request, md5,  this.appendTweet),
            20000);

        // collect techno buffalo
       setTimeout(
        	technobuffalo.aggregate(cheerio, bitly, request, md5, this.appendTweet),
        	25000);

		// collect ars technica
        setTimeout(
        	arstechnica.aggregate(cheerio, bitly, request, md5, this.appendTweet),
        	30000);
		
    },

    dbTest: function() {
        mongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            console.log("Connected correctly to mongo server.");
            db.close();
        });
    },

    dbCreateCollection: function() {
        mongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            console.log("Connected correctly to mongo server.");

            db.createCollection("post", {
                capped: true,
                size: 5242880,
                max: 5000
            });

            db.close();
        });
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
    },

    postTweets: function() {

        mongoClient.connect(url, function(err, db) {
            assert.equal(null, err);

            var collection = db.collection("post");

            for (i = 0; i < tweets.length; i++) {

                var tw = tweets[i];
                insertHash(tw, i, collection);

            }

            function insertHash(tweet, delay, collection) {

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
										// insert post hash
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
            }

        });

    }
};