from flask_cors import CORS;
from flask import Flask, jsonify, send_file, request, Response, send_from_directory;
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import sqlite3;
import secrets;
import io;
import matplotlib.pyplot as plt;
import matplotlib as mat
mat.use("Agg");
import os;
from reportlab.lib.pagesizes import letter;
from reportlab.pdfgen import canvas;
import subprocess;
import base64;
import bcrypt;
from werkzeug.utils import secure_filename;


app = Flask(__name__)

CORS(app , supports_credentials=True)

app.config["JWT_SECRET_KEY"] = secrets.token_hex(32)
jwt = JWTManager(app)


# CONNECT TO DATABASE
def get_db_connection():
    conn = sqlite3.connect("school.db")
    conn.row_factory = sqlite3.Row  # Enables column access by name
    return conn

# USER REGISTRATION
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    student_id = data.get("student_id")  # Link user to student data

    if not username or not password or not student_id:
        return jsonify({"error": "Missing fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if username already exists
    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
    if cursor.fetchone():
        return jsonify({"error": "Username already exists"}), 400

    # Hash password before storing
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    cursor.execute("INSERT INTO users (username, password, student_id) VALUES (?, ?, ?)", 
                   (username, hashed_password, student_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "User registered successfully!"}), 201

# USER LOGIN
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, password, student_id FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()

    if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    if not user["student_id"]:
        return jsonify({"error": "User is not linked to a student"}), 400

    # Generate JWT Token and include student_id
    token = create_access_token(identity={"user_id": user["id"], "student_id": user["student_id"]})
    
    return jsonify({"access_token": token}), 200


# Streaming response generator with logging
def generate_response(prompt):
    try:
        print(f"Received prompt: {prompt}")  # Debugging input

        process = subprocess.Popen(
            ["ollama", "run", "mistral"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )

        process.stdin.write(prompt + "\n")
        process.stdin.close()

        for line in process.stdout:
            print(f"Sending chunk: {line.strip()}")  # Debugging output
            yield line  # Stream response to frontend

    except Exception as e:
        print(f"Error during streaming: {str(e)}")  # Log errors
        yield f"Error: {str(e)}"

@app.route("/get_user", methods=["GET"])
@jwt_required()
def get_user():
    identity = get_jwt_identity()
    student_id = identity.get("student_id")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, profile_pic FROM students WHERE id = ?", (student_id,))
    student = cursor.fetchone()
    conn.close()

    if not student:
        return jsonify({"error": "Student not found"}), 404

    return jsonify({
        "id": student["id"],
        "name": student["name"],
        "profile_pic": student["profile_pic"]
    })


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_message = data.get("message", "")

        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        return Response(generate_response(user_message), content_type="text/plain")

    except Exception as e:
        print(f"Server Error: {e}")
        return jsonify({"error": str(e)}), 500
    
# Streaming response generator with logging
def generate_response(prompt):
    try:
        print(f"Received prompt: {prompt}")  # Debugging input

        process = subprocess.Popen(
            ["ollama", "run", "mistral"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )

        process.stdin.write(prompt + "\n")
        process.stdin.close()

        for line in process.stdout:
            print(f"Sending chunk: {line.strip()}")  # Debugging output
            yield line  # Stream response to frontend

    except Exception as e:
        print(f"Error during streaming: {str(e)}")  # Log errors
        yield f"Error: {str(e)}"
    

UPLOAD_FOLDER = "uploads"  # Folder to store profile images
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


# Ensure upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Function to check allowed file extensions
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# API to upload profile picture
@app.route("/upload_profile_pic", methods=["POST"])
@jwt_required()
def upload_profile_pic():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)

        # Update user profile with new image path
        identity = get_jwt_identity()
        student_id = identity.get("student_id")

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE students SET profile_pic = ? WHERE id = ?", (filename, student_id))
        conn.commit()
        conn.close()

        return jsonify({"message": "Profile picture uploaded successfully!", "profile_pic": filename}), 200
    else:
        return jsonify({"error": "File type not allowed"}), 400

# API to serve uploaded profile pictures
@app.route("/uploads/<filename>")
def get_uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# API to update student name
@app.route("/update_profile", methods=["POST"])
@jwt_required()
def update_profile():
    data = request.get_json()
    new_name = data.get("name")

    identity = get_jwt_identity()
    student_id = identity.get("student_id")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE students SET name = ? WHERE id = ?", (new_name, student_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Profile updated successfully!"})


@app.route("/performance_chart/<int:student_id>", methods=["GET"])
def performance_chart(student_id):
    conn = sqlite3.connect("school.db")
    cursor = conn.cursor()
    cursor.execute("SELECT subject, avg_score FROM performance_trends WHERE student_id = ?", (student_id,))
    data = cursor.fetchall()
    conn.close()

    if not data:
        return jsonify({"error": "No performance data"}), 404

    subjects = [d[0] for d in data]
    scores = [d[1] for d in data]

    # bar chart creation
    plt.figure(figsize=(8, 5))
    plt.bar(subjects, scores, color="skyblue")
    plt.xlabel("Subjects")
    plt.ylabel("Average Score")
    plt.title("Student Performance Overview")

    # saving to buffer
    buffer = io.BytesIO()
    plt.savefig(buffer, format="png")
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.read()).decode()

    return jsonify({"chart": f"data:image/png;base64,{image_base64}"})

