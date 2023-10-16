const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const seriesSchema = require('../model/series');

router.post('/create', async (req, res) => {
  const data = new seriesSchema({
    name: req.body.name
  });

  await data.validate();

  try {
    const dataToSave = data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }

  res.send('Post API');
});

//Get by ID Method
router.get('/get/:id', async (req, res) => {
  const series = await seriesSchema.findOne({ _id: mongoose.Types.ObjectId(req.params.id) });
});
//Get by ID Method
router.get('/get-name/:name', (req, res) => {
  res.send('Get by ID API');
});

//Update by ID Method
router.patch('/update/:id', (req, res) => {
  res.send('Update by ID API');
});

//Delete by ID Method
router.delete('/delete/:id', (req, res) => {
  res.send('Delete by ID API');
});

module.exports = router;
