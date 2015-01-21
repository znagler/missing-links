Missing Links is an Express/node app that finds a link chain between Wikipedia articles.  It uses the node module, Cheerio, to scrape Wikipedia, and is deployed with AWS.

I went with this approach INSTEAD of the the Wikipedia API because through scraping I can get not just the links (hrefs) but also the text of the link, which is often different.  This allows for the app to give precise directions from one page to the other, but the limitation is that it can only find links between articles that are 2-3 'jumps' away (because I only want to scrape ~500 pages per click).
