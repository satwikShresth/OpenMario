#!/usr/bin/env python3
"""
Export Memgraph nodes and relationships to CSV files for PostgreSQL import.
"""

import csv
import os

from neo4j import GraphDatabase


OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "memgraph_csv_export")


def get_driver():
    return GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))


def write_csv(filename, fieldnames, rows):
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    print(f"  -> {filename}: {len(rows)} rows")
    return path


def export_nodes(session):
    print("\n== Nodes ==")

    # college
    r = session.run("MATCH (n:College) RETURN n.id AS id, n.name AS name")
    write_csv("college.csv", ["id", "name"], [dict(rec) for rec in r])

    # term (strip the .0 float suffix)
    r = session.run("MATCH (n:Term) RETURN toInteger(n.id) AS id")
    write_csv("term.csv", ["id"], [dict(rec) for rec in r])

    # day
    r = session.run("MATCH (n:Day) RETURN n.id AS id")
    write_csv("day.csv", ["id"], [dict(rec) for rec in r])

    # subject
    r = session.run("MATCH (n:Subject) RETURN n.id AS id, n.name AS name, n.college_id AS college_id")
    write_csv("subject.csv", ["id", "name", "college_id"], [dict(rec) for rec in r])

    # instructor
    r = session.run("""
        MATCH (n:Instructor)
        RETURN
            toInteger(n.id) AS id,
            n.name AS name,
            n.department AS department,
            toInteger(n.rmp_legacy_id) AS rmp_legacy_id,
            n.rmp_id AS rmp_id,
            toInteger(n.num_ratings) AS num_ratings,
            toFloat(n.avg_rating) AS avg_rating,
            toFloat(n.avg_difficulty) AS avg_difficulty
    """)
    write_csv("instructor.csv",
              ["id", "name", "department", "rmp_legacy_id", "rmp_id", "num_ratings", "avg_rating", "avg_difficulty"],
              [dict(rec) for rec in r])

    # course
    r = session.run("""
        MATCH (n:Course)
        RETURN
            n.id AS id,
            n.subject_id AS subject_id,
            n.course_number AS course_number,
            n.title AS title,
            toFloat(n.credits) AS credits,
            n.credit_range AS credit_range,
            n.description AS description,
            CASE WHEN toLower(toString(n.writing_intensive)) = 'true' THEN true ELSE false END AS writing_intensive,
            n.repeat_status AS repeat_status,
            n.restrictions AS restrictions
    """)
    write_csv("course.csv",
              ["id", "subject_id", "course_number", "title", "credits", "credit_range",
               "description", "writing_intensive", "repeat_status", "restrictions"],
              [dict(rec) for rec in r])

    # section  (instruction_method + instruction_type come from the OFFERS edge)
    r = session.run("""
        MATCH (c:Course)-[o:OFFERS]->(n:Section)
        RETURN
            toInteger(n.crn) AS crn,
            n.course_id AS course_id,
            n.subject_code AS subject_code,
            n.course_number AS course_number,
            toInteger(n.term) AS term_id,
            n.section AS section,
            toInteger(n.max_enroll) AS max_enroll,
            n.start_time AS start_time,
            n.end_time AS end_time,
            o.instruction_method AS instruction_method,
            o.instruction_type AS instruction_type
    """)
    write_csv("section.csv",
              ["crn", "course_id", "subject_code", "course_number", "term_id", "section",
               "max_enroll", "start_time", "end_time", "instruction_method", "instruction_type"],
              [dict(rec) for rec in r])


def export_relationships(session):
    print("\n== Relationships ==")

    # section_days
    r = session.run("""
        MATCH (sec:Section)-[:SCHEDULED_ON]->(d:Day)
        RETURN toInteger(sec.crn) AS section_crn, d.id AS day_id
    """)
    write_csv("section_days.csv", ["section_crn", "day_id"], [dict(rec) for rec in r])

    # instructor_sections
    r = session.run("""
        MATCH (i:Instructor)-[:TEACHES]->(sec:Section)
        RETURN toInteger(i.id) AS instructor_id, toInteger(sec.crn) AS section_crn
    """)
    write_csv("instructor_sections.csv", ["instructor_id", "section_crn"], [dict(rec) for rec in r])

    # instructor_courses
    r = session.run("""
        MATCH (i:Instructor)-[:TAUGHT]->(c:Course)
        RETURN toInteger(i.id) AS instructor_id, c.id AS course_id
    """)
    write_csv("instructor_courses.csv", ["instructor_id", "course_id"], [dict(rec) for rec in r])

    # course_prerequisites
    # Direction: (prereq)-[:PREREQUISITE]->(course), so b is the course being taken
    # and a is what must be completed first.
    r = session.run("""
        MATCH (a:Course)-[p:PREREQUISITE]->(b:Course)
        RETURN
            b.id AS course_id,
            a.id AS prerequisite_course_id,
            p.relationship_type AS relationship_type,
            p.group_id AS group_id,
            p.can_take_concurrent AS can_take_concurrent,
            p.minimum_grade AS minimum_grade
    """)
    write_csv("course_prerequisites.csv",
              ["course_id", "prerequisite_course_id", "relationship_type", "group_id",
               "can_take_concurrent", "minimum_grade"],
              [dict(rec) for rec in r])

    # course_corequisites
    # (a)-[:COREQUISITE]->(b): a is the course that requires b concurrently.
    # Memgraph stores both directions; using the original direction here.
    r = session.run("""
        MATCH (a:Course)-[:COREQUISITE]->(b:Course)
        RETURN a.id AS course_id, b.id AS corequisite_course_id
    """)
    write_csv("course_corequisites.csv", ["course_id", "corequisite_course_id"], [dict(rec) for rec in r])


