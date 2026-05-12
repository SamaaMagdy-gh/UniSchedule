const express = require('express');
const Room = require('../models/Room');
const router = express.Router();
router.get('/', async (req, res) => {
  try {
    const data = await Room.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await Room.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Room name already exists!' });
    const newRoom = new Room(req.body);
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error occurred' });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const updated = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
});
module.exports = router;