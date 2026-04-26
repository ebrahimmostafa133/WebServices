const express = require('express');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// ----------------------------------------------------
// In-Memory Data Storage (Simulating a Database)
// ----------------------------------------------------
let students = [
    { id: 1, name: 'Ali', age: 20 },
    { id: 2, name: 'Omar', age: 22 }
];

let courses = [
    { id: 1, title: 'Node.js Basics' },
    { id: 2, title: 'Advanced REST APIs' }
];

const PORT = process.env.PORT || 3000;

// ----------------------------------------------------
// Helper Functions for HATEOAS
// ----------------------------------------------------
const generateStudentLinks = (id) => {
    return [
        { rel: 'self', method: 'GET', href: `/students/${id}` },
        { rel: 'update', method: 'PUT', href: `/students/${id}` },
        { rel: 'delete', method: 'DELETE', href: `/students/${id}` },
        { rel: 'all_students', method: 'GET', href: '/students' }
    ];
};

// ====================================================
// 1. & 6. Resource-Oriented Design & Consistent Naming
// ====================================================
// ====================================================
// 2. Proper Use of HTTP Methods
// ====================================================

// ----------------------------------------------------
// Students Resource
// ----------------------------------------------------

// Retrieve all students (GET)
app.get('/students', (req, res) => {
    // 7. Basic HATEOAS included
    const studentsWithLinks = students.map(student => ({
        ...student,
        links: generateStudentLinks(student.id)
    }));

    // 4. HTTP Status Codes (200 OK)
    // 5. JSON Format (res.json)
    res.status(200).json({
        data: studentsWithLinks,
        links: [
            { rel: 'self', method: 'GET', href: '/students' },
            { rel: 'create', method: 'POST', href: '/students' }
        ]
    });
});

// Retrieve a single student by ID (GET)
app.get('/students/:id', (req, res) => {
    // 3. Statelessness: reading ID from the request parameter
    const studentId = parseInt(req.params.id);
    const student = students.find(s => s.id === studentId);

    if (!student) {
        // 4. HTTP Status Codes (404 Not Found)
        return res.status(404).json({ error: 'Student not found' });
    }

    res.status(200).json({
        data: student,
        links: generateStudentLinks(student.id)
    });
});

// Create a new student (POST)
app.post('/students', (req, res) => {
    const { name, age } = req.body;

    // Validate Input
    if (!name || typeof age !== 'number') {
        // 4. HTTP Status Codes (400 Bad Request)
        return res.status(400).json({ error: 'Invalid input. Name and age are required, and age must be a number.' });
    }

    const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    const newStudent = { id: newId, name, age };
    students.push(newStudent);

    // 4. HTTP Status Codes (201 Created)
    res.status(201).json({
        message: 'Student successfully created',
        data: newStudent,
        links: generateStudentLinks(newId)
    });
});

// Update an existing student (PUT)
app.put('/students/:id', (req, res) => {
    const studentId = parseInt(req.params.id);
    const { name, age } = req.body;
    
    if (!name || typeof age !== 'number') {
        return res.status(400).json({ error: 'Invalid input. Name and age are required, and age must be a number.' });
    }

    const index = students.findIndex(s => s.id === studentId);
    if (index === -1) {
        return res.status(404).json({ error: 'Student not found' });
    }

    students[index] = { id: studentId, name, age };

    res.status(200).json({
        message: 'Student successfully updated',
        data: students[index],
        links: generateStudentLinks(studentId)
    });
});

// Delete a student (DELETE)
app.delete('/students/:id', (req, res) => {
    const studentId = parseInt(req.params.id);
    const index = students.findIndex(s => s.id === studentId);

    if (index === -1) {
        return res.status(404).json({ error: 'Student not found' });
    }

    // Remove student from array
    students.splice(index, 1);

    res.status(200).json({
        message: 'Student successfully deleted',
        links: [
            { rel: 'all_students', method: 'GET', href: '/students' },
            { rel: 'create_student', method: 'POST', href: '/students' }
        ]
    });
});

// ----------------------------------------------------
// Courses Resource
// ----------------------------------------------------

// Retrieve all courses (GET)
app.get('/courses', (req, res) => {
    res.status(200).json({
        data: courses,
        links: [
            { rel: 'self', method: 'GET', href: '/courses' }
        ]
    });
});

// ----------------------------------------------------
// Start the Server
// ----------------------------------------------------
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
