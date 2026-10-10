const ai = require("../config/gemini");
const CategoryModel = require("../models/categoryModel");
const { isValid } = require("../utils/validator");

// Generate Interview Questions
const generateQuestions = async (req, res) => {
  try {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ msg: "Bad Request! No Data Provided" });
    }

    const { category, difficulty, noOfQuestions } = data;

    if (!isValid(category)) {
      return res.status(400).json({ msg: "Category is Required" });
    }

    if (!isValid(difficulty)) {
      return res.status(400).json({ msg: "Difficulty is Required" });
    }

    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return res.status(400).json({ msg: "Invalid Difficulty" });
    }

    if (!isValid(noOfQuestions)) {
      return res.status(400).json({ msg: "No. Of Questions is Required" });
    }

    if (noOfQuestions < 1 || noOfQuestions > 10) {
      return res.status(400).json({
        msg: "Number Of Questions must be between 1 and 10",
      });
    }

    const categoryData = await CategoryModel.findById(category);

    if (!categoryData) {
      return res.status(404).json({ msg: "Category not found" });
    }

    const categoryName = categoryData.categoryName;

    const prompt = `
You are an expert technical interviewer.

Generate ${noOfQuestions} interview questions specifically about:
${categoryName}

Difficulty Level: ${difficulty}

Rules:
1. Questions MUST be directly related to ${categoryName}.
2. Do not ask questions from unrelated technologies or topics.
3. Questions must match the difficulty level.
4. Do not provide answers.
5. Return only valid JSON.
6. Use exactly this format:

[
  {
    "question": "Question here",
    "type": "technical"
  }
]
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const questions = JSON.parse(response.text);

    return res.status(201).json({
      msg: "Interview Questions Generated",
      questions,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Generate Answer Feedback
const generateAnswerFeedback = async (req, res) => {
  try {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ msg: "Bad Request! No Data Provided" });
    }

    const { question, answer } = data;

    if (!isValid(question)) {
      return res.status(400).json({ msg: "Question is Required" });
    }

    if (!isValid(answer)) {
      return res.status(400).json({ msg: "Answer is Required" });
    }

    const prompt = `
You are an expert technical interviewer.

Analyze the following interview question and candidate answer.

Question:
${question}

Candidate Answer:
${answer}

Generate:
1. An ideal answer
2. Improvement suggestions

Rules:
1. Keep the ideal answer technically correct.
2. Improvement suggestions should be practical.
3. Do not give unnecessary information.
4. Return only valid JSON.

Use exactly this format:

{
  "idealAnswer": "Ideal answer here",
  "improvementSuggestions": [
    "Suggestion 1",
    "Suggestion 2",
    "Suggestion 3"
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const feedback = JSON.parse(response.text);

    return res.status(200).json({
      msg: "Answer Feedback Generated",
      feedback,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Generate Learning Roadmap
const genrateLearningRoadmap = async (req, res) => {
  try {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ msg: "Bad Request! No Data Provided" });
    }

    const { category, difficulty, score, feedback } = data;

    if (!isValid(category)) {
      return res.status(400).json({ msg: "Category is Required" });
    }

    if (!isValid(difficulty)) {
      return res.status(400).json({ msg: "Difficulty is Required" });
    }

    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return res.status(400).json({ msg: "Invalid Difficulty" });
    }

    if (score === undefined || score === null) {
      return res.status(400).json({ msg: "Score is Required" });
    }

    if (score < 0 || score > 100) {
      return res.status(400).json({
        msg: "Score must be between 0 and 100",
      });
    }

    if (!isValid(feedback)) {
      return res.status(400).json({ msg: "Feedback is Required" });
    }

    const prompt = `
You are an expert technical mentor.

Create a personalized learning roadmap for a candidate based on their interview performance.

Category:
${category}

Difficulty:
${difficulty}

Score:
${score}/100

Interview Feedback:
${feedback}

Create a practical learning roadmap.

Rules:
1. Identify weak areas from the feedback.
2. Suggest topics the candidate should study.
3. Suggest practical exercises.
4. Arrange the roadmap in a logical order.
5. Keep it beginner-friendly and practical.
6. Return only valid JSON.

Use exactly this format:

{
  "summary": "Short performance summary",
  "weakAreas": [
    "Weak area 1",
    "Weak area 2"
  ],
  "roadmap": [
    {
      "step": 1,
      "topic": "Topic name",
      "description": "What to learn",
      "practice": "What to practice"
    },
    {
      "step": 2,
      "topic": "Topic name",
      "description": "What to learn",
      "practice": "What to practice"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const roadmap = JSON.parse(response.text);

    return res.status(200).json({
      msg: "Learning Roadmap Generated",
      roadmap,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports = {
  generateQuestions,
  generateAnswerFeedback,
  genrateLearningRoadmap,
};
