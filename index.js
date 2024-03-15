require("dotenv").config();
const cors = require("cors");
const express = require("express");
const connectDB = require("./ConnectDb");
// const connectDB2 = require("./ConnectDb");

const multer = require("multer");
const csv = require("fast-csv");
const mongodb = require("mongodb");
const fs = require("fs");
const { ObjectID } = require("mongodb");

const Question = require("./models/Questions");
const Category = require("./models/Categories");

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

connectDB();

// csv file upload code starts

// Set global directory
global.__basedir = __dirname;

// Multer Upload Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

// Filter for CSV file
const csvFilter = (req, file, cb) => {
  if (file.mimetype.includes("csv")) {
    cb(null, true);
  } else {
    cb("Please upload only csv file.", false);
  }
};

const upload = multer({ storage: storage, fileFilter: csvFilter });

// Function to transform CSV data to the desired format
function transformCSVData(row) {
  const question = row.Question;
  const category = row.Category;
  const level = row.Level;
  const correctAnswer = parseInt(row.CorrectAnswer);

  const options = Object.entries(row)
    .filter(([key, value]) => key.startsWith("Option"))
    .map(([key, value]) => {
      const optionValue = value.trim();
      const optionNumber = parseInt(key.replace("Option", ""));
      const isCorrect = optionNumber === correctAnswer;

      console.log(`Option: ${optionValue}, isCorrect: ${isCorrect}`); // Debugging line

      return {
        answer: optionValue,
        isCorrect: isCorrect,
        _id: new ObjectID(),
      };
    });

  return {
    question: question,
    category: category,
    level: level,
    answerOptions: options,
    __v: { numberInt: "0" },
  };
}

// Upload CSV file using Express Rest APIs
app.post("/api/upload-csv-file", upload.single("file"), (req, res) => {
  try {
    if (req.file == undefined) {
      return res.status(400).send({
        message: "Please upload a CSV file!",
      });
    }

    // Import CSV File to MongoDB database
    let csvData = [];
    let filePath = __basedir + "/uploads/" + req.file.filename;
    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: true }))
      .on("error", (error) => {
        throw error.message;
      })
      .on("data", (row) => {
        const transformedData = transformCSVData(row);
        csvData.push(transformedData);
      })
      .on("end", () => {
        // Establish connection to the database
        const url = process.env.MONGODB_URI;
        let dbConn;
        mongodb.MongoClient.connect(url, {
          useUnifiedTopology: true,
        })
          .then((client) => {
            dbConn = client.db();

            // Insert into the collection "questions"
            const collectionName = "questions";
            const collection = dbConn.collection(collectionName);
            collection.insertMany(csvData, (err, result) => {
              if (err) {
                console.log(err);
              }
              if (result) {
                res.status(200).send({
                  message:
                    "Upload/import the CSV data into the database successfully: " +
                    req.file.originalname,
                });

                client.close();
              }
            });
          })
          .catch((err) => {
            res.status(500).send({
              message: "Fail to import data into the database!",
              error: err.message,
            });
          });
      });
  } catch (error) {
    console.log("catch error-", error);
    res.status(500).send({
      message: "Could not upload the file: " + req.file.originalname,
    });
  }
});

// csv file upload code ends

// new category starts

// POST /admin/categories - Create a new category
app.post("/categories", async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if the category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists" });
    }

    // Create a new category
    const newCategory = new Category({
      name,
      description,
    });

    // Save the category to the database
    await newCategory.save();

    res.status(201).json(newCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/allcategories", async (req, res) => {
  try {
    // Fetch all categories from the database
    const categories = await Category.find();

    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/onlyactivecategories", async (req, res) => {
  try {
    // Fetch only active categories from the database
    const categories = await Category.find({ isActive: true });

    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// updating isactive starts

app.put("/updatecategory/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById({ _id: id });
    if (!category) return res.status(400).json({ msg: "Category not found" });

    if (category.isActive === true) {
      category.isActive = false;
      await category.save();
      return res.status(200).json({ msg: "category Disactiviated" });
    } else {
      category.isActive = true;
      await category.save();
      return res.status(200).json({ msg: "category Activiated" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

app.delete("/categories/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    console.log("Deleting category with ID:", categoryId);

    // Check if the category exists
    const existingCategory = await Category.findById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Use the Mongoose `deleteOne` method to remove the category
    await existingCategory.deleteOne();

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// new category ends

app.post("/post", async (req, res) => {
  console.log(req.body);
  res.status(200).json({ message: "POST request received successfully" });
});

app.get("/api/questions", async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// app.get('/api/questionfour', async (req, res) => {
//   try {
//     const questions = await Question.find().limit(4);
//     res.status(200).json(questions);
//   } catch (error) {
//     console.error('Error fetching questions:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

app.get("/api/questionsfour", async (req, res) => {
  try {
    const requestedCategory = req.query.category;

    // Query MongoDB to get four random questions of the specified category
    const questions = await Question.aggregate([
      { $match: { category: requestedCategory } },
      { $sample: { size: 4 } },
    ]);

    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/createquestions", async (req, res) => {
  try {
    // Extract data from the request body
    const { question, category, level, answerOptions } = req.body;

    // Set isCorrect to true or false for each answer option
    const formattedAnswerOptions = answerOptions.map((option) => ({
      answer: option.answer,
      isCorrect: Boolean(option.isCorrect), // Convert to boolean
    }));

    // Create a new question instance using the Question model
    const newQuestion = new Question({
      question,
      category,
      level,
      answerOptions: formattedAnswerOptions,
    });

    // Save the new question to the database
    await newQuestion.save();

    res.status(201).json(newQuestion); // Respond with the created question
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET request to fetch the data of a specific question by its ID
app.get("/api/getquestion/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.status(200).json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/api/updatequestions/:id", async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/api/delquestions/:id", async (req, res) => {
  try {
    const questionId = req.params.id;
    // console.log('Received questionId:', questionId); // Add this line for debugging
    const deletedQuestion = await Question.findByIdAndDelete(questionId);
    if (!deletedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.json("Hello mate!");
});

app.listen(PORT, () => {
  console.log(`Server is running on Port: ${PORT}`);
});
