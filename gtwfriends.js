var _ 			= require('lodash');
var Client 		= require('node-rest-client').Client;
var Twit 		= require('twit');
var async 		= require('async');

var t = new Twit({
	consumer_key: '9yKMeBL5k3ft8GUihiT31uSs5', //process.env.PICKTWOBOT_TWIT_CONSUMER_KEY,
    consumer_secret: 'HZuKPGFAGMhntHtTX8xiaWJDKmi1djwBbhCkU20Mkk2dTCt5B6', //process.env.PICKTWOBOT_TWIT_CONSUMER_SECRET,
    access_token: '781570350-RSooAWMvQej4faNkUn8bGgq69rM1ZtR9kovSUCVp', //process.env.PICKTWOBOT_TWIT_ACCESS_TOKEN,
    access_token_secret: 'zV2orNvP0rLGVWldF68mCyJ6KEAD0IwEgkRiRO0Rn96Gb', //process.env.PICKTWOBOT_TWIT_ACCESS_TOKEN_SECRET
});

run = function() {
	async.waterfall([
		getFollowers,
		//cleanDeadFollows
	],
	function(err, botData) {
		if(err) {
			console.log('There was an error posting to Twitter: ', err);
		} else {
			console.log('Tweet successful!');
		}
	});
};

getFollowers = function(cb) {
	t.get('followers/ids', { screen_name: 'arstechnica' },  function (err, data, response) {
		if(!err) {
			var friends = data.ids
			_.each(friends, function(friend_id) {
					
					t.post('friendships/create', { id: friend_id }, function(err, reply) {
						console.log(reply);
					});
					
			});
		}
	})
}
	
cleanDeadFollows = function(botData, cb) {
	t.get('followers/ids', function(err, reply) {
		if(err) return cb(err, botData);

		var followers = reply.ids;

		t.get('friends/ids', function(err, reply) {
	          if(err) return cb(err, botData);

	          var friends = reply.ids
	            , pruned = false;

	          while(!pruned) {
	            var target = randIndex(friends);

	            if(!~followers.indexOf(target)) {
	              pruned = true;
	              t.post('friendships/destroy', { id: target }, function(err, reply) {
					cb(err, botData);
				  });   
	            }
	          }
		});
	});
}

function randIndex (arr) {
  var index = Math.floor(arr.length*Math.random());
  return arr[index];
};

run();
								
var interval = setInterval(run, 14400000);
