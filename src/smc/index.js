/**
 *
 * @param Bot bot
 * @param db
 */
module.exports = function addSmcFeatures(bot, db){
    var state = {};
};

var events = require('events');
var util = require('util');

/**
 *
 * @param {startsAt,endsAt,topic,type} opts
 * startsAt/endsAt are milliseconds epoch timestamps
 * topic is an arbitrary topic string
 * type is one of smc,sdc,smuc,ssc,scc
 * @constructor
 */
function SMC(opts){
    var typeName = variantsToName[type];
    var typeNameFull = "speed " + typeName + " contest";
    events.EventEmitter.call(this);

    var _timerIds = {};

    if (!variantsToName[type]) {
        throw new TypeError("type must be one of " + Object.keys(variantsToName).join(", "));
    }

    if (!(startsAt > Date.now() && endsAt >= Date.now && endsAt >= startsAt - 1000*60*10)) {
        throw new RangeError("cannot have a SMC for " + (endsAt - startsAt)/1000 + "seconds");
    }

    if (!topic) {
        throw new TypeError("topic cannot be blank");
    }

    this.cancel = function(){
        clearTimeout(_timerIds.end);
        clearTimeout(_timerIds.warning);
        return "Canceling the " + typeNameFull;
    };

    this.start = function(){

    };
}

util.inherits(SMC, events.EventEmitter);


var variantsToName = Object.assign(Object.create(null), {
    smc: "modeling",
    sdc: "drawing",
    smuc: "music",
    ssc: "sculpting",
    scc: "coding"
});
