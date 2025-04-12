const auth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Please log in first');
  res.redirect('/auth/login');
};

const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    return next();
  }
  req.flash('error', 'Access denied. Student access only.');
  res.redirect('/');
};

const isFaculty = (req, res, next) => {
  if (req.user && req.user.role === 'faculty') {
    return next();
  }
  req.flash('error', 'Access denied. Faculty access only.');
  res.redirect('/');
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  req.flash('error', 'Access denied. Admin access only.');
  res.redirect('/');
};

module.exports = {
  auth,
  isStudent,
  isFaculty,
  isAdmin
};