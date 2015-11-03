var unirest = require("unirest");

var req = unirest("GET", "https://api.imagga.com/v1/tagging");

req.query({
  "url": "http://logo.clearbit.com/linkedin.com",
  "version": "2"
});

req.headers({
  "authorization": "Basic YWNjX2Y4MGI3MTMxNjg4MDhlYjo0NjU4MGUxZjkyMzJjYWU2MjVhYTUyZDhjMjUyNTVjOQ==", 
  "accept": "application/json"
});


req.end(function (res) {
  if (res.error) throw new Error(res.error);

  console.log(res.body);
});

