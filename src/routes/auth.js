const express = require('express');
const User = require('../models/User');
const { redirectIfAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.get('/register', redirectIfAuthenticated, (req, res) => {
  res.render('register', { form: {}, errors: [] });
});

router.post('/register', redirectIfAuthenticated, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) errors.push('نام باید حداقل ۲ کاراکتر باشد.');
    if (!email) errors.push('ایمیل الزامی است.');
    if (!password || password.length < 8) errors.push('رمز عبور باید حداقل ۸ کاراکتر باشد.');

    if (errors.length > 0) {
      return res.status(422).render('register', { form: { name, email }, errors });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).render('register', {
        form: { name, email },
        errors: ['با این ایمیل قبلاً حساب ساخته شده است.'],
      });
    }

    const user = await User.createWithPassword({ name, email, password });
    req.session.user = { id: user.id, name: user.name, email: user.email };
    req.session.flash = { type: 'success', message: 'حساب شما ساخته شد؛ حالا می‌توانید فایل آپلود کنید.' };
    return res.redirect('/dashboard');
  } catch (error) {
    return next(error);
  }
});

router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('login', { form: {}, errors: [] });
});

router.post('/login', redirectIfAuthenticated, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase().trim() });

    if (!user || !(await user.verifyPassword(password || ''))) {
      return res.status(401).render('login', {
        form: { email },
        errors: ['ایمیل یا رمز عبور اشتباه است.'],
      });
    }

    req.session.user = { id: user.id, name: user.name, email: user.email };
    req.session.flash = { type: 'success', message: 'خوش آمدید! فضای ابری شما آماده است.' };
    return res.redirect('/dashboard');
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('fvplace.sid');
    return res.redirect('/');
  });
});

module.exports = router;
