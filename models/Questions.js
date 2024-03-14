// const mongoose = require('mongoose');

// // Define the schema for a question
// const questionSchema = new mongoose.Schema({
//   question: {
//     type: String,
//     required: true,
//   },
//   category: {
//     type: String, // You can adjust the type to match your category data
//     required: true,
//   },
//   answerOptions: [
//     {
//       answer: {
//         type: String,
//         required: true,
//       },
//       isCorrect: {
//         type: Boolean,
//         default: false, // Set to true for the correct answer
//       },
//     },
//     {
//       answer: {
//         type: String,
//         required: true,
//       },
//       isCorrect: {
//         type: Boolean,
//         default: false, // Set to true for the correct answer
//       },
//     },
//     {
//       answer: {
//         type: String,
//         required: true,
//       },
//       isCorrect: {
//         type: Boolean,
//         default: false, // Set to true for the correct answer
//       },
//     },
//     {
//       answer: {
//         type: String,
//         required: true,
//       },
//       isCorrect: {
//         type: Boolean,
//         default: false, // Set to true for the correct answer
//       },
//     },
//   ],
// });

// // Create a model for the question schema
// const Question = mongoose.model('Question', questionSchema);

// module.exports = Question;


const mongoose = require('mongoose');

// Define the schema for a question
const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ['easy', 'medium', 'hard'], // You can adjust the levels based on your requirements
    required: true,
  },
  answerOptions: [
    {
      answer: {
        type: String,
        required: true,
      },
      isCorrect: {
        type: Boolean,
        default: false,
      },
    },
    {
      answer: {
        type: String,
        required: true,
      },
      isCorrect: {
        type: Boolean,
        default: false,
      },
    },
    {
      answer: {
        type: String,
        required: true,
      },
      isCorrect: {
        type: Boolean,
        default: false,
      },
    },
    {
      answer: {
        type: String,
        required: true,
      },
      isCorrect: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

// Create a model for the question schema
const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
