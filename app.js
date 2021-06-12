const express = require('express');
const path = require('path');

// Loads env variables
require('dotenv').config()

const app = express();

const PORT = process.env.PORT;


// Setup static directory to serve
app.use(express.static(path.resolve( 'build')));


app.get('*', (req, res) => {
    res.sendFile(path.resolve('build', 'index.html'));
});

// console.log that your server is up and running
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));