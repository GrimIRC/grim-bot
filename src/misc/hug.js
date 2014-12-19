// Hugs people who need hugs
// limit 1 hug per 30 minutes

module.exports = function(bot){
    // map of username : Boolean
    var hugsGiven = {};


    var giveHug = function(cx){
        var target = cx.sender.name;

        if (hugsGiven[target]) {
            // you already got your hug!
            return;
        }

        cx.channel.send_action('hugs ' + target);
        hugsGiven[target] = true;

        // clear it after 30 minutes
        setTimeout(function(){
            delete hugsGiven[target];
        }, 1000*60*30);
    };

    // ugh, urgh, uggh, etc.
    bot.register_listener(/\bu.?g.?h?\b/gi, giveHug);

    // hug me, HUG ME, hugme, hugmee
    bot.register_listener(/\bhug *me+\b/gi, giveHug);

    // !!!, !?!!, !!?!, !?!?!, !!!!!
    bot.register_listener(/\b!+\?*!+\?*!+\b/gi, giveHug);

    // x_x, <_<, >_>, >_<, :/, :(, :[
    bot.register_listener(/([x<>])_\1/gi, giveHug);
    bot.register_listener(/>_</gi, giveHug);
    bot.register_listener(/:[\/\(\[]/gi, giveHug);

    // you get the idea :-)
    bot.register_listener(/\b(fuck|shit)/gi, giveHug);
};