const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
     const Course = require('../models/Course');
    const Teacher = require('../models/Teacher');
    const Room = require('../models/Room');
    
    const [allCourses, allTeachers, allRooms] = await Promise.all([
      Course.find(),
      Teacher.find(),
      Room.find()
    ]);

    const coursesContext = allCourses.map(c => {
      const sections = c.sections.map(s => {
        return `- Section ${s.sectionName} (${s.type}): ${s.day} ${s.startTime}-${s.endTime}, Instructor: ${s.instructor || 'TBD'}, Room: ${s.room || 'TBD'}`;
      }).join('\n');
      return `COURSE: ${c.name} (${c.code})\nDepartment: ${c.department}\nSections:\n${sections}`;
    }).join('\n\n');

    const teachersContext = allTeachers.map(t => {
      return `- ${t.name} (ID: ${t.teacherId}): Department ${t.department}, Email: ${t.email}`;
    }).join('\n');

    const roomsContext = allRooms.map(r => {
      return `- ${r.name}: Type ${r.type}, Capacity: ${r.capacity}`;
    }).join('\n');

     const systemPrompt = `You are UniSchedule AI, the official assistant for our university scheduling platform.
    You have deep knowledge of our instructors, lecture halls, and course schedules.
    
    GUIDELINES:
    1. Answer accurately based on the data provided below.
    2. If a student asks about a specific doctor (lecturer), check the TEACHERS list and the COURSE schedules.
    3. If they ask about a room/hall, check the ROOMS list.
    4. Keep answers concise, helpful, and friendly.
    5. Use the user's language (Arabic or English).
    
    UNIVERSITY DATA:
    
    TEACHERS (Doctors/Lecturers):
    ${teachersContext}
    
    ROOMS (Lecture Halls/Labs):
    ${roomsContext}
    
    COURSE SCHEDULES:
    ${coursesContext}`;
    
    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
      return res.json({ reply: "I am currently offline. Please set the GEMINI_API_KEY in the server environment variables." });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      res.json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      console.error("Gemini API Error Response:", JSON.stringify(data, null, 2));
      res.json({ reply: "I'm sorry, I couldn't process that right now." });
    }
  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ reply: "Connection error. Please try again later." });
  }
});

module.exports = router;
