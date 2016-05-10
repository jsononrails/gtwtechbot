var gtwTechBot = require('./bot/gtwtechbot');

function start() {
	
    gtwTechBot.aggregateNews();

    // shuffle collected tweets
  //  setTimeout(gtwTechBot.shuffleTweets, 5000);

    // preview collected tweets
    //setTimeout(gtwTechBot.viewTweets, 7000);

    // post tweets
   // setTimeout(gtwTechBot.postTweets(gtwTechBot.insertPost), 7000);
}

start();

var startBot = setInterval(start, 19000000) // 5hours