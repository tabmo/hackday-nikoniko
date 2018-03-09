/**
 * Description:
 *    TODO
 #
 # Commands:
 #   niko test - affiche Bonjour !
 #   hubot
 #   hubot
 */

module.exports = function(robot) {

  robot.respond(/test/i, function(res) {
    res.reply('Bonjour !')
  });

};
