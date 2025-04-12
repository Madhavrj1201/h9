const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { isStudent } = require('../middleware/auth');

// Student dashboard
router.get('/dashboard', isStudent, async (req, res) => {
  try {
    const enrolledCourses = await Course.find({
      students: req.user._id
    }).populate('instructor', 'profile.firstName profile.lastName');

    res.render('student/dashboard', {
      title: 'Student Dashboard',
      user: req.user,
      courses: enrolledCourses
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// View all courses
router.get('/courses', isStudent, async (req, res) => {
  try {
    const courses = await Course.find({
      status: 'active',
      students: { $ne: req.user._id }
    }).populate('instructor', 'profile.firstName profile.lastName');

    res.render('student/courses', {
      title: 'Available Courses',
      user: req.user,
      courses: courses
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// View course details
router.get('/courses/:id', isStudent, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'profile.firstName profile.lastName')
      .populate('content');

    if (!course) {
      req.flash('error', 'Course not found');
      return res.redirect('/student/courses');
    }

    res.render('student/course-details', {
      title: course.title,
      user: req.user,
      course: course
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Enroll in a course
router.post('/courses/:id/enroll', isStudent, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      req.flash('error', 'Course not found');
      return res.redirect('/student/courses');
    }

    if (course.students.includes(req.user._id)) {
      req.flash('error', 'Already enrolled in this course');
      return res.redirect('/student/courses');
    }

    if (course.students.length >= course.maxStudents) {
      req.flash('error', 'Course is full');
      return res.redirect('/student/courses');
    }

    course.students.push(req.user._id);
    await course.save();

    // Update user's enrolled courses
    const user = await User.findById(req.user._id);
    user.enrolledCourses.push({
      course: course._id,
      enrolledAt: new Date()
    });
    await user.save();

    req.flash('success', 'Successfully enrolled in course');
    res.redirect(`/student/courses/${course._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// View coding problems
router.get('/problems', isStudent, async (req, res) => {
  try {
    const { difficulty, category } = req.query;
    let query = {};

    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;

    const problems = await Problem.find(query);
    res.render('student/problems', {
      title: 'Coding Problems',
      user: req.user,
      problems: problems
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// View specific problem and code editor
router.get('/problems/:id/solve', isStudent, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      req.flash('error', 'Problem not found');
      return res.redirect('/student/problems');
    }

    res.render('student/code-editor', {
      title: problem.title,
      user: req.user,
      problem: problem
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;