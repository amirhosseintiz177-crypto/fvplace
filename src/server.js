require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDatabase } = require('./db');
const { exposeLocals } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const pageRoutes = require('./routes/pages');
const fileRoutes = require('./routes/files');

const app = express();
const port = Number(process.env.PORT || 3000);
const mongoUri = process.env.MONGODB_URI;
const sessionSecret = process.env.SESSION_SECRET || 'development-only-secret';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(
  session({
    name: 'fvplace.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoUri, collectionName: 'sessions' }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(exposeLocals);

app.use(pageRoutes);
app.use(authRoutes);
app.use(fileRoutes);

app.use((req, res) => {
  res.status(404).render('404');
});

app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    req.session.flash = {
      type: 'warning',
      message: `حجم فایل بیشتر از سقف ${process.env.MAX_UPLOAD_MB || 25} مگابایت است.`,
    };
    return res.redirect('/dashboard');
  }

  console.error(error);
  return res.status(500).render('error', { error });
});

async function bootstrap() {
  await connectDatabase(mongoUri);
  app.listen(port, () => {
    console.log(`FVPlace Cloud is running on port ${port}`);
  });
}

if (require.main === module) {
  bootstrap().catch((error) => {
    console.error('Failed to start FVPlace Cloud:', error);
    process.exit(1);
  });
}

module.exports = app;
