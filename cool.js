// tools.js
var request = require('request');
var cheerio = require('cheerio');

var arrayUnique = function(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
};


// ========
module.exports = {
	Path: function(startPage,finishPage) {
		this.startPage = startPage;
		this.finishPage = finishPage;
		this.firstLinks = [];
		this.nameTest = "hi";
		this.secondLinks = [];
		this.getLinksOnPage = function(page,callback){
			var url = "http://en.wikipedia.org" + page
			request(url, function (error, response, html) {
				if (!error && response.statusCode == 200) {
					var $ = cheerio.load(html);
					var links = $('a')
					var hrefArray = []
					var index = 0
					$(links).each(function(i, link){
						var href = $(link).attr('href')

						if (/^\/wiki[^:]*$/.test(href) && href != page && href != "/wiki/Main_Page" && href != "/wiki/International_Standard_Book_Number"){
							
							hrefArray[index] = href
							index++
						}

					})
					callback(arrayUnique(hrefArray))
				}
			})
		},
		this.getSecondLinks = function(callback){
			console.log("start of getSecondLinks")
			
			this.firstLinks.forEach(function(entry) {

	    	var url = "http://en.wikipedia.org" + entry
	    	// console.log(url)

				request(url, function (error, response, html) {
					if (!error && response.statusCode == 200) {
						var $ = cheerio.load(html);
						var links = $('a')
						var hrefArray = []
						var index = 0
						$(links).each(function(i, link){
							var href = $(link).attr('href')

							if (/^\/wiki[^:]*$/.test(href) && href != entry && href != "/wiki/Main_Page" && href != "/wiki/International_Standard_Book_Number"){
								
								var newSecondLink = [entry]
								newSecondLink.push(href)
								console.log("inside loop")
								console.log(secondLinks)
								secondLinks.push(newSecondLink)

								// hrefArray[index] = href
								index++
							}

						})
						// console.log(hrefArray)
					}
				})
	   	 // 	getLinks(url, function(responseTwo){
	    	// // console.log(responseTwo)
	    	// })

			})
	    console.log("done with forEach")

		}

	}
}

