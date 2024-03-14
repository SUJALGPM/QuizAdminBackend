const mongoose = require('mongoose');
const Question = require('./models/Questions'); // Import your Mongoose model

// Connect to MongoDB (replace with your actual connection URI)
mongoose.connect('mongodb+srv://quiz:quiz@quizecluster.c4poxbl.mongodb.net/Adm', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define dummy data
const dummyData = [
    {
      question: 'What is the capital of France?',
      category: 'Geography',
      answerOptions: [
        { answer: 'Paris', isCorrect: true },
        { answer: 'London', isCorrect: false },
        { answer: 'Berlin', isCorrect: false },
        { answer: 'Madrid', isCorrect: false },
      ],
    },
    {
      question: 'Which planet is known as the Red Planet?',
      category: 'Science',
      answerOptions: [
        { answer: 'Mars', isCorrect: true },
        { answer: 'Venus', isCorrect: false },
        { answer: 'Jupiter', isCorrect: false },
        { answer: 'Earth', isCorrect: false },
      ],
    },
    {
        question: 'Which actor played the lead role in the movie "The Dark Knight"?',
        category: 'Entertainment',
        answerOptions: [
          { answer: 'Christian Bale', isCorrect: true },
          { answer: 'Robert Downey Jr.', isCorrect: false },
          { answer: 'Heath Ledger', isCorrect: false },
          { answer: 'Leonardo DiCaprio', isCorrect: false },
        ],
      }
      
    // Add more dummy questions and answers here
  ];

// Function to seed the database with dummy data
async function seedDatabase() {
  try {
    // Remove existing data (optional, depends on your needs)
    await Question.deleteMany({});
    
    // Insert the dummy data into the database
    await Question.insertMany(dummyData);

    console.log('Dummy data added to the database');
  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
}

// Call the seedDatabase function to add dummy data
seedDatabase();
