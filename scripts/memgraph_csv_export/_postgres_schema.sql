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
