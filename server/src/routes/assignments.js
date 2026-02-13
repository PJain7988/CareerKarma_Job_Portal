const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const { protect, authorize } = require('../middleware/auth');

router.post('/assign', protect, authorize('hr'), async (req, res) => {
  try{
    const { userId, courseId, quizId } = req.body;
    const asg = await Assignment.create({ user: userId, course: courseId, quiz: quizId });
    res.json(asg);
  }catch(err){
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', protect, async (req, res) => {
  try{
    const asgs = await Assignment.find({ user: req.user._id }).populate('course quiz');
    res.json(asgs);
  }catch(err){
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try{
    const asg = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(asg);
  }catch(err){
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
