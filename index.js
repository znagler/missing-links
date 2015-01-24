var express = require('express')
var app = express()
var request = require('request')
var cheerio = require('cheerio')
var http = require('http')
var bodyParser = require('body-parser')
var cool = require('./cool')
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
	console.log("get")
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
	console.log("finish post firing")
	var url = "http://en.wikipedia.org/wiki/" + (req.body.finish_wiki.split(' ').join('_'))
	request(url, function(error, response, html) {
		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(html);
			res.end($('link')['0']['attribs']['href'].match(/\/([^/]*)$/)[1]);
		}
	})
})



console.log("defining  post")
app.post('/get-links', function(req, res) {
	console.log(req.body)

	console.log("post firing")
	req.setTimeout(8 * 60 * 1000, function() {
		console.log("timeout");
		req.abort();
	});

	var newPath = new cool.Path(req.body.startPage, req.body.finishPage)



	//Start backlinks
	console.log("initial backlink request")
	newPath.getLinksOnBacklinkPage(newPath.finishPage, 400, function(backLinkResponse) {
			console.log("BL ready")

			newPath.getLinksOnPage(newPath.startPage, 400, function(frontLinkResponse) {
				console.log("initial backlink response")
				console.log("BL length: ", backLinkResponse.length)
				console.log("FL length: ", frontLinkResponse.length)

					a = getZippedArrayAndLeftOvers(backLinkResponse, frontLinkResponse)

				console.log("zip", a[0].length)
				console.log("leftovers", a[1].length)
				console.log("zip0", a[0][0])
				console.log("zip1", a[0][1])
				console.log("zip2", a[0][2])



				a[0].concat(a[1]).forEach(function(link, index) {


					// console.log(index)
					if ((index % 2 && index <= a[0].length) || (index > a[0].length && !a[2]) ) { //front
						// 	console.log("front")
						newPath.getLinksOnPage(link[0], 200, function(frontLinkPageLinks) {
							if (newPath.delivered) res.end()
								if (!newPath.delivered && index === (a[0].concat(a[1])).length - 1) res.send({solved: false, bl: newPath.confirmedBackLinks, fl: newPath.secondLinks})

							if (newPath.confirmedBackLinks.length > 25 && !newPath.checkAt25){
								newPath.checkAt25 = true
								console.log("CHECK AT 25")
								solution = newPath.success()
								if (solution) {
									res.send({solved: true, solution: solution})
									newPath.delivered = true
									res.end()
									}
							}

							console.log("responseF",index,newPath.secondLinks.length,newPath.confirmedBackLinks.length)
							frontLinkPageLinks.forEach(function(frontPageLink) {
							newPath.secondLinks.push([frontPageLink[0], frontPageLink[1], link[0], link[1]])

							})
						})

					} else { //back
						// console.log("attempting bl with index ", link)
						newPath.getLinksOnPage(link, 200, function(backLinkPageLinks) {
								if (newPath.delivered) res.end()
								if (!newPath.delivered && index === (a[0].concat(a[1])).length - 1) res.send({solved: false, bl: newPath.confirmedBackLinks, fl: newPath.secondLinks})
							if (newPath.confirmedBackLinks.length > 25 && !newPath.checkAt25){
								newPath.checkAt25 = true
								console.log("CHECK AT 25")
								solution = newPath.success()
								if (solution) {
									res.send({foundAt: 25, solution: solution})
									newPath.delivered = true
									res.end()
									}
							}

								console.log("responseB",index,newPath.secondLinks.length,newPath.confirmedBackLinks.length)

								backLinkPageLinks.forEach(function(frontlink) {
									if (frontlink[0] == newPath.finishPage) {
										// console.log("confirmed bl")
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
	var spinPath = new cool.Path(req.body.startPage, req.body.finishPage)
	var test = req.body.startPage

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


var getZippedArrayAndLeftOvers = function(backlinks, frontlinks) {
	var backlinksLonger = false
	if (backlinks.length > frontlinks.length) backlinksLonger = true
	var largerLength = Math.max(backlinks.length,frontlinks.length)
	var smallerLength = Math.min(backlinks.length,frontlinks.length)
	zippedArray = []
	leftovers = []
	counter = 0
	console.log("larger length", largerLength)
	console.log("smaller length", smallerLength)

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