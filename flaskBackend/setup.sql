CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    student_id INTEGER REFERENCES students(id)
);

CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100),
    age INT,
    grade VARCHAR(10)
);

CREATE TABLE assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INT REFERENCES students(id),
    subject VARCHAR(50),
    score FLOAT,
    date DATE
);

CREATE TABLE performance_trends (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INT REFERENCES students(id),
            subject VARCHAR(50),
            avg_score FLOAT,
            risk_level VARCHAR(20),
            UNIQUE(student_id, subject)  -- Prevent duplicate student-subject entries
);

INSERT INTO students (name, age, grade) VALUES ('Nick Jackson', 15, 'Year 10');

INSERT INTO assessments (student_id, subject, score, date) VALUES 
(1, 'Math', 45, '2024-01-01'),
(1, 'English', 65, '2024-01-01'),
(1, 'Science', 30, '2024-01-01');
