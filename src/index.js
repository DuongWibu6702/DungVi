const path = require('path');
const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

require("dotenv").config();

const app = express();
const route = require('./routes');
const db = require('./config/db');
const globalUser = require('./app/middlewares/globalUser');

// Middlewares custom
const sanitize = require('./app/middlewares/sanitize');
const nosqlSanitize = require('./app/middlewares/nosqlSanitize');

const port = 3000;

// CONNECT DATABASE
db.connect();

// STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// HTTP LOGGER
app.use(morgan('combined'));

// BODY PARSER
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// METHOD OVERRIDE
app.use(methodOverride('_method'));

// SECURITY MIDDLEWARES

// Bảo vệ Header
app.use(helmet());

// CSP cho phép CDN Bootstrap
app.use(helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
        "default-src": ["'self'"],

        "script-src": [
            "'self'",
            "https://cdn.jsdelivr.net",
            "https://unpkg.com"
        ],

        "style-src": [
            "'self'",
            "https://cdn.jsdelivr.net",
            "https://unpkg.com",
            "'unsafe-inline'"
        ],

        "img-src": [
            "'self'",
            "data:",
            "blob:",
            "*"
        ],

        "font-src": [
            "'self'",
            "https://cdn.jsdelivr.net"
        ],

        "connect-src": [
            "'self'",
            "https://cdn.jsdelivr.net"
        ],
    }
}));

// Chống XSS từ input
app.use(sanitize);

// Chống NoSQL injection
app.use(nosqlSanitize);

// Rate limit 100 req / 10 phút
app.use(rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
}));

// SESSION CONFIG
app.set('trust proxy', 1);

app.use(session({
    secret: 'dungvi-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}));

// TEMPLATE ENGINE
const hbsHelpers = require('./app/helpers/handlebars');

app.engine('hbs', engine({
    extname: '.hbs',
    helpers: hbsHelpers
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

// GLOBAL USER MID
app.use(globalUser);

// ROUTES
route(app);

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Lỗi hệ thống. Vui lòng thử lại sau.");
});

// START SERVER
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
