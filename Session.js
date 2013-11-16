define(['phpjs/functions/var/unserialize'],function () {
    'use strict';

    function Session(sessionString) {
        this._params = this._decode(sessionString);
    }

    Session.prototype.get = function(name) {
        if (!this.has(name)) {
            throw new Error("Unknown session param `"+name+"`");
        }

        return this._params[name];
    };

    Session.prototype.has = function(name) {
        return typeof this._params[name] !== "undefined";
    };

    /**
     * Returns line separator of sessionString
     *
     * @throws Error on invalid session string
     *
     * @param {String} sessionString
     * @returns {String}
     * @private
     */
    Session.prototype._getLineSeparator = function(sessionString) {
        var matches = sessionString.match(/^[a-z0-9]+-/i);
        if (typeof matches[0] !== "string") {
            throw new Error('Invalid session string, no prefix found in `'+sessionString+'`');
        }

        return matches[0];
    };

    Session.prototype._getParamId = function(sessionLine) {
        var matches = sessionLine.match(/^([a-z0-9_]+)\|/i);
        if (typeof matches[1] !== "string") {
            throw new Error('Invalid session line string, no prefix found in `'+sessionLine+'`');
        }

        return matches[1];
    };

    /**
     * Returns array of lines in format key|<serialized data>
     *
     * @param sessionString
     * @returns {String[]}
     * @private
     */
    Session.prototype._explodeParamLines = function(sessionString) {
        var lineSeparator = this._getLineSeparator(sessionString);
        var lines = sessionString.split(lineSeparator);

        // first element of this array is always empty
        lines.splice(/* indexToRemove */ 0, /* numberToRemove */ 1);

        return lines;
    };

    /**
     *
     *
     * @param {String} lineString
     * @private
     */
    Session.prototype._parseLine = function(lineString) {
        var paramId = this._getParamId(lineString);
        var value   = lineString.substring(paramId.length + 1); // +1 character |

        return {
            id:    paramId,
            value: unserialize(value)
        };
    };

    Session.prototype._decode = function(sessionString) {
        var res = {};
        var sessionStringLines = this._explodeParamLines(sessionString);


        for (var index in sessionStringLines) {
            var line = this._parseLine(sessionStringLines[index]);
            res[line.id] = line.value;
        }

        return res;
    };

    return Session;
});