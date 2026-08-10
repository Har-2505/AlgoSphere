const mongoose = require('mongoose');
const Problem = require('./src/Models/problem');

const DB_URI = 'mongodb+srv://coderArmy9:Har%40123@coder.2lul6q8.mongodb.net/AlgoSphere';

async function run() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to database!');
    const problem = await Problem.findOne({ title: 'Add Two Numbers' });
    if (!problem) {
      console.log('Problem not found!');
      return;
    }
    console.log('PROBLEM TITLES & KEYS:');
    console.log(JSON.stringify(problem.toObject(), null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
