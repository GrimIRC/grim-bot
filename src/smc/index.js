var Bot = require('../../lib/irc/index.js');
/**
 * Add smc functionality to bot
 * @param {Bot} bot
 * @param db
 */
module.exports = function addSmcFeatures(bot, db){
    var state = {};
    var currentSMC = null;

    bot.register_command("cancel", function(cx, text){
        if (currentSMC) {
            cx.channel.send_reply(cx.sender, "The " + currentSMC.opts.variant
              + " is now canceled.  !" + currentSMC.opts.variant + " to start another.");
            currentSMC.cancel();
        }
        else {
            cx.channel.send_action("tries to find something to cancel");
        }
    });

    bot.register_command("in", function(cx, text){
        if (currentSMC) {
            currentSMC.userIn(cx.sender);
            cx.channel.send_reply(cx.sender, "lets's do this!");
        }
        else {
            cx.channel.send_reply(cx.sender, "calm down, there isn't a smc going on right now");
        }
    });

    bot.register_command("out", function(cx, text){
        if (currentSMC) {
            currentSMC.userOut(cx.sender);
            cx.channel.send_reply(cx.sender, "you're a party pooper!");
        }
        else {
            cx.channel.send_reply(cx.sender, "calm down, there isn't a smc going on right now");
        }
    });

    bot.register_command("start", function(cx, text){
        if (currentSMC) {
            currentSMC.start();
            cx.channel.send_action("prepares the " + currentSMC.opts.variant);
        }
        else {
            cx.channel.send("What should I start?");
        }
    });

    Object.keys(variantsToName).forEach(function(variant){
        // register the shorthand smc, sdc, etc. commands
        bot.register_command(variant, function(cx, text){
            var parts = text.trim().split(" ");
            var smcSyntax = "!" + variant + " duration topic";
            var options = {sender: cx.sender, variant: variant};

            // bail if there's currently a smc
            if (currentSMC) {
                cx.channel.send_reply(cx.sender, "There's already a SMC in progress !cancel it to start another");
            }

            // duration
            if (parts.length > 0) {
                var duration = Number(parts[0]);
                if (duration && duration >= 5 && duration <= 90) {
                    options.duration = duration;
                }
                else {
                    cx.channel.send_reply(cx.sender, parts[0] + " is an invalid duration, try again");
                    return;
                }
            }
            else {
                cx.channel.send_reply(cx.sender, smcSyntax);
                return;
            }

            // topic
            if (parts.length > 1) {
                options.topic = parts.slice(1).join(" ");
                if (options.topic.length < 5) {
                    cx.channel.send_reply(cx.sender, "topic must be at least 5 characters");
                    return;
                }
            }
            else {
                cx.channel.send_reply(cx.sender, smcSyntax);
                return;
            }

            // good to go!
            currentSMC = new SMC(options, cx);
            currentSMC.on('cancel', function(){
                currentSMC = null;
            });
            cx.channel.send_reply(cx.sender, "Say !in to join, and !start to go");
        });
    });
};

var events = require('events');
var util = require('util');
var md5 = require('MD5');

/**
 *
 * @param {{duration,topic,variant,creator}} opts
 * duration is time in MS from the start point
 * topic is an arbitrary topic string
 * variant is one of smc,sdc,smuc,ssc,scc
 * @constructor
 */
function SMC(opts, cx){
    var variantName = variantsToName[opts.variant];
    var variantNameFull = "speed " + variantName + " contest";
    this.opts = opts;
    this.users = [];
    events.EventEmitter.call(this);

    var _timerIds = {};

    this.cancel = function(){
        Object.keys(_timerIds).forEach(function(type){
            clearTimeout(_timerIds[type]);
            delete  _timerIds[type];
        });

        this.emit('cancel');
    };

    var getUserString = function(){
        return this.users.map(function(user){ return user.name }).join(", ");
    }.bind(this);

    this.start = function(){
        clearTimeout(_timerIds.start);
        _timerIds.start = setTimeout(function(){
            if (this.users.length >= 2) {
                cx.channel.send("Go go go!");

                var startTime = Date.now();
                var durationMS = opts.duration*1000*60;

                _timerIds.warning = setTimeout(function(){
                    cx.channel.send("Hey! " + getUserString() + "!  Half way warning!");
                }, durationMS / 2);

                _timerIds.warning2 = setTimeout(function(){
                    cx.channel.send("Hey! " + getUserString() + "!  1 minute!");
                }, durationMS - 1000*60);

                _timerIds.end = setTimeout(function(){
                    cx.channel.send("Hey! " + getUserString() + "!  Check your PMs for the upload link!");
                    this.sendUploadLinks();
                }.bind(this), durationMS - 1000*60);
            }
            else {
                cx.channel.send("Not enough people want to do it, try again later");
                this.cancel();
            }
        }.bind(this), 1000*60);
    };

    this.sendUploadLinks = function(){
        this.users.forEach(function(user){
            var key = crypto.randomBytes(8).toString(16);
            // TODO: store key in mongo
            var url = 'http://grimirc.org/uploads/' + opts.variant + '/' + md5(user.host) + '?key=' + key;
        });
    };

    this.userIn = function(user){
        this.users.push(user);
        cx.channel.send_reply(user, "is ready to " + opts.variant + "!");
    };

    this.userOut = function (user) {
        var index = this.users.findIndex(function(u2){
            return u2.host === user.host;
        });
        if (index !== -1) {
            this.users.splice(index, 1);
        }
    }
}

util.inherits(SMC, events.EventEmitter);


var variantsToName = Object.assign(Object.create(null), {
    smc: "modeling",
    sdc: "drawing",
    smuc: "music",
    ssc: "sculpting",
    scc: "coding"
});
