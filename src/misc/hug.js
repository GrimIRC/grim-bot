// Hugs people who need hugs
// limit 1 hug per 30 minutes

module.exports = function(bot){
    bot.register_command("hug", function(cx, text){
        var userTo = text.trim();
        var target = (userTo.length > 0) ? userTo : 'everyone';
        cx.channel.send_action('hugs ' + target);
    });
};