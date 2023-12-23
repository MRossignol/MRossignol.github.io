const express = require('express');
const app = express();
const path = require('path');
const PORT = 3000;
 
// Static Middleware
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.get('/load/:url', (req, res, next) => {
  let url = atob(req.params.url);
  fetchData(url)
    .then( (data) => {
      res.send(data);
    }, (error) => {
      res.send('ERROR');
    });
});

app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});



const fetchData = (url) => {
  return new Promise((resolve, reject) => {
    let clientName = (url.toString().indexOf("https") === 0) ? 'https' : 'http';
    let client = require(clientName);

    client.get(url, (resp) => {
      let data = '';
      
      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk.toString('latin1');
      });
      
      // The whole response has been received. Send out the result.
      resp.on('end', () => {
        resolve(data);
      });

    }).on("error", (err) => {
      reject(err);
    });
  });
};

