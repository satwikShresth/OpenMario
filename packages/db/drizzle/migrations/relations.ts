import { relations } from "drizzle-orm/relations";
import { user, company, location, submission, position, subject, course, positionReview, jobPosting, account, section, term, college, session, courseCorequisites, instructor, instructorSections, instructorCourses, sectionDays, jobExperienceLevels, jobPostingMajor, major, minor, profileMinor, profileMajor, courseHistory, coursePrerequisites } from "./schema";

export const companyRelations = relations(company, ({one, many}) => ({
	user: one(user, {
		fields: [company.ownerId],
		references: [user.id]
	}),
	positions: many(position),
}));

export const userRelations = relations(user, ({many}) => ({
	companies: many(company),
	submissions: many(submission),
	positions: many(position),
	accounts: many(account),
	sessions: many(session),
	profileMinors: many(profileMinor),
	profileMajors: many(profileMajor),
}));

export const submissionRelations = relations(submission, ({one}) => ({
	location: one(location, {
		fields: [submission.locationId],
		references: [location.id]
	}),
	user: one(user, {
		fields: [submission.ownerId],
		references: [user.id]
	}),
	position: one(position, {
		fields: [submission.positionId],
		references: [position.id]
	}),
}));

export const locationRelations = relations(location, ({many}) => ({
	submissions: many(submission),
	jobPostings: many(jobPosting),
}));

export const positionRelations = relations(position, ({one, many}) => ({
	submissions: many(submission),
	positionReviews: many(positionReview),
	company: one(company, {
		fields: [position.companyId],
		references: [company.id]
	}),
	user: one(user, {
		fields: [position.ownerId],
		references: [user.id]
	}),
	jobPostings: many(jobPosting),
}));

export const courseRelations = relations(course, ({one, many}) => ({
	subject: one(subject, {
		fields: [course.subjectId],
		references: [subject.id]
	}),
	sections: many(section),
	courseCorequisites_corequisiteCourseId: many(courseCorequisites, {
		relationName: "courseCorequisites_corequisiteCourseId_course_id"
	}),
	courseCorequisites_courseId: many(courseCorequisites, {
		relationName: "courseCorequisites_courseId_course_id"
	}),
	instructorCourses: many(instructorCourses),
	courseHistories: many(courseHistory),
	coursePrerequisites_courseId: many(coursePrerequisites, {
		relationName: "coursePrerequisites_courseId_course_id"
	}),
	coursePrerequisites_prerequisiteCourseId: many(coursePrerequisites, {
		relationName: "coursePrerequisites_prerequisiteCourseId_course_id"
	}),
}));

export const subjectRelations = relations(subject, ({one, many}) => ({
	courses: many(course),
	sections: many(section),
	college: one(college, {
		fields: [subject.collegeId],
		references: [college.id]
	}),
}));

export const positionReviewRelations = relations(positionReview, ({one}) => ({
	position: one(position, {
		fields: [positionReview.positionId],
		references: [position.id]
	}),
}));

export const jobPostingRelations = relations(jobPosting, ({one, many}) => ({
	location: one(location, {
		fields: [jobPosting.locationId],
		references: [location.id]
	}),
	position: one(position, {
		fields: [jobPosting.positionId],
		references: [position.id]
	}),
	jobExperienceLevels: many(jobExperienceLevels),
	jobPostingMajors: many(jobPostingMajor),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const sectionRelations = relations(section, ({one, many}) => ({
	course: one(course, {
		fields: [section.courseId],
		references: [course.id]
	}),
	subject: one(subject, {
		fields: [section.subjectCode],
		references: [subject.id]
	}),
	term: one(term, {
		fields: [section.termId],
		references: [term.id]
	}),
	instructorSections: many(instructorSections),
	sectionDays: many(sectionDays),
}));

export const termRelations = relations(term, ({many}) => ({
	sections: many(section),
}));

export const collegeRelations = relations(college, ({many}) => ({
	subjects: many(subject),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const courseCorequisitesRelations = relations(courseCorequisites, ({one}) => ({
	course_corequisiteCourseId: one(course, {
		fields: [courseCorequisites.corequisiteCourseId],
		references: [course.id],
		relationName: "courseCorequisites_corequisiteCourseId_course_id"
	}),
	course_courseId: one(course, {
		fields: [courseCorequisites.courseId],
		references: [course.id],
		relationName: "courseCorequisites_courseId_course_id"
	}),
}));

export const instructorSectionsRelations = relations(instructorSections, ({one}) => ({
	instructor: one(instructor, {
		fields: [instructorSections.instructorId],
		references: [instructor.id]
	}),
	section: one(section, {
		fields: [instructorSections.sectionId],
		references: [section.id]
	}),
}));

export const instructorRelations = relations(instructor, ({many}) => ({
	instructorSections: many(instructorSections),
	instructorCourses: many(instructorCourses),
}));

export const instructorCoursesRelations = relations(instructorCourses, ({one}) => ({
	course: one(course, {
		fields: [instructorCourses.courseId],
		references: [course.id]
	}),
	instructor: one(instructor, {
		fields: [instructorCourses.instructorId],
		references: [instructor.id]
	}),
}));

export const sectionDaysRelations = relations(sectionDays, ({one}) => ({
	section: one(section, {
		fields: [sectionDays.sectionId],
		references: [section.id]
	}),
}));

export const jobExperienceLevelsRelations = relations(jobExperienceLevels, ({one}) => ({
	jobPosting: one(jobPosting, {
		fields: [jobExperienceLevels.jobPostingId],
		references: [jobPosting.id]
	}),
}));

export const jobPostingMajorRelations = relations(jobPostingMajor, ({one}) => ({
	jobPosting: one(jobPosting, {
		fields: [jobPostingMajor.jobPostingId],
		references: [jobPosting.id]
	}),
	major: one(major, {
		fields: [jobPostingMajor.majorId],
		references: [major.id]
	}),
}));

export const majorRelations = relations(major, ({many}) => ({
	jobPostingMajors: many(jobPostingMajor),
	profileMajors: many(profileMajor),
}));

export const profileMinorRelations = relations(profileMinor, ({one}) => ({
	minor: one(minor, {
		fields: [profileMinor.minorId],
		references: [minor.id]
	}),
	user: one(user, {
		fields: [profileMinor.userId],
		references: [user.id]
	}),
}));

export const minorRelations = relations(minor, ({many}) => ({
	profileMinors: many(profileMinor),
}));

export const profileMajorRelations = relations(profileMajor, ({one}) => ({
	major: one(major, {
		fields: [profileMajor.majorId],
		references: [major.id]
	}),
	user: one(user, {
		fields: [profileMajor.userId],
		references: [user.id]
	}),
}));

export const courseHistoryRelations = relations(courseHistory, ({one}) => ({
	course: one(course, {
		fields: [courseHistory.courseId],
		references: [course.id]
	}),
}));

export const coursePrerequisitesRelations = relations(coursePrerequisites, ({one}) => ({
	course_courseId: one(course, {
		fields: [coursePrerequisites.courseId],
		references: [course.id],
		relationName: "coursePrerequisites_courseId_course_id"
	}),
	course_prerequisiteCourseId: one(course, {
		fields: [coursePrerequisites.prerequisiteCourseId],
		references: [course.id],
		relationName: "coursePrerequisites_prerequisiteCourseId_course_id"
	}),
}));