const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
const projectRouter = require('./routes/projectRoutes');

const app = express();

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'));

//MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'overview'));
})

//ROUTES
app.use('/', viewRouter);
app.use('/api/1/users', userRouter);
app.use('/api/1/projects', projectRouter)

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
