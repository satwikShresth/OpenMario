import { pgTable, foreignKey, unique, uuid, varchar, text, integer, doublePrecision, timestamp, index, numeric, boolean, smallint, time, serial, bigint, primaryKey, pgMaterializedView, json, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const academicYearTerm = pgEnum("academic_year_term", ['fall', 'winter', 'spring', 'summer'])
export const citizenshipRestriction = pgEnum("citizenship_restriction", ['No Restriction', 'Resident Alien (Green Card) or US Citizen', 'US Citizen Only'])
export const compensationStatus = pgEnum("compensation_status", ['Unpaid Position', 'Hourly Paid or Salaried Position'])
export const coopCycle = pgEnum("coop_cycle", ['Fall/Winter', 'Winter/Spring', 'Spring/Summer', 'Summer/Fall'])
export const coopSequence = pgEnum("coop_sequence", ['Only', 'First', 'Second', 'Third'])
export const coopYear = pgEnum("coop_year", ['1st', '2nd', '3rd'])
export const dayOfWeek = pgEnum("day_of_week", ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
export const experienceLevel = pgEnum("experience_level", ['Advanced', 'Beginner', 'Intermediate'])
export const jobStatus = pgEnum("job_status", ['Inactive', 'Pending', 'Cancelled', 'Active', 'Delete'])
export const jobType = pgEnum("job_type", ['Co-op Experience', 'Graduate Co-op Experience', 'Summer-Only Coop'])
export const programLevel = pgEnum("program_level", ['Undergraduate', 'Graduate'])


export const company = pgTable("company", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	ownerId: text("owner_id"),
}, (table) => [
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [user.id],
			name: "company_owner_id_user_id_fk"
		}).onDelete("set null"),
	unique("company_name_unique").on(table.name),
]);

export const submission = pgTable("submission", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	positionId: uuid("position_id").notNull(),
	locationId: uuid("location_id").notNull(),
	programLevel: programLevel("program_level").notNull(),
	workHours: integer("work_hours").default(40).notNull(),
	coopCycle: coopCycle("coop_cycle").notNull(),
	coopYear: coopYear("coop_year").notNull(),
	year: integer().notNull(),
	compensation: doublePrecision(),
	otherCompensation: varchar("other_compensation", { length: 255 }),
	details: varchar({ length: 255 }),
	ownerId: text("owner_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.locationId],
			foreignColumns: [location.id],
			name: "submission_location_id_location_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [user.id],
			name: "submission_owner_id_user_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.positionId],
			foreignColumns: [position.id],
			name: "submission_position_id_position_id_fk"
		}).onDelete("restrict"),
]);

export const course = pgTable("course", {
	id: uuid().primaryKey().notNull(),
	subjectId: text("subject_id").notNull(),
	courseNumber: text("course_number").notNull(),
	title: text().notNull(),
	credits: numeric({ precision: 5, scale:  1 }),
	creditRange: text("credit_range"),
	description: text(),
	writingIntensive: boolean("writing_intensive").default(false).notNull(),
	repeatStatus: text("repeat_status"),
	restrictions: text(),
}, (table) => [
	index().using("btree", table.subjectId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subject.id],
			name: "course_subject_id_subject_id_fk"
		}).onDelete("restrict"),
]);

export const positionReview = pgTable("position_review", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	positionId: uuid("position_id").notNull(),
	jobId: varchar("job_id", { length: 20 }).notNull(),
	reviewIndex: integer("review_index").default(1).notNull(),
	coopCycle: coopCycle("coop_cycle").notNull(),
	year: integer().notNull(),
	coopSequence: coopSequence("coop_sequence"),
	department: varchar({ length: 255 }),
	daysPerWeek: integer("days_per_week"),
	shiftWorkRequired: boolean("shift_work_required"),
	overtimeRequired: boolean("overtime_required"),
	publicTransitAvailable: boolean("public_transit_available"),
	employerHousingAssistance: boolean("employer_housing_assistance"),
	ratingCollaboration: smallint("rating_collaboration"),
	ratingWorkVariety: smallint("rating_work_variety"),
	ratingRelationships: smallint("rating_relationships"),
	ratingSupervisorAccess: smallint("rating_supervisor_access"),
	ratingTraining: smallint("rating_training"),
	ratingOverall: smallint("rating_overall"),
	wouldRecommend: boolean("would_recommend"),
	descriptionAccurate: boolean("description_accurate"),
	bestFeatures: text("best_features"),
	challenges: text(),
	resumeDescription: text("resume_description"),
	compWrittenComm: smallint("comp_written_comm"),
	compVerbalComm: smallint("comp_verbal_comm"),
	compCommStyle: smallint("comp_comm_style"),
	compOriginalIdeas: smallint("comp_original_ideas"),
	compProblemSolving: smallint("comp_problem_solving"),
	compInfoEvaluation: smallint("comp_info_evaluation"),
	compDataDecisions: smallint("comp_data_decisions"),
	compEthicalStandards: smallint("comp_ethical_standards"),
	compTechnologyUse: smallint("comp_technology_use"),
	compGoalSetting: smallint("comp_goal_setting"),
	compDiversity: smallint("comp_diversity"),
	compWorkHabits: smallint("comp_work_habits"),
	compProactive: smallint("comp_proactive"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.positionId],
			foreignColumns: [position.id],
			name: "position_review_position_id_position_id_fk"
		}).onDelete("cascade"),
	unique("position_review_position_id_job_id_review_index_unique").on(table.positionId, table.jobId, table.reviewIndex),
]);

export const college = pgTable("college", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
});

export const position = pgTable("position", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	companyId: uuid("company_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	ownerId: text("owner_id"),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [company.id],
			name: "position_company_id_company_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [user.id],
			name: "position_owner_id_user_id_fk"
		}).onDelete("set null"),
	unique("position_company_id_name_unique").on(table.companyId, table.name),
]);

export const jobPosting = pgTable("job_posting", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	positionId: uuid("position_id").notNull(),
	locationId: uuid("location_id"),
	jobType: jobType("job_type").notNull(),
	jobStatus: jobStatus("job_status").default('Inactive').notNull(),
	coopCycle: coopCycle("coop_cycle").notNull(),
	year: integer().notNull(),
	jobLength: integer("job_length").default(2).notNull(),
	workHours: integer("work_hours").default(40).notNull(),
	openings: integer().default(1),
	divisionDescription: varchar("division_description", { length: 10000 }),
	positionDescription: varchar("position_description", { length: 15000 }),
	recommendedQualifications: varchar("recommended_qualifications", { length: 5000 }),
	minimumGpa: doublePrecision("minimum_gpa"),
	isNonprofit: boolean("is_nonprofit").default(false),
	exposureHazardousMaterials: boolean("exposure_hazardous_materials").default(false),
	isResearchPosition: boolean("is_research_position").default(false),
	isThirdPartyEmployer: boolean("is_third_party_employer").default(false),
	travelRequired: boolean("travel_required").default(false),
	citizenshipRestriction: citizenshipRestriction("citizenship_restriction").notNull(),
	preEmploymentScreening: varchar("pre_employment_screening", { length: 1000 }).default('None'),
	transportation: varchar({ length: 1000 }),
	compensationStatus: compensationStatus("compensation_status").notNull(),
	compensationDetails: varchar("compensation_details", { length: 5000 }),
	otherCompensation: varchar("other_compensation", { length: 5000 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.locationId],
			foreignColumns: [location.id],
			name: "job_posting_location_id_location_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.positionId],
			foreignColumns: [position.id],
			name: "job_posting_position_id_position_id_fk"
		}).onDelete("cascade"),
]);

