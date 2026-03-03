import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'students.db'));

// Tạo bảng students - Thông tin học sinh
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    class TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Tạo bảng sessions - Phiên học của học sinh
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    session_id TEXT UNIQUE NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    total_duration INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
  )
`);

// Tạo bảng focus_data - Dữ liệu tập trung theo giây
db.exec(`
  CREATE TABLE IF NOT EXISTS focus_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    state TEXT NOT NULL,
    focus_percentage REAL,
    distracted_percentage REAL,
    sleepy_percentage REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
  )
`);

// Tạo bảng alerts - Cảnh báo khi học sinh mất tập trung
db.exec(`
  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    message TEXT,
    focus_percentage REAL,
    timestamp DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
  )
`);

// Tạo bảng summary - Tóm tắt session
db.exec(`
  CREATE TABLE IF NOT EXISTS session_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    student_id TEXT NOT NULL,
    avg_focus REAL,
    avg_distracted REAL,
    avg_sleepy REAL,
    total_alerts INTEGER DEFAULT 0,
    focus_rating TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
  )
`);

// Tạo indexes để tìm kiếm nhanh
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_sessions_student ON sessions(student_id);
  CREATE INDEX IF NOT EXISTS idx_focus_session ON focus_data(session_id);
  CREATE INDEX IF NOT EXISTS idx_alerts_session ON alerts(session_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active);
`);

console.log('✅ Database initialized successfully');

export default db;
