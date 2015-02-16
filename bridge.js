// tools.js
var request = require('request');
var cheerio = require('cheerio');
var util = require('util');

// ========
module.exports = {
	Path: function(startPage, finishPage) {
		this.startPage = startPage
		this.finishPage = finishPage
		this.firstLinks = []
		this.secondLinks = []
		this.firstBackLinks = null
		this.secondLinks = []
		this.frontLinksReady = false
		this.backLinksReady = false
		this.confirmedBackLinks = []
		this.delivered = false
		this.checkAt25 = false
		this.getLinksOnPage = function(page, howmany, callback) {
				var url = "http://en.wikipedia.org" + page
				request(url, function(error, response, html) {
					if (!error && response.statusCode == 200) {
						var $ = cheerio.load(html);
						var links = $('a:not(table *)')
						var linkDataArray = []
						var index = 0
						$(links).each(function(i, link) {
								var href = $(link).attr('href')
								var linkDataItem = []
								if (link.children[0] && /^\/wiki[^:]*$/.test(href) && href != page && href != "/wiki/Main_Page" && href != "/wiki/International_Standard_Book_Number" && link.children[0].data) {
									linkDataItem[0] = href
									linkDataItem[1] = link.children[0].data
									linkDataArray[index] = linkDataItem
									index++
								}
							})
							// var uniqueHrefArray = arrayUnique(linkDataArray)
						if (linkDataArray.length > howmany) {
							callback(linkDataArray.slice(0, howmany))
						} else {
							callback(linkDataArray)
						}
						return
					}
				})
			},
			this.getLinksOnBacklinkPage = function(page, howmany, callback) {
				var url = "http://en.wikipedia.org/w/index.php?title=Special:WhatLinksHere/" + page.substring(6) + "&limit=400"
				request(url, function(error, response, html) {
					if (!error && response.statusCode == 200) {
						var $ = cheerio.load(html)
						var links = $('a')
						var hrefArray = []
						var index = 0
						$(links).each(function(i, link) {
								var href = $(link).attr('href')
								if (/^\/wiki[^:]*$/.test(href) && href != page && href != "/wiki/Main_Page" && href != "/wiki/International_Standard_Book_Number") {
									hrefArray[index] = href
									index++
								}

							})
							// var uniqueHrefArray = arrayUnique(hrefArray)
						if (hrefArray.length > howmany) {
							callback(getRandomSubarray(hrefArray, howmany))
								// callback(hrefArray.slice(0,howmany))
						} else {
							callback(hrefArray)
						}
						return
					}
				})
			},
			this.success = function() {

				for (i = 0; i < this.confirmedBackLinks.length; i++) {
					for (j = 0; j < this.secondLinks.length; j++) {
						if (this.confirmedBackLinks[i][0] == this.secondLinks[j][0]) {
							return this.confirmedBackLinks[i].concat(this.secondLinks[j])
						}
					}
				}
				return null

			}
	}
}

var getRandomSubarray = function(arr, size) {
	var shuffled = arr.slice(0),
		i = arr.length,
		temp, index;
	while (i--) {
		index = Math.floor((i + 1) * Math.random());
		temp = shuffled[index];
		shuffled[index] = shuffled[i];
		shuffled[i] = temp;
	}
	return shuffled.slice(0, size);
}

// var arrayUnique = function(a) {
// 	return a.reduce(function(p, c) {
// 		if (p.indexOf(c) < 0) p.push(c)
// 		return p
// 	}, [])
// }