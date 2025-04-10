import sqlite3
import pandas as pd

try:
    conn = sqlite3.connect('school.db')
    cursor = conn.cursor()

    query = """
        SELECT student_id, subject, AVG(score) as avg_score 
        FROM assessments 
        GROUP BY student_id, subject
    """
    df = pd.read_sql_query(query, conn)

    # Define risk classification function
    def classify_risk(score):
        if score < 40:
            return "High"
        elif 40 <= score < 60:
            return "Medium"
        else:
            return "Low"

    # Apply risk classification
    df.dropna(subset=['avg_score'], inplace=True)
    df['risk_level'] = df['avg_score'].apply(classify_risk)


    # Ensure correct data types before inserting
    df['student_id'] = df['student_id'].astype(int)  # Ensure integer
    df['subject'] = df['subject'].astype(str)  # Ensure string

    # Insert or Update Data (UPSERT with ON CONFLICT)
    for index, row in df.iterrows():
        cursor.execute("""
            INSERT INTO performance_trends (student_id, subject, avg_score, risk_level)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(student_id, subject) 
            DO UPDATE SET avg_score = excluded.avg_score, risk_level = excluded.risk_level
        """, (int(row['student_id']), row['subject'], float(row['avg_score']), row['risk_level']))

    # Commit and close connection
    conn.commit()
    print("AI Analysis Completed Successfully!")

except sqlite3.OperationalError as e:
    print(f"SQLite Operational Error: {e}")
except sqlite3.Error as e:
    print(f"Database error: {e}")
except Exception as e:
    print(f"General error: {e}")
finally:
    conn.close()
