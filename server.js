const express = require('express');
const path = require('path');

const logger = require('./src/middleware/logger');
const notFound = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/errorHandler');

const indexRoutes = require('./src/routes/index');
const usersRoutes = require('./src/routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// parse JSON body
app.use(express.json());

// statiske filer
app.use(express.static(path.join(__dirname, 'public')));

// request logger
app.use(logger);

// routes
app.use('/', indexRoutes);
app.use('/users', usersRoutes);

// 404 og error handler
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server kører på http://localhost:${PORT}`);
});