# API to fetch student performance trends
@app.route('/student/performance', methods=['GET'])
@jwt_required()
def get_student_performance():
    try:
        identity = get_jwt_identity()
        print("Identity received:", identity)  # Debugging Output

        std_id = identity.get("student_id")
        if not std_id:
            return jsonify({"error": "Invalid token: Student ID missing"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        query = "SELECT subject, avg_score, risk_level FROM performance_trends WHERE student_id = ?"
        cursor.execute(query, (std_id,))
        data = cursor.fetchall()
        
        conn.close()

        if not data:
            return jsonify({"error": "No performance data found"}), 404

        performance = [{"subject": row["subject"], "avg_score": row["avg_score"], "risk_level": row["risk_level"]} for row in data]
        
        return jsonify({"student_id": std_id, "performance": performance})
    except Exception as e:
        print("Error in /student/performance:", str(e))  # Log error
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


# badges
@app.route("/badges", methods=["GET"])
@jwt_required()
def assign_badges():
    identity = get_jwt_identity()
    std_id = identity.get("student_id")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT AVG(avg_score) FROM performance_trends WHERE student_id = ?
    """, (std_id,))
    row = cursor.fetchone()
    avg_score = row["AVG(avg_score)"]

    conn.close()

    if avg_score is None:
        return jsonify({"error": "No data"}), 404

    badge = "No Badge 🏅"
    if avg_score >= 90:
        badge = "Gold 🌟"
    elif avg_score >= 75:
        badge = "Silver 🥈"
    elif avg_score >= 45:
        badge = "Bronze 🥉"

    return jsonify({"avg_score": avg_score, "badge": badge})

@app.route("/parent_dashboard/<int:student_id>")
def parent_dashboard(student_id):
    conn = sqlite3.connect("school.db")
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM students WHERE id = ?", (student_id,))
    student = cursor.fetchone()

    if not student:
        return jsonify({"error": "Student not found"}), 404

    student_name = student[0]

    cursor.execute("SELECT subject, avg_score, risk_level FROM performance_trends WHERE student_id = ?", (student_id,))
    performance_data = cursor.fetchall()
    conn.close()

    return jsonify({
        "student_name": student_name,
        "performance": [{"subject": d[0], "score": d[1], "risk": d[2]} for d in performance_data],
    })

# create leadership board
@app.route("/leaderboard", methods=["GET"])
@jwt_required()
def leaderboard():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT students.name, AVG(performance_trends.avg_score) as avg_score
        FROM students
        JOIN performance_trends ON students.id = performance_trends.student_id
        GROUP BY students.id
        ORDER BY avg_score DESC
    """)
    rankings = cursor.fetchall()
    conn.close()

    leaderboard_data = [{"name": row[0], "avg_score": row[1]} for row in rankings]
    return jsonify({"leaderboard": leaderboard_data})


@app.route("/generate_report/<int:student_id>", methods=["GET"])
@jwt_required()
def generate_report(student_id):
    conn = get_db_connection();
    cursor = conn.cursor()

    # fetching student data
    cursor.execute("SELECT name FROM students WHERE id = ?", (student_id,))
    student = cursor.fetchone()

    if not student:
        return jsonify({"error": "Student not found"}), 404

    student_name = student[0]

    cursor.execute("SELECT subject, avg_score, risk_level FROM performance_trends WHERE student_id = ?", (student_id,))
    performance_data = cursor.fetchall()
    conn.close()

    # PDF file creation
    pdf_filename = f"{student_name}_Report.pdf"
    pdf_path = os.path.join("reports", pdf_filename)

    if not os.path.exists("reports"):
        os.makedirs("reports")

    c = canvas.Canvas(pdf_path, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, 750, f"Student Report: {student_name}")

    c.setFont("Helvetica", 12)
    y = 720
    for subject, avg_score, risk_level in performance_data:
        c.drawString(100, y, f"Subject: {subject} | Score: {avg_score} | Risk: {risk_level}")
        y -= 20

    c.save()

    return send_file(pdf_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True, port=5001)