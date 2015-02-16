var express = require('express')
var app = express()
var request = require('request')
var cheerio = require('cheerio')
var http = require('http')
var bodyParser = require('body-parser')
var bridge = require('./bridge')
var form_submitting = false
app.set('views', __dirname + '/public/views')
app.set('view engine', 'ejs')
app.set('port', (9000))
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'))
app.get('/', function(request, response) {
	response.render('index.ejs')
})

app.post('/start', function(req, res) {
	var url = "http://en.wikipedia.org/wiki/" + (req.body.start_wiki.split(' ').join('_'))
	request(url, function(error, response, html) {
		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(html)
			res.end($('link')['0']['attribs']['href'].match(/\/([^/]*)$/)[1]);
		}
	})
})

app.post('/finish', function(req, res) {
	var url = "http://en.wikipedia.org/wiki/" + (req.body.finish_wiki.split(' ').join('_'))
	request(url, function(error, response, html) {
		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(html);
			res.end($('link')['0']['attribs']['href'].match(/\/([^/]*)$/)[1]);
		}
	})
})


app.post('/get-links', function(req, res) {

	req.setTimeout(8 * 60 * 1000, function() {
		req.abort()
	})

	var newPath = new bridge.Path(req.body.startPage, req.body.finishPage)
	newPath.getLinksOnBacklinkPage(newPath.finishPage, 200, function(backLinkResponse) {
		newPath.getLinksOnPage(newPath.startPage, 200, function(frontLinkResponse) {
			// console.log("BL length: ", backLinkResponse.length)
			// console.log("FL length: ", frontLinkResponse.length)

			var zip = getZippedArrayAndLeftOvers(backLinkResponse, frontLinkResponse)
			var allPagesToScrape = zip[0].concat(zip[1]).slice(0, 250)
				// console.log("full length:",allPagesToScrape.length)
			allPagesToScrape.forEach(function(link, index) {
				// console.log(index)
				if ((index % 2 && index <= zip[0].length) || (index > zip[0].length && !zip[2])) { //front
					// 	console.log("front")
					newPath.getLinksOnPage(link[0], 200, function(frontLinkPageLinks) {
						if (newPath.delivered) res.end()
						if (!newPath.delivered && (index === allPagesToScrape.length - 1)) {
							// console.log("at 250")
							res.send({
								solved: false,
								bl: newPath.confirmedBackLinks,
								fl: newPath.secondLinks
							})
						}
						if (newPath.confirmedBackLinks.length > 25 && !newPath.checkAt25) {
							// console.log("check happening at:",index)
							newPath.checkAt25 = true
							solution = newPath.success()
							if (solution) {
								res.send({
									solved: true,
									solution: solution
								})
								newPath.delivered = true
								res.end()
							}
						}
						// console.log("responseF",index,newPath.secondLinks.length,newPath.confirmedBackLinks.length)
						frontLinkPageLinks.forEach(function(frontPageLink) {
							newPath.secondLinks.push([frontPageLink[0], frontPageLink[1], link[0], link[1]])

						})
					})

				} else { //back
					newPath.getLinksOnPage(link, 200, function(backLinkPageLinks) {
						if (newPath.delivered) res.end()
						if (!newPath.delivered && (index === allPagesToScrape.length - 1)) {
							// console.log("at 250")
							res.send({
								solved: false,
								bl: newPath.confirmedBackLinks,
								fl: newPath.secondLinks
							})
						}
						if (newPath.confirmedBackLinks.length > 25 && !newPath.checkAt25) {
							// console.log("check happening at:",index)
							newPath.checkAt25 = true
							solution = newPath.success()
							if (solution) {
								res.send({
									solved: true,
									solution: solution
								})
								newPath.delivered = true
								res.end()
							}
						}
						backLinkPageLinks.forEach(function(frontlink) {
							if (frontlink[0] == newPath.finishPage) {
								newPath.confirmedBackLinks.push([link, frontlink[1]])
							}
						})
					})
				}
			})
		})
	})
})


app.post('/get-pages-for-spinner', function(req, res) {
	var spinPath = new bridge.Path(req.body.startPage, req.body.finishPage)
	spinPath.getLinksOnPage(req.body.startPage, 150, function(response) {
		res.send(response)
	})
})


app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'))
});



var arrayUnique = function(a) {
	return a.reduce(function(p, c) {
		if (p.indexOf(c) < 0) p.push(c);
		return p;
	}, [])
}


var getZippedArrayAndLeftOvers = function(backlinks, frontlinks, lengthlimit) {
	var backlinksLonger = false
	if (backlinks.length > frontlinks.length) backlinksLonger = true
	var largerLength = Math.max(backlinks.length, frontlinks.length)
	var smallerLength = Math.min(backlinks.length, frontlinks.length)
	zippedArray = []
	leftovers = []
	counter = 0

	while (counter < largerLength) {
		if (counter < smallerLength) {
			zippedArray.push(backlinks[counter])
			zippedArray.push(frontlinks[counter])
		} else {
			if (backlinksLonger) leftovers.push(backlinks[counter])
			if (!backlinksLonger) leftovers.push(frontlinks[counter])
		}
		counter++
	}
	return [zippedArray, leftovers, backlinksLonger]
}