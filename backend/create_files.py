import os

files = ["User", "Student", "Instructor","Admin", "Faculty", "AttendanceAnalyticsRoutes.js",
         "Department", "Course", "Semester", "CourseAssignment",
         "StudentCourse", "CourseContent", "DocumentResources", "Assignment",
         "AssignmentSubmission", "Quiz", "QuizSubmission", "Exam", "ExamResult",
         "AttendanceSession", "AttendanceRecord", "GradeItem", "Grade", "GradeReport",
         "Notification", "Announcement", "Message", "MessageReply", "HelpDeskTicket", "TicketReply",
          "EventReminder", "CalendarEvent", "PerformanceAnalytics", "Timetable", "Qualification", "RegistrationRequest", "Batch"]

for file in files:
    # try:
    #     print(os.path.join(os.getcwd()+f"\\Models\\{file[0].lower()}{file[1:]}Route.js"))
    # except FileExistsError:
    #     pass
    try:
        path = os.path.join(os.getcwd()+f"\\services\\{file[0].lower()}{file[1:]}Service.js")
        if(os.path.exists(path)):
            pass
        with open(path, "x") as f:
            pass
    except FileExistsError:
        pass