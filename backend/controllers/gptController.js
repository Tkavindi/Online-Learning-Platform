const { OpenAI } = require('openai');
const Course = require('../models/courseModel');
const UsageCounter = require('../models/usageCounterModel');  

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const getCourseRecommendation = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    // Fetch course titles from DB
    const courses = await Course.find().select('title');
    const courseTitles = courses.map(course => course.title);

    if (courseTitles.length === 0) {
      return res.status(404).json({ message: 'No courses available in the system.' });
    }

    // Your existing system prompt context
    const context = `
You are an academic advisor helping students select courses based on their career goals.

Here is the list of available courses:
${JSON.stringify(courseTitles, null, 2)}

The student will provide their goal or interest.

- If relevant courses exist in the list above, recommend the most appropriate ones from the available courses.
- If there are no good matches in our available courses, politely mention that we don’t have specialized courses for that goal, and suggest the most relevant courses outside of what we provide using your knowledge.

Respond ONLY in this JSON format:
{
  "message": "Optional message to the student",
  "courses": ["Course 1", "Course 2", "Course 3"]
}
Do NOT add anything else (no explanation, no greeting).
`;

    // Call GPT API
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: context },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    // Increment usage count on successful API call
    await UsageCounter.findOneAndUpdate(
      { apiName: 'GPT_API' },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

    const responseText = chatResponse.choices[0].message.content;

    try {
      const parsed = JSON.parse(responseText);
      res.status(200).json(parsed);
    } catch (err) {
      console.warn('GPT response not JSON:', responseText);
      res.status(200).json({
        fallback: true,
        raw: responseText,
        message: 'GPT did not return valid JSON. Please try again.'
      });
    }

  } catch (error) {
    console.error('OpenAI error:', error.message);
    res.status(500).json({ message: 'Failed to get course recommendations' });
  }
};

module.exports = {
  getCourseRecommendation
};
