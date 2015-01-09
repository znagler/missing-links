var express = require('express');
var app = express();
var request = require('request');
var cheerio = require('cheerio');
var http = require('http');
var bodyParser = require('body-parser')
var cool = require('./cool');

app.set('views', __dirname + '/public/views');
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 5000));
app.use(bodyParser());

app.use(express.static(__dirname + '/public'));
app.get('/', function(request, response) {
  response.render('index.ejs');
});

app.post('/start', function (req, res) {
	console.log(req.body)

	var url = "http://en.wikipedia.org/wiki/"+(req.body.start_wiki.split(' ').join('_'))
	request(url, function (error, response, html) {
	  if (!error && response.statusCode == 200) {
	    var $ = cheerio.load(html);
	    res.end($('link')['0']['attribs']['href'].match(/\/([^/]*)$/)[1]);
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

	cool.foo()

	var cat = new cool.Linkset("billy")
	getLinks(req.body.link, function(response){
		console.log(response)
		res.send(response)

	})

})



app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

function getLinks(url, callback){
	var current = ("/wiki/"+url.match(/\/([^/]*)$/)[1])
	request(url, function (error, response, html) {
	  if (!error && response.statusCode == 200) {
	    var $ = cheerio.load(html);
	    var links = $('a')
			var hrefArray = []
			var index = 0
		$(links).each(function(i, link){

			var href = $(link).attr('href')

			if (/^\/wiki[^:]*$/.test(href) && href != current && href != "/wiki/Main_Page" && href != "/wiki/International_Standard_Book_Number"){
				hrefArray[index] = href
				index++
				}

		  })
		callback(hrefArray)
	  }
	})
}




var arrayUnique = function(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
};