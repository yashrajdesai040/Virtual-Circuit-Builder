"""
One-time fix-up for an out-of-date circuitlab.db.

Run this ONCE, with the backend server stopped, whenever you see an error
like "table X has no column named Y". It patches your EXISTING database
file in place - adding whatever's missing - instead of requiring you to
delete the file (which OneDrive/file-locks have made unreliable).

Usage (from the backend folder, server stopped):
    python migrate_db.py
"""

import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(__file__), "circuitlab.db")


def column_exists(cursor, table, column):
    cursor.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cursor.fetchall())


def table_exists(cursor, table):
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,))
    return cursor.fetchone() is not None


def main():
    if not os.path.exists(DB_PATH):
        print("No circuitlab.db found yet - nothing to migrate.")
        print("Just run 'python app.py' normally; it'll create a fresh one.")
        return

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    changes = []

    if table_exists(cur, "projects"):
        columns_to_add = [
            ("description", "TEXT DEFAULT ''"),
            ("last_run_status", "TEXT"),
            ("last_run_at", "DATETIME"),
            ("run_count", "INTEGER DEFAULT 0"),
        ]
        for col, coltype in columns_to_add:
            if not column_exists(cur, "projects", col):
                cur.execute(f"ALTER TABLE projects ADD COLUMN {col} {coltype}")
                changes.append(f"projects.{col}")

    if not table_exists(cur, "project_collaborators"):
        cur.execute("""
            CREATE TABLE project_collaborators (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL REFERENCES projects(id),
                user_id INTEGER NOT NULL REFERENCES users(id),
                added_at DATETIME,
                UNIQUE(project_id, user_id)
            )
        """)
        changes.append("project_collaborators (new table)")

    conn.commit()
    conn.close()

    if changes:
        print("Updated:", ", ".join(changes))
    else:
        print("Database was already up to date - no changes needed.")
    print("Done. Your existing users and projects are untouched.")
    print("You can now run: python app.py")


if __name__ == "__main__":
    main()