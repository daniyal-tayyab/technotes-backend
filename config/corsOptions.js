const allowedOrigins = require('./allowedOrigins');

const corsOptions = {
    origin: (origin, callback) => {
        // !origin no origin for postman or desktop application which have no origin
        if(allowedOrigins.indexOf(origin) !== -1 || !origin) {
            // null for error and true is allow boolean 
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionSuccessStatus: 200
};

module.exports = corsOptions;