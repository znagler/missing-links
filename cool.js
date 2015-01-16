// tools.js
var request = require('request');
var cheerio = require('cheerio');
var util = require('util');

var arrayUnique = function(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c)
        return p
    }, [])
}

// ========
module.exports = {
	Path: function(startPage,finishPage) {
		this.startPage = startPage
		this.finishPage = finishPage
		this.firstLinks = []
		this.nameTest = "hi"
		this.secondLinks = []
		this.firstBackLinks = null
		this.secondBackLinks = []
		this.frontLinksReady= false
		this.confirmedBackLinks = []
		this.backLinksReady = false
		this.successObject = {
			degree0: null,
			degree1: [],
			degree2: []
		}
		this.getLinksOnPage = function(page,callback){
			var url = "http://en.wikipedia.org" + page
			request(url, function (error, response, html) {
				if (!error && response.statusCode == 200) {
					var $ = cheerio.load(html);
					var links = $('a')
					var linkDataArray = []
					var index = 0
					$(links).each(function(i, link){
						var href = $(link).attr('href')
						var linkDataItem = []
						// console.log(util.inspect(link, false, null))

						// console.log(link.text())


						if (/^\/wiki[^:]*$/.test(href) && href != page && href != "/wiki/Main_Page" && href != "/wiki/International_Standard_Book_Number"){
							
							linkDataItem[0] = href
							linkDataItem[1] = link.children[0].data
							linkDataArray[index] = linkDataItem

							index++
						}

					})
					callback(arrayUnique(linkDataArray))
				}
			})
		},
		this.getLinksOnBacklinkPage = function(page,callback){
		var url = "http://en.wikipedia.org/w/index.php?title=Special:WhatLinksHere/"+ page.substring(6)+"&limit=10000"
		request(url, function (error, response, html) {
			if (!error && response.statusCode == 200) {
				var $ = cheerio.load(html)
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
		this.populateDegreeOne = function(){
			this.secondLinks.forEach(function(pair){

				if (pair[1] == this.finishPage) {
					this.successObject.degree1.push(pair[0])
				}
			}.bind(this))
		}
		this.populateDegreeTwo = function(){
			this.firstBackLinks.forEach(function(backlink){
				this.secondLinks.forEach(function(pair){
					if (pair[1] == backlink) {
						this.successObject.degree2.push([pair[0],backlink])
					}
					}.bind(this))
				}.bind(this))
		}

		this.startPoll = function(callback){
			var counter = 0
			var interval = setInterval( function() {
				counter++
			  console.log(this.frontLinksReady,this.backLinksReady,this.successObject);
			  if (this.frontLinksReady && this.backLinksReady ) {
			  	console.log(counter)
			  	console.log("done")
			    clearInterval(interval);
			  	callback()
			  }
			}.bind(this), 1000);
		}


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