export const account = pgTable("account", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const section = pgTable("section", {
	crn: integer().notNull(),
	courseId: uuid("course_id").notNull(),
	subjectCode: text("subject_code").notNull(),
	courseNumber: text("course_number").notNull(),
	termId: integer("term_id").notNull(),
	section: text().notNull(),
	maxEnroll: integer("max_enroll"),
	startTime: time("start_time"),
	endTime: time("end_time"),
	instructionMethod: text("instruction_method"),
	instructionType: text("instruction_type"),
	id: uuid().defaultRandom().primaryKey().notNull(),
}, (table) => [
	index().using("btree", table.courseId.asc().nullsLast().op("uuid_ops")),
	index().using("btree", table.crn.asc().nullsLast().op("int4_ops")),
	index().using("btree", table.subjectCode.asc().nullsLast().op("text_ops")),
	index().using("btree", table.termId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [course.id],
			name: "section_course_id_course_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.subjectCode],
			foreignColumns: [subject.id],
			name: "section_subject_code_subject_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.termId],
			foreignColumns: [term.id],
			name: "section_term_id_term_id_fk"
		}).onDelete("restrict"),
	unique("section_crn_term_id_unique").on(table.crn, table.termId),
]);

export const subject = pgTable("subject", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	collegeId: text("college_id").notNull(),
}, (table) => [
	index().using("btree", table.collegeId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.collegeId],
			foreignColumns: [college.id],
			name: "subject_college_id_college_id_fk"
		}).onDelete("restrict"),
]);

export const instructor = pgTable("instructor", {
	id: integer().primaryKey().notNull(),
	name: text().notNull(),
	department: text(),
	rmpLegacyId: integer("rmp_legacy_id"),
	rmpId: text("rmp_id"),
	numRatings: integer("num_ratings"),
	avgRating: numeric("avg_rating", { precision: 3, scale:  1 }),
	avgDifficulty: numeric("avg_difficulty", { precision: 3, scale:  1 }),
});

export const oldUsers = pgTable("old_users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	username: varchar({ length: 100 }).notNull(),
	email: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("old_users_email_unique").on(table.email),
]);

export const location = pgTable("location", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	stateCode: varchar("state_code", { length: 3 }).notNull(),
	state: varchar({ length: 100 }).notNull(),
	city: varchar({ length: 100 }).notNull(),
}, (table) => [
	unique("location_state_code_state_city_unique").on(table.stateCode, table.state, table.city),
]);

export const major = pgTable("major", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	programLevel: programLevel("program_level").notNull(),
	name: varchar({ length: 255 }).notNull(),
}, (table) => [
	unique("major_name_unique").on(table.name),
]);

export const minor = pgTable("minor", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	programLevel: programLevel("program_level").notNull(),
	name: varchar({ length: 255 }).notNull(),
}, (table) => [
	unique("minor_name_unique").on(table.name),
]);

export const term = pgTable("term", {
	id: integer().primaryKey().notNull(),
});

export const session = pgTable("session", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
	impersonatedBy: text("impersonated_by"),
}, (table) => [
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const verification = pgTable("verification", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);

export const user = pgTable("user", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isAnonymous: boolean("is_anonymous").default(false),
	role: text(),
	banned: boolean().default(false),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires", { mode: 'string' }),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const drizzleMigrations = pgTable("__drizzle_migrations", {
	id: serial().primaryKey().notNull(),
	hash: text().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	createdAt: bigint("created_at", { mode: "number" }),
});

export const courseCorequisites = pgTable("course_corequisites", {
	courseId: uuid("course_id").notNull(),
	corequisiteCourseId: uuid("corequisite_course_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.corequisiteCourseId],
			foreignColumns: [course.id],
			name: "course_corequisites_corequisite_course_id_course_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [course.id],
			name: "course_corequisites_course_id_course_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.courseId, table.corequisiteCourseId], name: "course_corequisites_course_id_corequisite_course_id_pk"}),
]);

export const instructorSections = pgTable("instructor_sections", {
	instructorId: integer("instructor_id").notNull(),
	sectionId: uuid("section_id").notNull(),
}, (table) => [
	index().using("btree", table.sectionId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.instructorId],
			foreignColumns: [instructor.id],
			name: "instructor_sections_instructor_id_instructor_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sectionId],
			foreignColumns: [section.id],
			name: "instructor_sections_section_id_section_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.instructorId, table.sectionId], name: "instructor_sections_instructor_id_section_id_pk"}),
]);

export const instructorCourses = pgTable("instructor_courses", {
	instructorId: integer("instructor_id").notNull(),
	courseId: uuid("course_id").notNull(),
}, (table) => [
	index().using("btree", table.courseId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [course.id],
			name: "instructor_courses_course_id_course_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.instructorId],
			foreignColumns: [instructor.id],
			name: "instructor_courses_instructor_id_instructor_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.instructorId, table.courseId], name: "instructor_courses_instructor_id_course_id_pk"}),
]);

export const sectionDays = pgTable("section_days", {
	day: dayOfWeek().notNull(),
	sectionId: uuid("section_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.sectionId],
			foreignColumns: [section.id],
			name: "section_days_section_id_section_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.day, table.sectionId], name: "section_days_section_id_day_pk"}),
]);

export const jobExperienceLevels = pgTable("job_experience_levels", {
	jobPostingId: uuid("job_posting_id").notNull(),
	experienceLevel: experienceLevel("experience_level").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.jobPostingId],
			foreignColumns: [jobPosting.id],
			name: "job_experience_levels_job_posting_id_job_posting_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.jobPostingId, table.experienceLevel], name: "job_experience_levels_job_posting_id_experience_level_pk"}),
]);

export const jobPostingMajor = pgTable("job_posting_major", {
	jobPostingId: uuid("job_posting_id").notNull(),
	majorId: uuid("major_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.jobPostingId],
			foreignColumns: [jobPosting.id],
			name: "job_posting_major_job_posting_id_job_posting_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.majorId],
			foreignColumns: [major.id],
			name: "job_posting_major_major_id_major_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.jobPostingId, table.majorId], name: "job_posting_major_job_posting_id_major_id_pk"}),
]);

export const profileMinor = pgTable("profile_minor", {
	userId: text("user_id").notNull(),
	minorId: uuid("minor_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.minorId],
			foreignColumns: [minor.id],
			name: "profile_minor_minor_id_minor_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "profile_minor_user_id_user_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.minorId], name: "profile_minor_user_id_minor_id_pk"}),
]);

export const profileMajor = pgTable("profile_major", {
	userId: text("user_id").notNull(),
	majorId: uuid("major_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.majorId],
			foreignColumns: [major.id],
			name: "profile_major_major_id_major_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "profile_major_user_id_user_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.majorId], name: "profile_major_user_id_major_id_pk"}),
]);

