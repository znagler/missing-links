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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'))
app.get('/', function(request, response) {
	console.log("get")
	response.render('index.ejs')
})

app.post('/start', function (req, res) {
	console.log(req.body)
	var url = "http://en.wikipedia.org/wiki/"+(req.body.start_wiki.split(' ').join('_'))
	request(url, function (error, response, html) {
		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(html)
			res.end($('link')['0']['attribs']['href'].match(/\/([^/]*)$/)[1]);
		}
	})
})

app.post('/finish', function (req, res) {
	console.log("finish post firing")
	var url = "http://en.wikipedia.org/wiki/"+(req.body.finish_wiki.split(' ').join('_'))
	request(url, function (error, response, html) {
		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(html);
			res.end($('link')['0']['attribs']['href'].match(/\/([^/]*)$/)[1]);
		}
	})
})



console.log("defining  post")
app.post('/get-links', function (req, res) {


	console.log("post firing")
	req.setTimeout(5*60*1000,function () {
	  console.log("timeout");
	  req.abort();
	});
	
	// if (form_submitting) return
	// form_submitting = true
	// res.send("hi")
	// // console.log(req.body)
	// // res.send("apple")
	var newPath = new cool.Path(req.body.startPage, req.body.finishPage)

	// // // newPath.startPoll(function(){
	// // // 	console.log(newPath.successObject)
	// // // 	res.send(newPath.successObject)
	// // // 	return
	// // // })

	// // // set zero degree
	// // if (newPath.firstLinks.indexOf(newPath.finishPage) > -1){
	// // 	newPath.successObject.degree0 = true
	// // } else {
	// // 	newPath.successObject.degree0 = false
	// // // }

	// newPath.getLinksOnPage(newPath.startPage,function(response){
	// 	console.log("starting FL")
	// 	newPath.firstLinks = response

	// 	newPath.firstLinks.forEach(function(page, index) {
	// 		newPath.getLinksOnPage(page[0],function(responseTwo){


	// 			responseTwo.forEach(function(entryTwo,indexTwo) {
	// 				// console.log("FL",index,newPath.firstLinks.length - 1,indexTwo,responseTwo.length - 1 )

	// 				newPath.secondLinks.push([page,entryTwo])
	// 				if (index == newPath.firstLinks.length - 1  && indexTwo == responseTwo.length - 1){

	// 					console.log("finishing FL")
	// 					newPath.frontLinksReady = true
						
	// 					// setTimeout(function () {
	// 					// 	console.log("FL Ready")
	// 					// 	//
	// 					// 	// console.log(newPath.secondLinks)
	// 					// 	// newPath.populateDegreeOne()
							

	// 					// 	// res.send(newPath.successObject)
	// 					// 	// res.send(newPath.successObject)
							
	// 					// 	console.log("end")
	// 					// }, 500)
	// 				}
	// 			})
	// 		})
	// 	})
	// })




	// 
	newPath.getLinksOnBacklinkPage(newPath.finishPage,function(response){
		console.log("Starting BL")
		newPath.firstBackLinks = response
		newPath.firstBackLinks.forEach(function(page, index) {
			newPath.getLinksOnPage(page,function(responseTwo){
				// console.log(responseTwo[0])


				responseTwo.forEach(function(entryTwo,indexTwo){
					if (entryTwo[0] == newPath.finishPage){
						newPath.confirmedBackLinks.push([page,entryTwo[1]])
					} 
					console.log("BL",index,newPath.firstBackLinks.length - 1,indexTwo,responseTwo.length - 1 )
					if (index == newPath.firstBackLinks.length - 1  && indexTwo == responseTwo.length - 1){
						setTimeout(function () {
							console.log("Finishing BL")

							// if (newPath.frontLinksReady){
							// 	newPath.populateDegreeTwo()
							// 	res.send(newPath.successObject)
							// } else {
							// 	res.send("fl wasn't ready")
							// }

							newPath.getLinksOnPage(newPath.startPage,function(innerResponse){
							console.log("starting FL")
							newPath.firstLinks = innerResponse

							newPath.firstLinks.forEach(function(page, innerIndex) {

								// newPath.confirmedBackLinks.forEach(function(backlink){
								// 	console.log(backlink[0],page[0])
								// 	if (backlink[0] === page[0]) {
								// 		res.send(page)
								// 		return
								// 		}

								// })


								newPath.getLinksOnPage(page[0],function(innerResponseTwo){
									console.log(innerIndex,newPath.firstLinks.length)


									innerResponseTwo.forEach(function(entryTwo,innerIndexTwo) {



									newPath.confirmedBackLinks.forEach(function(backlink){
										if (backlink[0] === entryTwo[0]){ 
											var lol = {
												a:page,
												b:entryTwo,
												c:backlink,
											}
											res.send(page.concat(entryTwo).concat(backlink))
											return
											}

									})
										// console.log("FL",index,newPath.firstLinks.length - 1,indexTwo,responseTwo.length - 1 )

										// newPath.secondLinks.push([page,entryTwo])
										// if (innerIndex == newPath.firstLinks.length - 1  && innerIndexTwo == innerResponseTwo.length - 1){

										// 	console.log("finishing FL")
										// 	newPath.frontLinksReady = true
											
										// 	// setTimeout(function () {
										// 	// 	console.log("FL Ready")
										// 	// 	//
										// 	// 	// console.log(newPath.secondLinks)
										// 	// 	// newPath.populateDegreeOne()
												

										// 	// 	// res.send(newPath.successObject)
										// 	// 	// res.send(newPath.successObject)
												
										// 	// 	console.log("end")
										// 	// }, 500)
										// }
									})
								})
							})
						})


							// 	console.log("SecondLinks")	
							// 	// console.log(newPath.secondLinks)
							// 	// console.log("backlinks")	
							// 	// console.log(newPath.confirmedBackLinks)
							// 	res.send("apple")
							// 	// newPath.populateDegreeTwo()
							// 	// console.log(newPath.successObject)
							// 	return
							// 	// newPath.backLinksReady = true
						}, 5000)
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




