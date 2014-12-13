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
	
	this.register_command("ping", this.ping);
	this.on('command_not_found', this.unrecognized);
};


GrimBot.prototype.ping = function(cx, text) {
	cx.channel.send_reply (cx.sender, "Pong!");
};

GrimBot.prototype.unrecognized = function(cx, text) {
	cx.channel.send_reply(cx.sender, "There is no command: "+text);
};

var profile = [{
	host: "irc.freenode.net",
	port: 6667,
	nick: "mybot",
	password: "password_to_authenticate",
	user: "username",
	real: "Real Name",
	channels: ["#channels", "#to", "#join"]
}];

(new GrimBot(profile)).init();
