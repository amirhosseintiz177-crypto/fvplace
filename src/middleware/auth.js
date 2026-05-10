function exposeLocals(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  res.locals.appName = process.env.APP_NAME || 'FVPlace Cloud';
  delete req.session.flash;
  next();
}

function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.session.flash = { type: 'warning', message: 'برای دیدن فضای ابری خودتان اول وارد حساب شوید.' };
    return res.redirect('/login');
  }

  return next();
}

function redirectIfAuthenticated(req, res, next) {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }

  return next();
}

module.exports = {
  exposeLocals,
  requireAuth,
  redirectIfAuthenticated,
};
