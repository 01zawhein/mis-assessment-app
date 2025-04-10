import sqlite3

# Connect to SQLite database (creates file if it doesn't exist)
conn = sqlite3.connect('school.db')

# Open and execute the SQL setup script
with open('setup.sql', 'r') as f:
    conn.executescript(f.read())

conn.commit()
conn.close()

print("Database initialized successfully!")
