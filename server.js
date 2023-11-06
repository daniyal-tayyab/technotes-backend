require('dotenv').config();
const express = require('express');

const app = express();
const path = require('path');
const { logger, logEvents } = require('./middleware/logger.js');
const errorHandler = require('./middleware/errorHandler.js');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions.js');
const connectDB = require('./config/dbConn.js');
const mongoose = require('mongoose');

const userRoutes = require('./routes/userRoutes.js');

const PORT = process.env.PORT || 3500;
console.log(process.env.NODE_ENV);

connectDB();

app.use(logger);

app.use(cors(corsOptions));

// middleware to process json
app.use(express.json());

// now we are able to parser cookies that we receive as well
app.use(cookieParser());

// tell the server where to find static resources 
app.use("/", express.static(path.join(__dirname, 'public')) );

app.use("/", require('./routes/root'));
app.use("/users", userRoutes);


// for 404 not found page
app.all('*', (req, res) => {
    res.status(404);
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({message: "404 Not Found"});
    } else {
        res.type('txt').send('404 Not Found');
    }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to DB');
    app.listen(PORT, () => console.log(`server running on PORT: ${PORT}`));
});

mongoose.connection.on('error', (err) => {
    console.log(err);
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
});