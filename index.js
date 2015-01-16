var express = require('express') 	
var app = express()
var request = require('request')
var cheerio = require('cheerio')
var http = require('http')
var bodyParser = require('body-parser')
var cool = require('./cool')

app.set('views', __dirname + '/public/views')
app.set('view engine', 'ejs')
app.set('port', (process.env.PORT || 5000))
app.use(bodyParser())

app.use(express.static(__dirname + '/public'))
app.get('/', function(request, response) {
	response.render('index.ejs')
})

app.post('/start', function (req, res) {

	console.log(req.body)

	var url = "http://en.wikipedia.org/wiki/"+(req.body.start_wiki.split(' ').join('_'))
	request(url, function (error, response, html) {
		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(html)
			res.end($('link')['0']['attribs']['href'].match(/\/([^/]*)$/)[1])
		}
	})
})

app.post('/finish', function (req, res) {
	var url = "http://en.wikipedia.org/wiki/"+(req.body.finish_wiki.split(' ').join('_'))
	request(url, function (error, response, html) {
		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(html);
			res.end($('link')['0']['attribs']['href'].match(/\/([^/]*)$/)[1]);
		}
	})
})



app.post('/get-links', function (req, res) {
	var newPath = new cool.Path(req.body.startPage, req.body.finishPage)
	// newPath.startPoll(function(){
	// 	console.log(newPath.successObject)
	// 	res.send(newPath.successObject)
	// 	return
	// })

	// set zero degree
	if (newPath.firstLinks.indexOf(newPath.finishPage) > -1){
		newPath.successObject.degree0 = true
	} else {
		newPath.successObject.degree0 = false
	}

	// 
	newPath.getLinksOnBacklinkPage(newPath.finishPage,function(response){
		newPath.firstBackLinks = response
		newPath.firstBackLinks.forEach(function(page, index) {
			newPath.getLinksOnPage(page,function(responseTwo){
				responseTwo.forEach(function(entryTwo,indexTwo){
					if (entryTwo[0] == newPath.finishPage){
						newPath.confirmedBackLinks.push([page,entryTwo[1]])
					} 
					if (index == newPath.firstBackLinks.length - 1  && indexTwo == responseTwo.length - 1){

						setTimeout(function () {
							console.log("BL ready")
							newPath.backLinksReady = true
						}, 500)
					}
				})
			})
		})
	})



	newPath.getLinksOnPage(newPath.startPage,function(response){
		newPath.firstLinks = response




		newPath.firstLinks.forEach(function(page, index) {
			newPath.getLinksOnPage(page[0],function(responseTwo){


				responseTwo.forEach(function(entryTwo,indexTwo) {

					newPath.secondLinks.push([page,entryTwo])
					if (index == newPath.firstLinks.length - 1  && indexTwo == responseTwo.length - 1){

						setTimeout(function () {
							console.log("FL Ready")
							//
							// console.log(newPath.secondLinks)
							// newPath.populateDegreeOne()
							// newPath.populateDegreeTwo()

							newPath.frontLinksReady = true
							res.send(newPath.successObject)
							

						}, 500)
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