def write_ddl():
    print("\n== PostgreSQL DDL ==")
    ddl = """\
-- ============================================================
--  Auto-generated PostgreSQL schema from Memgraph (OpenMario)
-- ============================================================

-- ------------------------------------------------------------
-- Reference / lookup tables
-- ------------------------------------------------------------

CREATE TABLE college (
    id   TEXT PRIMARY KEY,   -- e.g. "A", "AS", "B"
    name TEXT NOT NULL
);

CREATE TABLE term (
    id INTEGER PRIMARY KEY   -- e.g. 202515 (year + quarter code)
);

CREATE TABLE day (
    id TEXT PRIMARY KEY      -- "Monday", "Tuesday", ...
);

-- ------------------------------------------------------------
-- Core domain tables
-- ------------------------------------------------------------

CREATE TABLE subject (
    id         TEXT PRIMARY KEY,  -- e.g. "ACCT", "ANIM"
    name       TEXT NOT NULL,
    college_id TEXT NOT NULL REFERENCES college(id)
);

CREATE TABLE course (
    id               UUID    PRIMARY KEY,
    subject_id       TEXT    NOT NULL REFERENCES subject(id),
    course_number    TEXT    NOT NULL,
    title            TEXT    NOT NULL,
    credits          NUMERIC(5, 1),
    credit_range     TEXT,                    -- nullable, e.g. "0.0-12.0"
    description      TEXT,
    writing_intensive BOOLEAN NOT NULL DEFAULT FALSE,
    repeat_status    TEXT,
    restrictions     TEXT
);

CREATE TABLE instructor (
    id             INTEGER PRIMARY KEY,
    name           TEXT    NOT NULL,
    department     TEXT,
    rmp_legacy_id  INTEGER,
    rmp_id         TEXT,
    num_ratings    INTEGER,
    avg_rating     NUMERIC(3, 1),
    avg_difficulty NUMERIC(3, 1)
);

CREATE TABLE section (
    crn               INTEGER PRIMARY KEY,
    course_id         UUID    NOT NULL REFERENCES course(id),
    subject_code      TEXT    NOT NULL REFERENCES subject(id),
    course_number     TEXT    NOT NULL,
    term_id           INTEGER NOT NULL REFERENCES term(id),
    section           TEXT    NOT NULL,
    max_enroll        INTEGER NOT NULL,
    start_time        TIME,
    end_time          TIME,
    instruction_method TEXT,   -- from OFFERS edge: e.g. "Face To Face", "Online"
    instruction_type   TEXT    -- from OFFERS edge: e.g. "Lecture", "Lab", "Recitation"
);

-- ------------------------------------------------------------
-- Relationship tables
-- ------------------------------------------------------------

CREATE TABLE section_days (
    section_crn INTEGER NOT NULL REFERENCES section(crn),
    day_id      TEXT    NOT NULL REFERENCES day(id),
    PRIMARY KEY (section_crn, day_id)
);

CREATE TABLE instructor_sections (
    instructor_id INTEGER NOT NULL REFERENCES instructor(id),
    section_crn   INTEGER NOT NULL REFERENCES section(crn),
    PRIMARY KEY (instructor_id, section_crn)
);

CREATE TABLE instructor_courses (
    instructor_id INTEGER NOT NULL REFERENCES instructor(id),
    course_id     UUID    NOT NULL REFERENCES course(id),
    PRIMARY KEY (instructor_id, course_id)
);

CREATE TABLE course_prerequisites (
    course_id              UUID NOT NULL REFERENCES course(id),
    prerequisite_course_id UUID NOT NULL REFERENCES course(id),
    relationship_type      TEXT NOT NULL,   -- "REQUIRED" | "CHOICE"
    group_id               TEXT NOT NULL,   -- e.g. "g1" — groups choices together
    can_take_concurrent    BOOLEAN NOT NULL DEFAULT FALSE,
    minimum_grade          TEXT,            -- e.g. "D", "C"
    PRIMARY KEY (course_id, prerequisite_course_id)
);

CREATE TABLE course_corequisites (
    course_id              UUID NOT NULL REFERENCES course(id),
    corequisite_course_id  UUID NOT NULL REFERENCES course(id),
    PRIMARY KEY (course_id, corequisite_course_id)
);

-- ------------------------------------------------------------
-- Useful indexes
-- ------------------------------------------------------------

CREATE INDEX ON section (course_id);
CREATE INDEX ON section (term_id);
CREATE INDEX ON section (subject_code);
CREATE INDEX ON course (subject_id);
CREATE INDEX ON subject (college_id);
CREATE INDEX ON course_prerequisites (prerequisite_course_id);
CREATE INDEX ON instructor_sections (section_crn);
CREATE INDEX ON instructor_courses (course_id);
"""
    path = os.path.join(OUTPUT_DIR, "_postgres_schema.sql")
    with open(path, "w", encoding="utf-8") as f:
        f.write(ddl)
    print(f"  -> _postgres_schema.sql written")


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Connecting to Memgraph at {NEO4J_URI}...")
    driver = get_driver()
    with driver.session() as session:
        export_nodes(session)
        export_relationships(session)
    driver.close()
    write_ddl()
    print(f"\nDone! All files in: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