export const courseHistory = pgTable("course_history", {
	courseId: uuid("course_id").notNull(),
	academicYear: text("academic_year").notNull(),
	term: academicYearTerm().notNull(),
}, (table) => [
	index().using("btree", table.academicYear.asc().nullsLast().op("text_ops")),
	index().using("btree", table.term.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [course.id],
			name: "course_history_course_id_course_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.courseId, table.academicYear, table.term], name: "course_history_course_id_academic_year_term_pk"}),
]);

export const coursePrerequisites = pgTable("course_prerequisites", {
	courseId: uuid("course_id").notNull(),
	prerequisiteCourseId: uuid("prerequisite_course_id").notNull(),
	relationshipType: text("relationship_type").notNull(),
	groupId: text("group_id").notNull(),
	canTakeConcurrent: boolean("can_take_concurrent").default(false).notNull(),
	minimumGrade: text("minimum_grade"),
}, (table) => [
	index().using("btree", table.prerequisiteCourseId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [course.id],
			name: "course_prerequisites_course_id_course_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.prerequisiteCourseId],
			foreignColumns: [course.id],
			name: "course_prerequisites_prerequisite_course_id_course_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.courseId, table.prerequisiteCourseId], name: "course_prerequisites_course_id_prerequisite_course_id_pk"}),
]);
export const companyDetailMView = pgMaterializedView("company_detail_m_view", {	id: uuid(),
	name: varchar({ length: 255 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalReviews: bigint("total_reviews", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	positionsReviewed: bigint("positions_reviewed", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalSubmissions: bigint("total_submissions", { mode: "number" }),
	avgCompensation: numeric("avg_compensation"),
	medianCompensation: numeric("median_compensation"),
	omegaScore: numeric("omega_score"),
	satisfactionScore: numeric("satisfaction_score"),
	trustScore: numeric("trust_score"),
	integrityScore: numeric("integrity_score"),
	growthScore: numeric("growth_score"),
	workLifeScore: numeric("work_life_score"),
	avgRatingOverall: numeric("avg_rating_overall"),
	avgRatingCollaboration: numeric("avg_rating_collaboration"),
	avgRatingWorkVariety: numeric("avg_rating_work_variety"),
	avgRatingRelationships: numeric("avg_rating_relationships"),
	avgRatingSupervisorAccess: numeric("avg_rating_supervisor_access"),
	avgRatingTraining: numeric("avg_rating_training"),
	pctWouldRecommend: numeric("pct_would_recommend"),
	pctDescriptionAccurate: numeric("pct_description_accurate"),
	avgDaysPerWeek: numeric("avg_days_per_week"),
	pctPublicTransit: numeric("pct_public_transit"),
	pctOvertimeRequired: numeric("pct_overtime_required"),
}).as(sql`SELECT company.id, company.name, count(DISTINCT position_review.id) AS total_reviews, count(DISTINCT "position".id) FILTER (WHERE position_review.id IS NOT NULL) AS positions_reviewed, count(DISTINCT submission.id) AS total_submissions, round(avg(submission.compensation)::numeric, 2) AS avg_compensation, round(percentile_cont(0.5::double precision) WITHIN GROUP (ORDER BY submission.compensation)::numeric, 2) AS median_compensation, round((0.30 * ((avg(position_review.rating_collaboration) + avg(position_review.rating_work_variety) + avg(position_review.rating_relationships) + avg(position_review.rating_supervisor_access) + avg(position_review.rating_training)) / 5.0 / 4.0) + 0.25 * (count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric) + 0.15 * (count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric) + 0.20 * ((avg(position_review.comp_written_comm) + avg(position_review.comp_verbal_comm) + avg(position_review.comp_comm_style) + avg(position_review.comp_original_ideas) + avg(position_review.comp_problem_solving) + avg(position_review.comp_info_evaluation) + avg(position_review.comp_data_decisions) + avg(position_review.comp_ethical_standards) + avg(position_review.comp_technology_use) + avg(position_review.comp_goal_setting) + avg(position_review.comp_diversity) + avg(position_review.comp_work_habits) + avg(position_review.comp_proactive)) / 13.0 / 4.0) + 0.10 * (1.0 - (0.5 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric + 0.5 * LEAST(GREATEST(avg(position_review.days_per_week) - 3::numeric, 0::numeric), 2::numeric) / 2.0))) * 100::numeric, 1) AS omega_score, round((avg(position_review.rating_collaboration) + avg(position_review.rating_work_variety) + avg(position_review.rating_relationships) + avg(position_review.rating_supervisor_access) + avg(position_review.rating_training)) / 5.0 / 4.0 * 100::numeric, 1) AS satisfaction_score, round(count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric * 100::numeric, 1) AS trust_score, round(count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric * 100::numeric, 1) AS integrity_score, round((avg(position_review.comp_written_comm) + avg(position_review.comp_verbal_comm) + avg(position_review.comp_comm_style) + avg(position_review.comp_original_ideas) + avg(position_review.comp_problem_solving) + avg(position_review.comp_info_evaluation) + avg(position_review.comp_data_decisions) + avg(position_review.comp_ethical_standards) + avg(position_review.comp_technology_use) + avg(position_review.comp_goal_setting) + avg(position_review.comp_diversity) + avg(position_review.comp_work_habits) + avg(position_review.comp_proactive)) / 13.0 / 4.0 * 100::numeric, 1) AS growth_score, round((1.0 - (0.5 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric + 0.5 * LEAST(GREATEST(avg(position_review.days_per_week) - 3::numeric, 0::numeric), 2::numeric) / 2.0)) * 100::numeric, 1) AS work_life_score, round(avg(position_review.rating_overall), 2) AS avg_rating_overall, round(avg(position_review.rating_collaboration), 2) AS avg_rating_collaboration, round(avg(position_review.rating_work_variety), 2) AS avg_rating_work_variety, round(avg(position_review.rating_relationships), 2) AS avg_rating_relationships, round(avg(position_review.rating_supervisor_access), 2) AS avg_rating_supervisor_access, round(avg(position_review.rating_training), 2) AS avg_rating_training, round(100.0 * count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric, 1) AS pct_would_recommend, round(100.0 * count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric, 1) AS pct_description_accurate, round(avg(position_review.days_per_week), 1) AS avg_days_per_week, round(100.0 * count(*) FILTER (WHERE position_review.public_transit_available = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.public_transit_available IS NOT NULL), 0)::numeric, 1) AS pct_public_transit, round(100.0 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric, 1) AS pct_overtime_required FROM company JOIN "position" ON "position".company_id = company.id LEFT JOIN position_review ON position_review.position_id = "position".id LEFT JOIN submission ON submission.position_id = "position".id GROUP BY company.id, company.name`);

export const companyPositionsMView = pgMaterializedView("company_positions_m_view", {	positionId: uuid("position_id"),
	positionName: varchar("position_name", { length: 255 }),
	companyId: uuid("company_id"),
	companyName: varchar("company_name", { length: 255 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalReviews: bigint("total_reviews", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalSubmissions: bigint("total_submissions", { mode: "number" }),
	mostRecentPostingYear: integer("most_recent_posting_year"),
	avgRatingOverall: numeric("avg_rating_overall"),
	avgRatingCollaboration: numeric("avg_rating_collaboration"),
	avgRatingWorkVariety: numeric("avg_rating_work_variety"),
	avgRatingRelationships: numeric("avg_rating_relationships"),
	avgRatingSupervisorAccess: numeric("avg_rating_supervisor_access"),
	avgRatingTraining: numeric("avg_rating_training"),
	avgCompensation: numeric("avg_compensation"),
	medianCompensation: numeric("median_compensation"),
	omegaScore: numeric("omega_score"),
	satisfactionScore: numeric("satisfaction_score"),
	trustScore: numeric("trust_score"),
	integrityScore: numeric("integrity_score"),
	growthScore: numeric("growth_score"),
	workLifeScore: numeric("work_life_score"),
}).as(sql`SELECT "position".id AS position_id, "position".name AS position_name, company.id AS company_id, company.name AS company_name, count(DISTINCT position_review.id) AS total_reviews, count(DISTINCT submission.id) AS total_submissions, max(job_posting.year) AS most_recent_posting_year, round(avg(position_review.rating_overall), 2) AS avg_rating_overall, round(avg(position_review.rating_collaboration), 2) AS avg_rating_collaboration, round(avg(position_review.rating_work_variety), 2) AS avg_rating_work_variety, round(avg(position_review.rating_relationships), 2) AS avg_rating_relationships, round(avg(position_review.rating_supervisor_access), 2) AS avg_rating_supervisor_access, round(avg(position_review.rating_training), 2) AS avg_rating_training, round(avg(submission.compensation)::numeric, 2) AS avg_compensation, round(percentile_cont(0.5::double precision) WITHIN GROUP (ORDER BY submission.compensation)::numeric, 2) AS median_compensation, round((0.30 * ((avg(position_review.rating_collaboration) + avg(position_review.rating_work_variety) + avg(position_review.rating_relationships) + avg(position_review.rating_supervisor_access) + avg(position_review.rating_training)) / 5.0 / 4.0) + 0.25 * (count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric) + 0.15 * (count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric) + 0.20 * ((avg(position_review.comp_written_comm) + avg(position_review.comp_verbal_comm) + avg(position_review.comp_comm_style) + avg(position_review.comp_original_ideas) + avg(position_review.comp_problem_solving) + avg(position_review.comp_info_evaluation) + avg(position_review.comp_data_decisions) + avg(position_review.comp_ethical_standards) + avg(position_review.comp_technology_use) + avg(position_review.comp_goal_setting) + avg(position_review.comp_diversity) + avg(position_review.comp_work_habits) + avg(position_review.comp_proactive)) / 13.0 / 4.0) + 0.10 * (1.0 - (0.5 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric + 0.5 * LEAST(GREATEST(avg(position_review.days_per_week) - 3::numeric, 0::numeric), 2::numeric) / 2.0))) * 100::numeric, 1) AS omega_score, round((avg(position_review.rating_collaboration) + avg(position_review.rating_work_variety) + avg(position_review.rating_relationships) + avg(position_review.rating_supervisor_access) + avg(position_review.rating_training)) / 5.0 / 4.0 * 100::numeric, 1) AS satisfaction_score, round(count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric * 100::numeric, 1) AS trust_score, round(count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric * 100::numeric, 1) AS integrity_score, round((avg(position_review.comp_written_comm) + avg(position_review.comp_verbal_comm) + avg(position_review.comp_comm_style) + avg(position_review.comp_original_ideas) + avg(position_review.comp_problem_solving) + avg(position_review.comp_info_evaluation) + avg(position_review.comp_data_decisions) + avg(position_review.comp_ethical_standards) + avg(position_review.comp_technology_use) + avg(position_review.comp_goal_setting) + avg(position_review.comp_diversity) + avg(position_review.comp_work_habits) + avg(position_review.comp_proactive)) / 13.0 / 4.0 * 100::numeric, 1) AS growth_score, round((1.0 - (0.5 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric + 0.5 * LEAST(GREATEST(avg(position_review.days_per_week) - 3::numeric, 0::numeric), 2::numeric) / 2.0)) * 100::numeric, 1) AS work_life_score FROM "position" JOIN company ON company.id = "position".company_id LEFT JOIN job_posting ON job_posting.position_id = "position".id LEFT JOIN position_review ON position_review.position_id = "position".id LEFT JOIN submission ON submission.position_id = "position".id GROUP BY "position".id, "position".name, company.id, company.name`);

export const companyReviewAggregateMView = pgMaterializedView("company_review_aggregate_m_view", {	id: uuid(),
	name: varchar({ length: 255 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	positionsWithReviews: bigint("positions_with_reviews", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalReviews: bigint("total_reviews", { mode: "number" }),
	firstReviewYear: integer("first_review_year"),
	lastReviewYear: integer("last_review_year"),
	avgRatingOverall: numeric("avg_rating_overall"),
	avgRatingCollaboration: numeric("avg_rating_collaboration"),
	avgRatingWorkVariety: numeric("avg_rating_work_variety"),
	avgRatingRelationships: numeric("avg_rating_relationships"),
	avgRatingSupervisorAccess: numeric("avg_rating_supervisor_access"),
	avgRatingTraining: numeric("avg_rating_training"),
	pctWouldRecommend: numeric("pct_would_recommend"),
	pctDescriptionAccurate: numeric("pct_description_accurate"),
	avgDaysPerWeek: numeric("avg_days_per_week"),
	pctPublicTransit: numeric("pct_public_transit"),
	pctOvertimeRequired: numeric("pct_overtime_required"),
	avgCompWrittenComm: numeric("avg_comp_written_comm"),
	avgCompVerbalComm: numeric("avg_comp_verbal_comm"),
	avgCompCommStyle: numeric("avg_comp_comm_style"),
	avgCompOriginalIdeas: numeric("avg_comp_original_ideas"),
	avgCompProblemSolving: numeric("avg_comp_problem_solving"),
	avgCompInfoEvaluation: numeric("avg_comp_info_evaluation"),
	avgCompDataDecisions: numeric("avg_comp_data_decisions"),
	avgCompEthicalStandards: numeric("avg_comp_ethical_standards"),
	avgCompTechnologyUse: numeric("avg_comp_technology_use"),
	avgCompGoalSetting: numeric("avg_comp_goal_setting"),
	avgCompDiversity: numeric("avg_comp_diversity"),
	avgCompWorkHabits: numeric("avg_comp_work_habits"),
	avgCompProactive: numeric("avg_comp_proactive"),
	avgCompensation: numeric("avg_compensation"),
	medianCompensation: numeric("median_compensation"),
}).as(sql`SELECT company.id, company.name, count(DISTINCT "position".id) FILTER (WHERE position_review.id IS NOT NULL) AS positions_with_reviews, count(position_review.id) AS total_reviews, min(position_review.year) AS first_review_year, max(position_review.year) AS last_review_year, round(avg(position_review.rating_overall), 2) AS avg_rating_overall, round(avg(position_review.rating_collaboration), 2) AS avg_rating_collaboration, round(avg(position_review.rating_work_variety), 2) AS avg_rating_work_variety, round(avg(position_review.rating_relationships), 2) AS avg_rating_relationships, round(avg(position_review.rating_supervisor_access), 2) AS avg_rating_supervisor_access, round(avg(position_review.rating_training), 2) AS avg_rating_training, round(100.0 * count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric, 1) AS pct_would_recommend, round(100.0 * count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric, 1) AS pct_description_accurate, round(avg(position_review.days_per_week), 1) AS avg_days_per_week, round(100.0 * count(*) FILTER (WHERE position_review.public_transit_available = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.public_transit_available IS NOT NULL), 0)::numeric, 1) AS pct_public_transit, round(100.0 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric, 1) AS pct_overtime_required, round(avg(position_review.comp_written_comm), 2) AS avg_comp_written_comm, round(avg(position_review.comp_verbal_comm), 2) AS avg_comp_verbal_comm, round(avg(position_review.comp_comm_style), 2) AS avg_comp_comm_style, round(avg(position_review.comp_original_ideas), 2) AS avg_comp_original_ideas, round(avg(position_review.comp_problem_solving), 2) AS avg_comp_problem_solving, round(avg(position_review.comp_info_evaluation), 2) AS avg_comp_info_evaluation, round(avg(position_review.comp_data_decisions), 2) AS avg_comp_data_decisions, round(avg(position_review.comp_ethical_standards), 2) AS avg_comp_ethical_standards, round(avg(position_review.comp_technology_use), 2) AS avg_comp_technology_use, round(avg(position_review.comp_goal_setting), 2) AS avg_comp_goal_setting, round(avg(position_review.comp_diversity), 2) AS avg_comp_diversity, round(avg(position_review.comp_work_habits), 2) AS avg_comp_work_habits, round(avg(position_review.comp_proactive), 2) AS avg_comp_proactive, round(avg(submission.compensation)::numeric, 2) AS avg_compensation, round(percentile_cont(0.5::double precision) WITHIN GROUP (ORDER BY submission.compensation)::numeric, 2) AS median_compensation FROM company JOIN "position" ON "position".company_id = company.id LEFT JOIN position_review ON position_review.position_id = "position".id LEFT JOIN submission ON submission.position_id = "position".id GROUP BY company.id, company.name`);

export const positionOmegaMView = pgMaterializedView("position_omega_m_view", {	positionId: uuid("position_id"),
	positionName: varchar("position_name", { length: 255 }),
	companyId: uuid("company_id"),
	companyName: varchar("company_name", { length: 255 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalReviews: bigint("total_reviews", { mode: "number" }),
	omegaScore: numeric("omega_score"),
	satisfactionScore: numeric("satisfaction_score"),
	trustScore: numeric("trust_score"),
	integrityScore: numeric("integrity_score"),
	growthScore: numeric("growth_score"),
	workLifeScore: numeric("work_life_score"),
}).as(sql`SELECT "position".id AS position_id, "position".name AS position_name, company.id AS company_id, company.name AS company_name, count(position_review.id) AS total_reviews, round((0.30 * ((avg(position_review.rating_collaboration) + avg(position_review.rating_work_variety) + avg(position_review.rating_relationships) + avg(position_review.rating_supervisor_access) + avg(position_review.rating_training)) / 5.0 / 4.0) + 0.25 * (count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric) + 0.15 * (count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric) + 0.20 * ((avg(position_review.comp_written_comm) + avg(position_review.comp_verbal_comm) + avg(position_review.comp_comm_style) + avg(position_review.comp_original_ideas) + avg(position_review.comp_problem_solving) + avg(position_review.comp_info_evaluation) + avg(position_review.comp_data_decisions) + avg(position_review.comp_ethical_standards) + avg(position_review.comp_technology_use) + avg(position_review.comp_goal_setting) + avg(position_review.comp_diversity) + avg(position_review.comp_work_habits) + avg(position_review.comp_proactive)) / 13.0 / 4.0) + 0.10 * (1.0 - (0.5 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric + 0.5 * LEAST(GREATEST(avg(position_review.days_per_week) - 3::numeric, 0::numeric), 2::numeric) / 2.0))) * 100::numeric, 1) AS omega_score, round((avg(position_review.rating_collaboration) + avg(position_review.rating_work_variety) + avg(position_review.rating_relationships) + avg(position_review.rating_supervisor_access) + avg(position_review.rating_training)) / 5.0 / 4.0 * 100::numeric, 1) AS satisfaction_score, round(count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric * 100::numeric, 1) AS trust_score, round(count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric * 100::numeric, 1) AS integrity_score, round((avg(position_review.comp_written_comm) + avg(position_review.comp_verbal_comm) + avg(position_review.comp_comm_style) + avg(position_review.comp_original_ideas) + avg(position_review.comp_problem_solving) + avg(position_review.comp_info_evaluation) + avg(position_review.comp_data_decisions) + avg(position_review.comp_ethical_standards) + avg(position_review.comp_technology_use) + avg(position_review.comp_goal_setting) + avg(position_review.comp_diversity) + avg(position_review.comp_work_habits) + avg(position_review.comp_proactive)) / 13.0 / 4.0 * 100::numeric, 1) AS growth_score, round((1.0 - (0.5 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric + 0.5 * LEAST(GREATEST(avg(position_review.days_per_week) - 3::numeric, 0::numeric), 2::numeric) / 2.0)) * 100::numeric, 1) AS work_life_score FROM "position" JOIN company ON company.id = "position".company_id LEFT JOIN position_review ON position_review.position_id = "position".id GROUP BY "position".id, "position".name, company.id, company.name`);

export const instructorSectionsMView = pgMaterializedView("instructor_sections_m_view", {	instructorId: integer("instructor_id"),
	instructorName: text("instructor_name"),
	sectionCrn: integer("section_crn"),
	termId: integer("term_id"),
	subjectCode: text("subject_code"),
	courseNumber: text("course_number"),
	courseTitle: text("course_title"),
	sectionCode: text("section_code"),
	instructionMethod: text("instruction_method"),
	instructionType: text("instruction_type"),
}).as(sql`SELECT instructor.id AS instructor_id, instructor.name AS instructor_name, section.crn AS section_crn, section.term_id, section.subject_code, section.course_number, course.title AS course_title, section.section AS section_code, section.instruction_method, section.instruction_type FROM instructor JOIN instructor_sections ON instructor_sections.instructor_id = instructor.id JOIN section ON section.id = instructor_sections.section_id JOIN course ON course.id = section.course_id JOIN subject ON subject.id = section.subject_code`);

export const positionReviewAggregateMView = pgMaterializedView("position_review_aggregate_m_view", {	positionId: uuid("position_id"),
	positionName: varchar("position_name", { length: 255 }),
	companyName: varchar("company_name", { length: 255 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalReviews: bigint("total_reviews", { mode: "number" }),
	firstReviewYear: integer("first_review_year"),
	lastReviewYear: integer("last_review_year"),
	avgRatingOverall: numeric("avg_rating_overall"),
	avgRatingCollaboration: numeric("avg_rating_collaboration"),
	avgRatingWorkVariety: numeric("avg_rating_work_variety"),
	avgRatingRelationships: numeric("avg_rating_relationships"),
	avgRatingSupervisorAccess: numeric("avg_rating_supervisor_access"),
	avgRatingTraining: numeric("avg_rating_training"),
	pctWouldRecommend: numeric("pct_would_recommend"),
	pctDescriptionAccurate: numeric("pct_description_accurate"),
	avgDaysPerWeek: numeric("avg_days_per_week"),
	pctPublicTransit: numeric("pct_public_transit"),
	pctOvertimeRequired: numeric("pct_overtime_required"),
	avgCompWrittenComm: numeric("avg_comp_written_comm"),
	avgCompVerbalComm: numeric("avg_comp_verbal_comm"),
	avgCompCommStyle: numeric("avg_comp_comm_style"),
	avgCompOriginalIdeas: numeric("avg_comp_original_ideas"),
	avgCompProblemSolving: numeric("avg_comp_problem_solving"),
	avgCompInfoEvaluation: numeric("avg_comp_info_evaluation"),
	avgCompDataDecisions: numeric("avg_comp_data_decisions"),
	avgCompEthicalStandards: numeric("avg_comp_ethical_standards"),
	avgCompTechnologyUse: numeric("avg_comp_technology_use"),
	avgCompGoalSetting: numeric("avg_comp_goal_setting"),
	avgCompDiversity: numeric("avg_comp_diversity"),
	avgCompWorkHabits: numeric("avg_comp_work_habits"),
	avgCompProactive: numeric("avg_comp_proactive"),
}).as(sql`SELECT "position".id AS position_id, "position".name AS position_name, company.name AS company_name, count(position_review.id) AS total_reviews, min(position_review.year) AS first_review_year, max(position_review.year) AS last_review_year, round(avg(position_review.rating_overall), 2) AS avg_rating_overall, round(avg(position_review.rating_collaboration), 2) AS avg_rating_collaboration, round(avg(position_review.rating_work_variety), 2) AS avg_rating_work_variety, round(avg(position_review.rating_relationships), 2) AS avg_rating_relationships, round(avg(position_review.rating_supervisor_access), 2) AS avg_rating_supervisor_access, round(avg(position_review.rating_training), 2) AS avg_rating_training, round(100.0 * count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric, 1) AS pct_would_recommend, round(100.0 * count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric, 1) AS pct_description_accurate, round(avg(position_review.days_per_week), 1) AS avg_days_per_week, round(100.0 * count(*) FILTER (WHERE position_review.public_transit_available = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.public_transit_available IS NOT NULL), 0)::numeric, 1) AS pct_public_transit, round(100.0 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric, 1) AS pct_overtime_required, round(avg(position_review.comp_written_comm), 2) AS avg_comp_written_comm, round(avg(position_review.comp_verbal_comm), 2) AS avg_comp_verbal_comm, round(avg(position_review.comp_comm_style), 2) AS avg_comp_comm_style, round(avg(position_review.comp_original_ideas), 2) AS avg_comp_original_ideas, round(avg(position_review.comp_problem_solving), 2) AS avg_comp_problem_solving, round(avg(position_review.comp_info_evaluation), 2) AS avg_comp_info_evaluation, round(avg(position_review.comp_data_decisions), 2) AS avg_comp_data_decisions, round(avg(position_review.comp_ethical_standards), 2) AS avg_comp_ethical_standards, round(avg(position_review.comp_technology_use), 2) AS avg_comp_technology_use, round(avg(position_review.comp_goal_setting), 2) AS avg_comp_goal_setting, round(avg(position_review.comp_diversity), 2) AS avg_comp_diversity, round(avg(position_review.comp_work_habits), 2) AS avg_comp_work_habits, round(avg(position_review.comp_proactive), 2) AS avg_comp_proactive FROM "position" JOIN company ON company.id = "position".company_id LEFT JOIN position_review ON position_review.position_id = "position".id GROUP BY "position".id, "position".name, company.name`);

export const positionInformationMView = pgMaterializedView("position_information_m_view", {	positionId: uuid("position_id"),
	positionName: varchar("position_name", { length: 255 }),
	companyId: uuid("company_id"),
	companyName: varchar("company_name", { length: 255 }),
	mostRecentPostingYear: integer("most_recent_posting_year"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalReviews: bigint("total_reviews", { mode: "number" }),
	avgRatingOverall: numeric("avg_rating_overall"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalSubmissions: bigint("total_submissions", { mode: "number" }),
	avgCompensation: numeric("avg_compensation"),
	medianCompensation: numeric("median_compensation"),
}).as(sql`SELECT "position".id AS position_id, "position".name AS position_name, company.id AS company_id, company.name AS company_name, max(job_posting.year) AS most_recent_posting_year, count(DISTINCT position_review.id) AS total_reviews, round(avg(position_review.rating_overall), 2) AS avg_rating_overall, count(DISTINCT submission.id) AS total_submissions, round(avg(submission.compensation)::numeric, 2) AS avg_compensation, round(percentile_cont(0.5::double precision) WITHIN GROUP (ORDER BY submission.compensation)::numeric, 2) AS median_compensation FROM "position" JOIN company ON company.id = "position".company_id LEFT JOIN job_posting ON job_posting.position_id = "position".id LEFT JOIN position_review ON position_review.position_id = "position".id LEFT JOIN submission ON submission.position_id = "position".id GROUP BY "position".id, "position".name, company.id, company.name`);

export const meiliCompaniesMIdx = pgMaterializedView("meili_companies_m_idx", {	companyId: uuid("company_id"),
	companyName: varchar("company_name", { length: 255 }),
	positions: varchar(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalReviews: bigint("total_reviews", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	positionsReviewed: bigint("positions_reviewed", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalSubmissions: bigint("total_submissions", { mode: "number" }),
	avgCompensation: numeric("avg_compensation"),
	medianCompensation: numeric("median_compensation"),
	omegaScore: numeric("omega_score"),
	satisfactionScore: numeric("satisfaction_score"),
	trustScore: numeric("trust_score"),
	integrityScore: numeric("integrity_score"),
	growthScore: numeric("growth_score"),
	workLifeScore: numeric("work_life_score"),
	avgRatingOverall: numeric("avg_rating_overall"),
	pctWouldRecommend: numeric("pct_would_recommend"),
	pctDescriptionAccurate: numeric("pct_description_accurate"),
	avgDaysPerWeek: numeric("avg_days_per_week"),
	pctOvertimeRequired: numeric("pct_overtime_required"),
	firstReviewYear: integer("first_review_year"),
	lastReviewYear: integer("last_review_year"),
}).as(sql`SELECT company.id AS company_id, company.name AS company_name, array_agg(DISTINCT "position".name) AS positions, count(DISTINCT position_review.id) AS total_reviews, count(DISTINCT "position".id) FILTER (WHERE position_review.id IS NOT NULL) AS positions_reviewed, count(DISTINCT submission.id) AS total_submissions, round(avg(submission.compensation)::numeric, 2) AS avg_compensation, round(percentile_cont(0.5::double precision) WITHIN GROUP (ORDER BY submission.compensation)::numeric, 2) AS median_compensation, round((0.30 * ((avg(position_review.rating_collaboration) + avg(position_review.rating_work_variety) + avg(position_review.rating_relationships) + avg(position_review.rating_supervisor_access) + avg(position_review.rating_training)) / 5.0 / 4.0) + 0.25 * (count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric) + 0.15 * (count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric) + 0.20 * ((avg(position_review.comp_written_comm) + avg(position_review.comp_verbal_comm) + avg(position_review.comp_comm_style) + avg(position_review.comp_original_ideas) + avg(position_review.comp_problem_solving) + avg(position_review.comp_info_evaluation) + avg(position_review.comp_data_decisions) + avg(position_review.comp_ethical_standards) + avg(position_review.comp_technology_use) + avg(position_review.comp_goal_setting) + avg(position_review.comp_diversity) + avg(position_review.comp_work_habits) + avg(position_review.comp_proactive)) / 13.0 / 4.0) + 0.10 * (1.0 - (0.5 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric + 0.5 * LEAST(GREATEST(avg(position_review.days_per_week) - 3::numeric, 0::numeric), 2::numeric) / 2.0))) * 100::numeric, 1) AS omega_score, round((avg(position_review.rating_collaboration) + avg(position_review.rating_work_variety) + avg(position_review.rating_relationships) + avg(position_review.rating_supervisor_access) + avg(position_review.rating_training)) / 5.0 / 4.0 * 100::numeric, 1) AS satisfaction_score, round(count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric * 100::numeric, 1) AS trust_score, round(count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric * 100::numeric, 1) AS integrity_score, round((avg(position_review.comp_written_comm) + avg(position_review.comp_verbal_comm) + avg(position_review.comp_comm_style) + avg(position_review.comp_original_ideas) + avg(position_review.comp_problem_solving) + avg(position_review.comp_info_evaluation) + avg(position_review.comp_data_decisions) + avg(position_review.comp_ethical_standards) + avg(position_review.comp_technology_use) + avg(position_review.comp_goal_setting) + avg(position_review.comp_diversity) + avg(position_review.comp_work_habits) + avg(position_review.comp_proactive)) / 13.0 / 4.0 * 100::numeric, 1) AS growth_score, round((1.0 - (0.5 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric + 0.5 * LEAST(GREATEST(avg(position_review.days_per_week) - 3::numeric, 0::numeric), 2::numeric) / 2.0)) * 100::numeric, 1) AS work_life_score, round(avg(position_review.rating_overall), 2) AS avg_rating_overall, round(100.0 * count(*) FILTER (WHERE position_review.would_recommend = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.would_recommend IS NOT NULL), 0)::numeric, 1) AS pct_would_recommend, round(100.0 * count(*) FILTER (WHERE position_review.description_accurate = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.description_accurate IS NOT NULL), 0)::numeric, 1) AS pct_description_accurate, round(avg(position_review.days_per_week), 1) AS avg_days_per_week, round(100.0 * count(*) FILTER (WHERE position_review.overtime_required = true)::numeric / NULLIF(count(*) FILTER (WHERE position_review.overtime_required IS NOT NULL), 0)::numeric, 1) AS pct_overtime_required, min(position_review.year) AS first_review_year, max(position_review.year) AS last_review_year FROM company JOIN "position" ON "position".company_id = company.id LEFT JOIN position_review ON position_review.position_id = "position".id LEFT JOIN submission ON submission.position_id = "position".id GROUP BY company.id, company.name`);

export const submissionsMView = pgMaterializedView("submissions_m_view", {	id: uuid(),
	year: integer(),
	coopYear: coopYear("coop_year"),
	coopCycle: coopCycle("coop_cycle"),
	programLevel: programLevel("program_level"),
	workHours: integer("work_hours"),
	compensation: doublePrecision(),
	otherCompensation: varchar("other_compensation", { length: 255 }),
	details: varchar({ length: 255 }),
	ownerId: text("owner_id"),
	createdAt: timestamp("created_at", { mode: 'string' }),
	companyId: uuid("company_id"),
	positionId: uuid("position_id"),
	companyName: varchar("company_name", { length: 255 }),
	positionName: varchar("position_name", { length: 255 }),
	city: varchar({ length: 100 }),
	state: varchar({ length: 100 }),
	stateCode: varchar("state_code", { length: 3 }),
	searchText: text("search_text"),
}).with({"fillfactor":90}).as(sql`SELECT submission.id, submission.year, submission.coop_year, submission.coop_cycle, submission.program_level, submission.work_hours, submission.compensation, submission.other_compensation, submission.details, submission.owner_id, submission.created_at, company.id AS company_id, "position".id AS position_id, company.name AS company_name, "position".name AS position_name, location.city, location.state, location.state_code, (((((((((((COALESCE(company.name, ''::character varying)::text || ' '::text) || COALESCE("position".name, ''::character varying)::text) || ' '::text) || COALESCE(location.city, ''::character varying)::text) || ' '::text) || COALESCE(location.state, ''::character varying)::text) || ' '::text) || COALESCE(location.state_code, ''::character varying)::text) || ' '::text) || COALESCE(submission.details, ''::character varying)::text) || ' '::text) || COALESCE(submission.other_compensation, ''::character varying)::text AS search_text FROM submission LEFT JOIN "position" ON submission.position_id = "position".id LEFT JOIN location ON submission.location_id = location.id LEFT JOIN company ON "position".company_id = company.id`);

export const meiliSectionsMIdx = pgMaterializedView("meili_sections_m_idx", {	crn: integer(),
	section: text(),
	courseNumber: text("course_number"),
	instructionType: text("instruction_type"),
	instructionMethod: text("instruction_method"),
	credits: numeric({ precision: 5, scale:  1 }),
	maxEnroll: integer("max_enroll"),
	startTime: time("start_time"),
	endTime: time("end_time"),
	days: text(),
	term: text(),
	course: text(),
	title: text(),
	description: text(),
	restrictions: text(),
	repeatStatus: text("repeat_status"),
	writingIntensive: boolean("writing_intensive"),
	subjectId: text("subject_id"),
	subjectName: text("subject_name"),
	collegeId: text("college_id"),
	collegeName: text("college_name"),
	courseId: uuid("course_id"),
	instructors: json(),
}).as(sql`SELECT section.crn, section.section, section.course_number, section.instruction_type, section.instruction_method, course.credits, section.max_enroll, section.start_time, section.end_time, COALESCE(array_agg(DISTINCT section_days.day::text) FILTER (WHERE section_days.day IS NOT NULL), '{}'::text[]) AS days, section.term_id::text AS term, (subject.id || ' '::text) || section.course_number AS course, course.title, course.description, course.restrictions, course.repeat_status, course.writing_intensive, subject.id AS subject_id, subject.name AS subject_name, college.id AS college_id, college.name AS college_name, course.id AS course_id, COALESCE(json_agg(DISTINCT jsonb_build_object('id', instructor.id, 'name', instructor.name, 'department', instructor.department, 'avg_rating', instructor.avg_rating::double precision, 'avg_difficulty', instructor.avg_difficulty::double precision, 'num_ratings', instructor.num_ratings, 'rmp_id', instructor.rmp_id, 'rmp_legacy_id', instructor.rmp_legacy_id, 'weighted_score', instructor.num_ratings::double precision * instructor.avg_rating::double precision)) FILTER (WHERE instructor.id IS NOT NULL), '[]'::json) AS instructors FROM section JOIN course ON course.id = section.course_id JOIN subject ON subject.id = section.subject_code JOIN college ON college.id = subject.college_id JOIN term ON term.id = section.term_id LEFT JOIN section_days ON section_days.section_id = section.id LEFT JOIN instructor_sections ON instructor_sections.section_id = section.id LEFT JOIN instructor ON instructor.id = instructor_sections.instructor_id GROUP BY section.crn, section.section, section.course_number, section.instruction_type, section.instruction_method, section.max_enroll, section.start_time, section.end_time, section.term_id, course.id, course.title, course.description, course.credits, course.restrictions, course.repeat_status, course.writing_intensive, subject.id, subject.name, college.id, college.name`);

export const corequisitesMView = pgMaterializedView("corequisites_m_view", {	courseId: uuid("course_id"),
	courseTitle: text("course_title"),
	courseSubjectId: text("course_subject_id"),
	courseNumber: text("course_number"),
	coreqId: uuid("coreq_id"),
	coreqTitle: text("coreq_title"),
	coreqSubjectId: text("coreq_subject_id"),
	coreqCourseNumber: text("coreq_course_number"),
}).with({"fillfactor":90}).as(sql`SELECT course_corequisites.course_id, course.title AS course_title, course.subject_id AS course_subject_id, course.course_number, coreq_course.id AS coreq_id, coreq_course.title AS coreq_title, coreq_course.subject_id AS coreq_subject_id, coreq_course.course_number AS coreq_course_number FROM course_corequisites JOIN course ON course.id = course_corequisites.course_id JOIN course coreq_course ON coreq_course.id = course_corequisites.corequisite_course_id`);

export const meiliProfessorsMIdx = pgMaterializedView("meili_professors_m_idx", {	id: integer(),
	name: text(),
	department: text(),
	avgRating: numeric("avg_rating", { precision: 3, scale:  1 }),
	avgDifficulty: numeric("avg_difficulty", { precision: 3, scale:  1 }),
	numRatings: integer("num_ratings"),
	rmpId: text("rmp_id"),
	rmpLegacyId: integer("rmp_legacy_id"),
	weightedScore: numeric("weighted_score"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalSectionsTaught: bigint("total_sections_taught", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalCoursesTaught: bigint("total_courses_taught", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalTermsActive: bigint("total_terms_active", { mode: "number" }),
	mostRecentTerm: integer("most_recent_term"),
	subjectsTaught: text("subjects_taught"),
	instructionMethods: text("instruction_methods"),
	coursesTaught: json("courses_taught"),
}).as(sql`SELECT instructor.id, instructor.name, instructor.department, instructor.avg_rating, instructor.avg_difficulty, instructor.num_ratings, instructor.rmp_id, instructor.rmp_legacy_id, instructor.num_ratings::numeric * instructor.avg_rating AS weighted_score, count(DISTINCT section.crn) AS total_sections_taught, count(DISTINCT course.id) AS total_courses_taught, count(DISTINCT section.term_id) AS total_terms_active, max(section.term_id) AS most_recent_term, array_agg(DISTINCT subject.id) AS subjects_taught, array_agg(DISTINCT section.instruction_method) AS instruction_methods, COALESCE(json_agg(DISTINCT jsonb_build_object('code', (subject.id || ' '::text) || section.course_number, 'title', course.title)) FILTER (WHERE course.id IS NOT NULL), '[]'::json) AS courses_taught FROM instructor LEFT JOIN instructor_sections ON instructor_sections.instructor_id = instructor.id LEFT JOIN section ON section.id = instructor_sections.section_id LEFT JOIN course ON course.id = section.course_id LEFT JOIN subject ON subject.id = section.subject_code GROUP BY instructor.id, instructor.name, instructor.department, instructor.avg_rating, instructor.avg_difficulty, instructor.num_ratings, instructor.rmp_id, instructor.rmp_legacy_id`);

export const prerequisitesMView = pgMaterializedView("prerequisites_m_view", {	courseId: uuid("course_id"),
	courseTitle: text("course_title"),
	courseSubjectId: text("course_subject_id"),
	courseNumber: text("course_number"),
	prereqId: uuid("prereq_id"),
	prereqTitle: text("prereq_title"),
	prereqSubjectId: text("prereq_subject_id"),
	prereqCourseNumber: text("prereq_course_number"),
	relationshipType: text("relationship_type"),
	groupId: text("group_id"),
	canTakeConcurrent: boolean("can_take_concurrent"),
	minimumGrade: text("minimum_grade"),
}).with({"fillfactor":90}).as(sql`SELECT course_prerequisites.course_id, course.title AS course_title, course.subject_id AS course_subject_id, course.course_number, prereq_course.id AS prereq_id, prereq_course.title AS prereq_title, prereq_course.subject_id AS prereq_subject_id, prereq_course.course_number AS prereq_course_number, course_prerequisites.relationship_type, course_prerequisites.group_id, course_prerequisites.can_take_concurrent, course_prerequisites.minimum_grade FROM course_prerequisites JOIN course ON course.id = course_prerequisites.course_id JOIN course prereq_course ON prereq_course.id = course_prerequisites.prerequisite_course_id`);