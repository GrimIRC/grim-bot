require('es6-shim');
var Util = require("util");
var Bot = require("./lib/irc");

var GrimBot = function(profile) {
	Bot.call(this, profile);
	this.set_log_level(this.LOG_ALL);
	this.set_trigger("!"); // Exclamation
};

Util.inherits(GrimBot, Bot);

GrimBot.prototype.init = function() {
	Bot.prototype.init.call(this);

    // this.register_command("ping", this.ping);

    // pull in sub modules
    require('./src/smc')(this);

	this.on('command_not_found', this.unrecognized);
};


GrimBot.prototype.ping = function(cx, text) {
	cx.channel.send_reply (cx.sender, "Pong!");
};

GrimBot.prototype.unrecognized = function(cx, text) {
	cx.channel.send_reply(cx.sender, "There is no command: "+text);
};

var defaultName = "grim-" + process.env.USER;

var profile = [{
	host: "irc.freenode.net",
	port: 6667,
	nick: process.env.BOT_NICK || defaultName,
	password: process.env.BOT_PASSWORD || "",
	user: process.env.BOT_USER || process.env.BOT_NICK || defaultName,
	real: process.env.BOT_REAL || process.env.BOT_NICK || "Some Bot",
	channels: [
        process.env.NODE_ENV === "production" ? "##grim" : "##" + defaultName
    ]
}];

console.log("Starting bot with options:");
Object.keys(profile[0]).forEach(function(key){
    console.log(key + ":" + "         ".slice(key.length) + profile[0][key]);
});

(new GrimBot(profile)).init();
