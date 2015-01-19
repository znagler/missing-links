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
			//Start backlinks
	newPath.getLinksOnBacklinkPage(newPath.finishPage, function(response) {
		if (newPath.delivered) return
		console.log("Starting BL")
		newPath.firstBackLinks = response
		newPath.firstBackLinks.forEach(function(page, index) {
				if (newPath.delivered) return
			newPath.getLinksOnPage(page, function(responseTwo) {
					if (newPath.delivered) return
				// console.log("BL", index,newPath.firstBackLinks.length)
				// console.log(newPath.secondLinks)

				responseTwo.forEach(function(entryTwo, indexTwo) {
					if (newPath.delivered) return
					if (entryTwo[0] == newPath.finishPage) {
						console.log("pushing into backlinks: " +newPath.confirmedBackLinks.length )
						// console.log("fronts "+newPath.secondLinks.length,"backs"+newPath.confirmedBackLinks.length)

						newPath.confirmedBackLinks.push([page, entryTwo[1]])
						// newPath.secondLinks.forEach(function(secondLink){
							// console.log("checking "+page+" and "+secondLink[1][0])
						console.log(index,newPath.firstBackLinks.length - 1 ,indexTwo,responseTwo.length - 1)

							// if (page === secondLink[1][0]) {
							// 	res.send([page,secondLink])
							// 	newPath.delivered = true
							// 	return
							// }
						// })
						}
						if (index == newPath.firstBackLinks.length - 1 && indexTwo == responseTwo.length - 1) {
								newPath.backLinksReady = true
								console.log("BACK LINKS READY")
						}

						if ((newPath.secondLinks.length > 2000 || newPath.frontLinksReady )&& (newPath.confirmedBackLinks.length > 1000 || newPath.backLinksReady)){
							res.send({fronts:newPath.secondLinks, backs:newPath.confirmedBackLinks, finsihed: "back"})
							newPath.delivered = true 
							return
						}

				})
			})
		})
	})
	// End backlinks


		// front links
		newPath.getLinksOnPage(newPath.startPage, function(innerResponse) {
			console.log("starting FL")
			newPath.firstLinks = innerResponse
			console.log("links on front page:"+newPath.firstLinks.length)

			newPath.firstLinks.forEach(function(page, innerIndex) {
				if (newPath.delivered) return

				// newPath.confirmedBackLinks.forEach(function(backlink) {
				// 	if (backlink[0] === page[0]) {
				// 		console.log("ONE DEGREE MATCH")
				// 		res.status(200).send({
				// 			one: [page[0], page[1], backlink[1]]
				// 		})
				// 		res.end()
				// 		newPath.delivered = true
				// 		return
				// 	}
				// })
				newPath.getLinksOnPage(page[0], function(innerResponseTwo) {
					if (newPath.delivered) return
					// console.log(innerIndex, newPath.firstLinks.length)
					innerResponseTwo.forEach(function(entryTwo, innerIndexTwo) {
						if (newPath.delivered) return
						// console.log("puhing into second links...")
						newPath.secondLinks.push([entryTwo[0],entryTwo[1],page[0],page[1]])

						console.log("pushing into frontlinks "+newPath.secondLinks.length)

						if (innerIndex == newPath.firstLinks.length - 1 && innerIndexTwo == innerResponseTwo.length - 1) {
							console.log("FRONT LINKS READY")
								newPath.frontLinksReady = true
						}

						if ((newPath.secondLinks.length > 2000 || newPath.frontLinksReady )&& (newPath.confirmedBackLinks.length > 1000 || newPath.backLinksReady)){
							res.send({fronts:newPath.secondLinks, backs:newPath.confirmedBackLinks, finsihed:"front"}) 
							return
						}

						// newPath.confirmedBackLinks.forEach(function(backlink) {
						// 	if (backlink[0] === entryTwo[0] && newPath.delivered == false) {
						// 		newPath.delivered = true
						// 		console.log("TWO DEGREE MATCH")
						// 		res.send({
						// 			two: [page[1], entryTwo[1], backlink[1], page[0], entryTwo[0]]
						// 		})
						// 		res.end()
						// 		return
						// 	}
						// })

					})
				})
			})
		})
		// End front links




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