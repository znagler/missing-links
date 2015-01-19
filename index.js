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
app.set('port', (process.env.PORT || 5000))
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
	console.log(req.body)
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

	console.log("post firing")
	req.setTimeout(8 * 60 * 1000, function() {
		console.log("timeout");
		req.abort();
	});
	var newPath = new cool.Path(req.body.startPage, req.body.finishPage)
	newPath.getLinksOnBacklinkPage(newPath.finishPage, function(response) {
		console.log("Starting BL")
		newPath.firstBackLinks = response
		newPath.firstBackLinks.forEach(function(page, index) {
			newPath.getLinksOnPage(page, function(responseTwo) {
				// console.log("BL", index,newPath.firstBackLinks.length)

				responseTwo.forEach(function(entryTwo, indexTwo) {
					if (entryTwo[0] == newPath.finishPage) {
						newPath.confirmedBackLinks.push([page, entryTwo[1]])
					}
					if (index == newPath.firstBackLinks.length - 1 && indexTwo == responseTwo.length - 1) {
						// setTimeout(function() {
							console.log("Finishing BL")
							newPath.getLinksOnPage(newPath.startPage, function(innerResponse) {
								console.log("starting FL")
								newPath.firstLinks = innerResponse

								newPath.firstLinks.forEach(function(page, innerIndex) {
									if (newPath.delivered) return

									newPath.confirmedBackLinks.forEach(function(backlink) {
										if (backlink[0] === page[0]) {
											console.log("ONE DEGREE MATCH")
											res.status(200).send({
												one: [page[0], page[1], backlink[1]]
											})
											res.end()
											newPath.delivered = true
											return
										}
									})
									newPath.getLinksOnPage(page[0], function(innerResponseTwo) {
										if (newPath.delivered) return
										// console.log(innerIndex, newPath.firstLinks.length)
										innerResponseTwo.forEach(function(entryTwo, innerIndexTwo) {
											newPath.confirmedBackLinks.forEach(function(backlink) {
												if (backlink[0] === entryTwo[0] && newPath.delivered == false) {
													newPath.delivered = true
													console.log("TWO DEGREE MATCH")
													res.send({
														two: [page[1], entryTwo[1], backlink[1], page[0], entryTwo[0]]
													})
													res.end()
													return
												}
											})
										})
									})
								})
							})
						// }, 5000)
					}
				})
			})
		})
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