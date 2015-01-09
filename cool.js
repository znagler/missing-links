// tools.js
// ========
module.exports = {

	Linkset: function(name) {
		this.name = name;
		this.talk = function() {
			console.log( this.name + " say meeow!" )
			}
	},

};

