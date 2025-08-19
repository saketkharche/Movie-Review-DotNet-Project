# ePathshala Class Diagram - Part 1: Core Entities & Controllers

  

## Core Entity Classes

  

```mermaid

classDiagram

    %% Base User Entity

    class User {

        +Long id

        +String email

        +String password

        +String firstName

        +String lastName

        +Role role

        +String phoneNumber

        +LocalDateTime createdAt

        +LocalDateTime updatedAt

        +boolean isActive

        +authenticate(password)

        +updateProfile(profileData)

        +deactivate()

    }

  

    %% Role Enum

    class Role {

        <<enumeration>>

        ADMIN

        TEACHER

        STUDENT

        PARENT

    }

  

    %% Student Entity

    class Student {

        +Long id

        +User user

        +String rollNumber

        +String className

        +String section

        +Parent parent

        +LocalDate dateOfBirth

        +String address

        +String emergencyContact

        +getAttendance()

        +getGrades()

        +getAssignments()

        +submitAssignment(assignmentId, file)

        +requestLeave(leaveRequest)

    }

  

    %% Teacher Entity

    class Teacher {

        +Long id

        +User user

        +String employeeId

        +String qualification

        +String specialization

        +String department

        +LocalDate joiningDate

        +String experience

        +markAttendance(studentId, date, status)

        +addGrade(studentId, subject, grade)

        +createAssignment(assignmentData)

        +approveLeaveRequest(requestId, status)

        +createExam(examData)

    }

  

    %% Parent Entity

    class Parent {

        +Long id

        +User user

        +String relationship

        +String occupation

        +String address

        +List~Student~ children

        +getChildProgress(studentId)

        +getChildAttendance(studentId)

        +approveLeaveRequest(requestId)

        +getNotifications()

    }

  

    %% Academic Entities

    class Attendance {

        +Long id

        +Student student

        +Teacher teacher

        +LocalDate date

        +AttendanceStatus status

        +String remarks

        +LocalDateTime markedAt

        +markAttendance(status, remarks)

        +updateAttendance(status, remarks)

    }

  

    class AttendanceStatus {

        <<enumeration>>

        PRESENT

        ABSENT

        LATE

        HALF_DAY

    }

  

    class Grade {

        +Long id

        +Student student

        +Teacher teacher

        +String subject

        +Double marks

        +String grade

        +String remarks

        +LocalDate examDate

        +LocalDateTime createdAt

        +calculateGrade()

        +updateGrade(newMarks)

    }

  

    class Assignment {

        +Long id

        +Teacher teacher

        +String title

        +String description

        +String subject

        +String className

        +LocalDateTime dueDate

        +String fileUrl

        +AssignmentStatus status

        +LocalDateTime createdAt

        +createAssignment(data)

        +updateAssignment(data)

        +deleteAssignment()

        +getSubmissions()

    }

  

    class AssignmentStatus {

        <<enumeration>>

        DRAFT

        PUBLISHED

        CLOSED

    }

  

    class AssignmentSubmission {

        +Long id

        +Assignment assignment

        +Student student

        +String fileUrl

        +LocalDateTime submittedAt

        +SubmissionStatus status

        +String remarks

        +Double score

        +submitAssignment(file)

        +updateSubmission(file)

        +gradeSubmission(score, remarks)

    }

  

    class SubmissionStatus {

        <<enumeration>>

        SUBMITTED

        LATE

        GRADED

        OVERDUE

    }

  

    %% Leave Management

    class LeaveRequest {

        +Long id

        +Student student

        +Teacher teacher

        +Parent parent

        +LocalDate startDate

        +LocalDate endDate

        +String reason

        +LeaveType type

        +RequestStatus status

        +String remarks

        +LocalDateTime createdAt

        +submitRequest()

        +approveRequest(remarks)

        +rejectRequest(remarks)

    }

  

    class LeaveType {

        <<enumeration>>

        SICK_LEAVE

        CASUAL_LEAVE

        EMERGENCY_LEAVE

        OTHER

    }

  

    class RequestStatus {

        <<enumeration>>

        PENDING

        APPROVED

        REJECTED

        CANCELLED

    }

  

    %% Relationships

    User ||--o{ Student : "has"

    User ||--o{ Teacher : "has"

    User ||--o{ Parent : "has"

    Student ||--o{ Attendance : "tracks"

    Student ||--o{ Grade : "receives"

    Student ||--o{ AssignmentSubmission : "submits"

    Student ||--o{ LeaveRequest : "requests"

    Teacher ||--o{ Attendance : "marks"

    Teacher ||--o{ Grade : "assigns"

    Teacher ||--o{ Assignment : "creates"

    Teacher ||--o{ LeaveRequest : "approves"

    Parent ||--o{ Student : "monitors"

    Parent ||--o{ LeaveRequest : "approves"

    Assignment ||--o{ AssignmentSubmission : "receives"

```

  

## Controller Classes

  

```mermaid

classDiagram

    %% Base Controller

    class BaseController {

        +ResponseEntity~T~ success(T data)

        +ResponseEntity~T~ error(String message)

        +ResponseEntity~T~ notFound(String message)

        +ResponseEntity~T~ unauthorized(String message)

        +ResponseEntity~T~ forbidden(String message)

    }

  

    %% Authentication Controller

    class AuthController {

        +AuthService authService

        +ResponseEntity~LoginResponse~ login(LoginRequest request)

        +ResponseEntity~String~ forgotPassword(ForgotPasswordRequest request)

        +ResponseEntity~String~ verifyOtp(VerifyOtpRequest request)

        +ResponseEntity~String~ resetPassword(ResetPasswordRequest request)

        +ResponseEntity~String~ logout()

        +ResponseEntity~User~ getCurrentUser()

    }

  

    %% Teacher Controller

    class TeacherController {

        +TeacherService teacherService

        +ResponseEntity~TeacherDashboardDTO~ getDashboard()

        +ResponseEntity~List~Attendance~~ getAttendanceByDate(LocalDate date)

        +ResponseEntity~Attendance~ markAttendance(AttendanceDTO dto)

        +ResponseEntity~List~Grade~~ getGradesByStudent(Long studentId)

        +ResponseEntity~Grade~ addGrade(GradeDTO dto)

        +ResponseEntity~List~Assignment~~ getAssignments()

        +ResponseEntity~Assignment~ createAssignment(AssignmentDTO dto)

        +ResponseEntity~Assignment~ updateAssignment(Long id, AssignmentDTO dto)

        +ResponseEntity~String~ deleteAssignment(Long id)

        +ResponseEntity~List~LeaveRequest~~ getLeaveRequests()

        +ResponseEntity~LeaveRequest~ approveLeaveRequest(Long id, LeaveApprovalDTO dto)

    }

  

    %% Student Controller

    class StudentController {

        +StudentService studentService

        +ResponseEntity~StudentDashboardDTO~ getDashboard()

        +ResponseEntity~List~Assignment~~ getAssignments()

        +ResponseEntity~AssignmentSubmission~ submitAssignment(Long id, MultipartFile file)

        +ResponseEntity~List~Grade~~ getGrades()

        +ResponseEntity~List~Attendance~~ getAttendance()

        +ResponseEntity~LeaveRequest~ submitLeaveRequest(LeaveRequestDTO dto)

        +ResponseEntity~List~LeaveRequest~~ getLeaveRequests()

        +ResponseEntity~List~Exam~~ getAvailableExams()

        +ResponseEntity~ExamAttempt~ startExam(Long examId)

        +ResponseEntity~ExamResult~ submitExam(Long examId, ExamSubmissionDTO dto)

    }

  

    %% Parent Controller

    class ParentController {

        +ParentService parentService

        +ResponseEntity~ParentDashboardDTO~ getDashboard()

        +ResponseEntity~List~Student~~ getChildren()

        +ResponseEntity~ChildProgressDTO~ getChildProgress(Long studentId)

        +ResponseEntity~List~Attendance~~ getChildAttendance(Long studentId)

        +ResponseEntity~List~Grade~~ getChildGrades(Long studentId)

        +ResponseEntity~List~LeaveRequest~~ getChildLeaveRequests(Long studentId)

        +ResponseEntity~LeaveRequest~ approveLeaveRequest(Long id, LeaveApprovalDTO dto)

        +ResponseEntity~List~Notification~~ getNotifications()

    }

  

    %% Admin Controller

    class AdminController {

        +AdminService adminService

        +ResponseEntity~AdminDashboardDTO~ getDashboard()

        +ResponseEntity~List~User~~ getAllUsers()

        +ResponseEntity~User~ createUser(CreateUserDTO dto)

        +ResponseEntity~User~ updateUser(Long id, UpdateUserDTO dto)

        +ResponseEntity~String~ deleteUser(Long id)

        +ResponseEntity~List~Student~~ getAllStudents()

        +ResponseEntity~List~Teacher~~ getAllTeachers()

        +ResponseEntity~List~Parent~~ getAllParents()

        +ResponseEntity~Student~ assignTeacherToStudent(Long studentId, Long teacherId)

        +ResponseEntity~AcademicCalendar~ createCalendarEvent(AcademicCalendarDTO dto)

        +ResponseEntity~List~AcademicCalendar~~ getCalendarEvents()

    }

  

    %% Chat Controller

    class ChatController {

        +ChatService chatService

        +ResponseEntity~List~ChatMessage~~ getMessages(Long userId)

        +ResponseEntity~ChatMessage~ sendMessage(ChatMessageDTO dto)

        +ResponseEntity~List~User~~ getChatUsers()

        +ResponseEntity~List~ChatRoom~~ getChatRooms()

        +ResponseEntity~ChatRoom~ createChatRoom(ChatRoomDTO dto)

        +ResponseEntity~String~ deleteMessage(Long messageId)

    }

  

    %% Exam Controller

    class FacultyExamController {

        +ExamService examService

        +ResponseEntity~List~Exam~~ getExams()

        +ResponseEntity~Exam~ createExam(ExamDTO dto)

        +ResponseEntity~Exam~ updateExam(Long id, ExamDTO dto)

        +ResponseEntity~String~ deleteExam(Long id)

        +ResponseEntity~List~ExamQuestion~~ getExamQuestions(Long examId)

        +ResponseEntity~ExamQuestion~ addQuestion(Long examId, ExamQuestionDTO dto)

        +ResponseEntity~ExamQuestion~ updateQuestion(Long questionId, ExamQuestionDTO dto)

        +ResponseEntity~String~ deleteQuestion(Long questionId)

        +ResponseEntity~List~ExamResult~~ getExamResults(Long examId)

    }

  

    class StudentExamController {

        +ExamService examService

        +ResponseEntity~List~Exam~~ getAvailableExams()

        +ResponseEntity~Exam~ getExamDetails(Long examId)

        +ResponseEntity~ExamAttempt~ startExam(Long examId)

        +ResponseEntity~ExamResult~ submitExam(Long examId, ExamSubmissionDTO dto)

        +ResponseEntity~List~ExamResult~~ getMyExamResults()

        +ResponseEntity~ExamResult~ getExamResult(Long examId)

    }

  

    %% File Controller

    class FileController {

        +FileService fileService

        +ResponseEntity~String~ uploadFile(MultipartFile file)

        +ResponseEntity~Resource~ downloadFile(String fileName)

        +ResponseEntity~String~ deleteFile(String fileName)

        +ResponseEntity~List~String~~ getUploadedFiles()

    }

  

    %% Inheritance

    BaseController <|-- AuthController

    BaseController <|-- TeacherController

    BaseController <|-- StudentController

    BaseController <|-- ParentController

    BaseController <|-- AdminController

    BaseController <|-- ChatController

    BaseController <|-- FacultyExamController

    BaseController <|-- StudentExamController

    BaseController <|-- FileController

```
# ePathshala Class Diagram - Part 2: Services, Repositories & Frontend

  

## Service Layer Classes

  

```mermaid

classDiagram

    %% Base Service Interface

    class BaseService {

        <<interface>>

        +T findById(Long id)

        +List~T~ findAll()

        +T save(T entity)

        +T update(Long id, T entity)

        +void delete(Long id)

        +boolean existsById(Long id)

    }

  

    %% Authentication Service

    class AuthService {

        +UserRepository userRepository

        +JwtUtil jwtUtil

        +PasswordUtility passwordUtility

        +LoginResponse authenticateUser(LoginRequest request)

        +String generateOtp(String email)

        +boolean verifyOtp(String email, String otp)

        +String resetPassword(ResetPasswordRequest request)

        +User getCurrentUser()

        +String generateToken(User user)

        +boolean validateToken(String token)

        +void logout(String token)

    }

  

    %% Teacher Service

    class TeacherService {

        +TeacherRepository teacherRepository

        +AttendanceRepository attendanceRepository

        +GradeRepository gradeRepository

        +AssignmentRepository assignmentRepository

        +LeaveRequestRepository leaveRequestRepository

        +TeacherDashboardDTO getDashboard(Long teacherId)

        +Attendance markAttendance(AttendanceDTO dto)

        +Grade addGrade(GradeDTO dto)

        +Assignment createAssignment(AssignmentDTO dto)

        +Assignment updateAssignment(Long id, AssignmentDTO dto)

        +void deleteAssignment(Long id)

        +LeaveRequest approveLeaveRequest(Long id, LeaveApprovalDTO dto)

        +List~Attendance~~ getAttendanceByDate(LocalDate date)

        +List~Grade~~ getGradesByStudent(Long studentId)

        +List~Assignment~~ getAssignments(Long teacherId)

        +List~LeaveRequest~~ getLeaveRequests(Long teacherId)

    }

  

    %% Student Service

    class StudentService {

        +StudentRepository studentRepository

        +AssignmentRepository assignmentRepository

        +GradeRepository gradeRepository

        +AttendanceRepository attendanceRepository

        +LeaveRequestRepository leaveRequestRepository

        +ExamRepository examRepository

        +StudentDashboardDTO getDashboard(Long studentId)

        +List~Assignment~~ getAssignments(Long studentId)

        +AssignmentSubmission submitAssignment(Long assignmentId, MultipartFile file)

        +List~Grade~~ getGrades(Long studentId)

        +List~Attendance~~ getAttendance(Long studentId)

        +LeaveRequest submitLeaveRequest(LeaveRequestDTO dto)

        +List~LeaveRequest~~ getLeaveRequests(Long studentId)

        +List~Exam~~ getAvailableExams(Long studentId)

        +ExamAttempt startExam(Long examId, Long studentId)

        +ExamResult submitExam(Long examId, ExamSubmissionDTO dto)

    }

  

    %% Parent Service

    class ParentService {

        +ParentRepository parentRepository

        +StudentRepository studentRepository

        +GradeRepository gradeRepository

        +AttendanceRepository attendanceRepository

        +LeaveRequestRepository leaveRequestRepository

        +NotificationRepository notificationRepository

        +ParentDashboardDTO getDashboard(Long parentId)

        +List~Student~~ getChildren(Long parentId)

        +ChildProgressDTO getChildProgress(Long studentId)

        +List~Attendance~~ getChildAttendance(Long studentId)

        +List~Grade~~ getChildGrades(Long studentId)

        +List~LeaveRequest~~ getChildLeaveRequests(Long studentId)

        +LeaveRequest approveLeaveRequest(Long id, LeaveApprovalDTO dto)

        +List~Notification~~ getNotifications(Long parentId)

    }

  

    %% Admin Service

    class AdminService {

        +UserRepository userRepository

        +StudentRepository studentRepository

        +TeacherRepository teacherRepository

        +ParentRepository parentRepository

        +AcademicCalendarRepository calendarRepository

        +AdminDashboardDTO getDashboard()

        +User createUser(CreateUserDTO dto)

        +User updateUser(Long id, UpdateUserDTO dto)

        +void deleteUser(Long id)

        +List~User~~ getAllUsers()

        +List~Student~~ getAllStudents()

        +List~Teacher~~ getAllTeachers()

        +List~Parent~~ getAllParents()

        +Student assignTeacherToStudent(Long studentId, Long teacherId)

        +AcademicCalendar createCalendarEvent(AcademicCalendarDTO dto)

        +List~AcademicCalendar~~ getCalendarEvents()

    }

  

    %% Chat Service

    class ChatService {

        +ChatMessageRepository chatMessageRepository

        +ChatRoomRepository chatRoomRepository

        +UserRepository userRepository

        +WebSocketService webSocketService

        +List~ChatMessage~~ getMessages(Long userId)

        +ChatMessage sendMessage(ChatMessageDTO dto)

        +List~User~~ getChatUsers(Long currentUserId)

        +List~ChatRoom~~ getChatRooms(Long userId)

        +ChatRoom createChatRoom(ChatRoomDTO dto)

        +void deleteMessage(Long messageId)

        +void broadcastMessage(ChatMessage message)

    }

  

    %% Exam Service

    class ExamService {

        +ExamRepository examRepository

        +ExamQuestionRepository questionRepository

        +ExamAttemptRepository attemptRepository

        +ExamResultRepository resultRepository

        +List~Exam~~ getExams(Long teacherId)

        +Exam createExam(ExamDTO dto)

        +Exam updateExam(Long id, ExamDTO dto)

        +void deleteExam(Long id)

        +List~ExamQuestion~~ getExamQuestions(Long examId)

        +ExamQuestion addQuestion(Long examId, ExamQuestionDTO dto)

        +ExamQuestion updateQuestion(Long questionId, ExamQuestionDTO dto)

        +void deleteQuestion(Long questionId)

        +List~Exam~~ getAvailableExams(Long studentId)

        +ExamAttempt startExam(Long examId, Long studentId)

        +ExamResult submitExam(Long examId, ExamSubmissionDTO dto)

        +List~ExamResult~~ getExamResults(Long examId)

        +ExamResult gradeExam(Long attemptId)

    }

  

    %% File Service

    class FileService {

        +String uploadDirectory

        +String uploadFile(MultipartFile file)

        +Resource downloadFile(String fileName)

        +void deleteFile(String fileName)

        +List~String~~ getUploadedFiles()

        +String generateFileName(String originalName)

        +boolean isValidFileType(String fileName)

        +long getFileSize(String fileName)

    }

  

    %% Notification Service

    class NotificationService {

        +NotificationRepository notificationRepository

        +EmailService emailService

        +WebSocketService webSocketService

        +void sendNotification(NotificationDTO dto)

        +void sendEmailNotification(String email, String subject, String message)

        +void sendRealTimeNotification(Long userId, String message)

        +List~Notification~~ getUserNotifications(Long userId)

        +void markAsRead(Long notificationId)

        +void deleteNotification(Long notificationId)

    }

  

    %% Inheritance

    BaseService <|.. AuthService

    BaseService <|.. TeacherService

    BaseService <|.. StudentService

    BaseService <|.. ParentService

    BaseService <|.. AdminService

    BaseService <|.. ChatService

    BaseService <|.. ExamService

    BaseService <|.. FileService

    BaseService <|.. NotificationService

```

  

## Repository Layer Classes

  

```mermaid

classDiagram

    %% Base Repository

    class JpaRepository~T, ID~ {

        <<interface>>

        +T save(T entity)

        +Optional~T~ findById(ID id)

        +List~T~ findAll()

        +void deleteById(ID id)

        +boolean existsById(ID id)

        +long count()

    }

  

    %% User Repository

    class UserRepository {

        +Optional~User~ findByEmail(String email)

        +List~User~ findByRole(Role role)

        +List~User~ findByIsActive(boolean isActive)

        +Optional~User~ findByEmailAndIsActive(String email, boolean isActive)

        +List~User~ findByCreatedAtBetween(LocalDateTime start, LocalDateTime end)

    }

  

    %% Student Repository

    class StudentRepository {

        +List~Student~ findByClassName(String className)

        +List~Student~ findByParentId(Long parentId)

        +Optional~Student~ findByRollNumber(String rollNumber)

        +List~Student~ findByClassNameAndSection(String className, String section)

        +List~Student~ findByDateOfBirthBetween(LocalDate start, LocalDate end)

    }

  

    %% Teacher Repository

    class TeacherRepository {

        +List~Teacher~ findByDepartment(String department)

        +List~Teacher~ findBySpecialization(String specialization)

        +Optional~Teacher~ findByEmployeeId(String employeeId)

        +List~Teacher~ findByJoiningDateAfter(LocalDate date)

        +List~Teacher~ findByExperienceGreaterThan(String experience)

    }

  

    %% Attendance Repository

    class AttendanceRepository {

        +List~Attendance~ findByStudentId(Long studentId)

        +List~Attendance~ findByTeacherId(Long teacherId)

        +Optional~Attendance~ findByStudentIdAndDate(Long studentId, LocalDate date)

        +List~Attendance~ findByDate(LocalDate date)

        +List~Attendance~ findByStudentIdAndDateBetween(Long studentId, LocalDate start, LocalDate end)

        +long countByStudentIdAndStatus(Long studentId, AttendanceStatus status)

    }

  

    %% Grade Repository

    class GradeRepository {

        +List~Grade~ findByStudentId(Long studentId)

        +List~Grade~ findByTeacherId(Long teacherId)

        +List~Grade~ findBySubject(String subject)

        +List~Grade~ findByStudentIdAndSubject(Long studentId, String subject)

        +Double getAverageGradeByStudent(Long studentId)

        +List~Grade~ findByExamDateBetween(LocalDate start, LocalDate end)

    }

  

    %% Assignment Repository

    class AssignmentRepository {

        +List~Assignment~ findByTeacherId(Long teacherId)

        +List~Assignment~ findBySubject(String subject)

        +List~Assignment~ findByClassName(String className)

        +List~Assignment~ findByDueDateBefore(LocalDateTime date)

        +List~Assignment~ findByStatus(AssignmentStatus status)

        +List~Assignment~ findByTeacherIdAndStatus(Long teacherId, AssignmentStatus status)

    }

  

    %% Exam Repository

    class ExamRepository {

        +List~Exam~ findByTeacherId(Long teacherId)

        +List~Exam~ findBySubject(String subject)

        +List~Exam~ findByStartDateAfter(LocalDateTime date)

        +List~Exam~ findByStatus(ExamStatus status)

        +Optional~Exam~ findByTitle(String title)

        +List~Exam~ findByDurationLessThan(int duration)

    }

  

    %% Chat Repository

    class ChatMessageRepository {

        +List~ChatMessage~ findBySenderId(Long senderId)

        +List~ChatMessage~ findByReceiverId(Long receiverId)

        +List~ChatMessage~ findByChatRoomId(Long chatRoomId)

        +List~ChatMessage~ findBySenderIdAndReceiverId(Long senderId, Long receiverId)

        +List~ChatMessage~ findBySentAtBetween(LocalDateTime start, LocalDateTime end)

    }

  

    %% Inheritance

    JpaRepository <|-- UserRepository

    JpaRepository <|-- StudentRepository

    JpaRepository <|-- TeacherRepository

    JpaRepository <|-- AttendanceRepository

    JpaRepository <|-- GradeRepository

    JpaRepository <|-- AssignmentRepository

    JpaRepository <|-- ExamRepository

    JpaRepository <|-- ChatMessageRepository

```

  

## DTO Classes

  

```mermaid

classDiagram

    %% Authentication DTOs

    class LoginRequest {

        +String email

        +String password

        +Role role

    }

  

    class LoginResponse {

        +String token

        +User user

        +String message

    }

  

    class ForgotPasswordRequest {

        +String email

    }

  

    class ResetPasswordRequest {

        +String email

        +String otp

        +String newPassword

    }

  

    %% Dashboard DTOs

    class TeacherDashboardDTO {

        +Long teacherId

        +String teacherName

        +List~Attendance~~ recentAttendance

        +List~Assignment~~ recentAssignments

        +List~LeaveRequest~~ pendingLeaveRequests

        +Map~String, Integer~~ attendanceStats

        +Map~String, Double~~ gradeStats

    }

  

    class StudentDashboardDTO {

        +Long studentId

        +String studentName

        +List~Assignment~~ pendingAssignments

        +List~Grade~~ recentGrades

        +List~Attendance~~ recentAttendance

        +List~Exam~~ upcomingExams

        +Map~String, Double~~ subjectAverages

    }

  

    class ParentDashboardDTO {

        +Long parentId

        +String parentName

        +List~Student~~ children

        +Map~Long, ChildProgressDTO~~ childProgress

        +List~Notification~~ recentNotifications

        +List~LeaveRequest~~ pendingApprovals

    }

  

    class AdminDashboardDTO {

        +Long totalStudents

        +Long totalTeachers

        +Long totalParents

        +Map~String, Integer~~ userStats

        +List~AcademicCalendar~~ upcomingEvents

        +Map~String, Integer~~ systemStats

    }

  

    %% Academic DTOs

    class AttendanceDTO {

        +Long studentId

        +Long teacherId

        +LocalDate date

        +AttendanceStatus status

        +String remarks

    }

  

    class GradeDTO {

        +Long studentId

        +Long teacherId

        +String subject

        +Double marks

        +String remarks

        +LocalDate examDate

    }

  

    class AssignmentDTO {

        +Long teacherId

        +String title

        +String description

        +String subject

        +String className

        +LocalDateTime dueDate

        +MultipartFile file

    }

  

    class LeaveRequestDTO {

        +Long studentId

        +LocalDate startDate

        +LocalDate endDate

        +String reason

        +LeaveType type

    }

  

    %% Exam DTOs

    class ExamDTO {

        +Long teacherId

        +String title

        +String description

        +String subject

        +LocalDateTime startTime

        +LocalDateTime endTime

        +int duration

        +int totalMarks

        +ExamStatus status

    }

  

    class ExamQuestionDTO {

        +String question

        +String optionA

        +String optionB

        +String optionC

        +String optionD

        +String correctAnswer

        +int marks

        +QuestionType type

    }

  

    class ExamSubmissionDTO {

        +Long examId

        +Long studentId

        +List~ExamAnswerDTO~~ answers

        +LocalDateTime submittedAt

    }

  

    %% Chat DTOs

    class ChatMessageDTO {

        +Long senderId

        +Long receiverId

        +String message

        +MessageType type

        +String fileUrl

    }

  

    class ChatRoomDTO {

        +String name

        +List~Long~ participantIds

        +ChatRoomType type

    }

```

  

## Frontend Component Classes

  

```mermaid

classDiagram

    %% Base Components

    class BaseComponent {

        +state

        +props

        +componentDidMount()

        +componentDidUpdate()

        +componentWillUnmount()

        +render()

        +setState()

    }

  

    %% Layout Components

    class DashboardLayout {

        +Sidebar sidebar

        +Navbar navbar

        +Content content

        +Footer footer

        +handleSidebarToggle()

        +handleLogout()

        +render()

    }

  

    class Sidebar {

        +List~MenuItem~ menuItems

        +boolean isCollapsed

        +handleMenuClick()

        +toggleCollapse()

        +render()

    }

  

    class Navbar {

        +User user

        +List~Notification~ notifications

        +handleProfileClick()

        +handleNotificationClick()

        +handleLogout()

        +render()

    }

  

    %% Authentication Components

    class LoginPage {

        +LoginForm form

        +boolean isLoading

        +String error

        +handleSubmit()

        +handleForgotPassword()

        +render()

    }

  

    class LoginForm {

        +String email

        +String password

        +Role role

        +boolean showPassword

        +handleInputChange()

        +handleSubmit()

        +togglePasswordVisibility()

        +render()

    }

  

    %% Dashboard Components

    class TeacherDashboard {

        +TeacherOverview overview

        +List~Component~ sections

        +handleSectionClick()

        +loadDashboardData()

        +render()

    }

  

    class StudentDashboard {

        +StudentOverview overview

        +List~Component~ sections

        +handleSectionClick()

        +loadDashboardData()

        +render()

    }

  

    class ParentDashboard {

        +ParentOverview overview

        +List~Component~ sections

        +handleSectionClick()

        +loadDashboardData()

        +render()

    }

  

    %% Feature Components

    class AssignmentManager {

        +List~Assignment~ assignments

        +AssignmentForm form

        +handleCreateAssignment()

        +handleEditAssignment()

        +handleDeleteAssignment()

        +render()

    }

  

    class ExamInterface {

        +Exam exam

        +List~Question~ questions

        +Map~Long, String~ answers

        +Timer timer

        +handleAnswerChange()

        +handleSubmit()

        +render()

    }

  

    class ChatInterface {

        +List~Message~ messages

        +List~User~ users

        +WebSocket connection

        +handleSendMessage()

        +handleUserSelect()

        +render()

    }

  

    %% Utility Components

    class LoadingSpinner {

        +String size

        +String color

        +render()

    }

  

    class ErrorMessage {

        +String message

        +String type

        +handleRetry()

        +render()

    }

  

    class NotificationToast {

        +String message

        +String type

        +int duration

        +handleClose()

        +render()

    }

  

    %% Inheritance

    BaseComponent <|-- DashboardLayout

    BaseComponent <|-- Sidebar

    BaseComponent <|-- Navbar

    BaseComponent <|-- LoginPage

    BaseComponent <|-- LoginForm

    BaseComponent <|-- TeacherDashboard

    BaseComponent <|-- StudentDashboard

    BaseComponent <|-- ParentDashboard

    BaseComponent <|-- AssignmentManager

    BaseComponent <|-- ExamInterface

    BaseComponent <|-- ChatInterface

    BaseComponent <|-- LoadingSpinner

    BaseComponent <|-- ErrorMessage

    BaseComponent <|-- NotificationToast

```

  

## Configuration & Utility Classes

  

```mermaid

classDiagram

    %% Configuration Classes

    class SecurityConfig {

        +PasswordEncoder passwordEncoder()

        +SecurityFilterChain filterChain()

        +CorsConfiguration corsConfiguration()

        +configure(HttpSecurity http)

    }

  

    class WebSocketConfig {

        +MessageBrokerRegistry configureMessageBroker()

        +void registerStompEndpoints(StompEndpointRegistry registry)

    }

  

    class SwaggerConfig {

        +OpenAPI customOpenAPI()

        +GroupedOpenApi publicApi()

    }

  

    %% Utility Classes

    class JwtUtil {

        +String secret

        +long expiration

        +String generateToken(User user)

        +String getUsernameFromToken(String token)

        +Date getExpirationDateFromToken(String token)

        +boolean validateToken(String token)

    }

  

    class PasswordUtility {

        +String hashPassword(String password)

        +boolean verifyPassword(String password, String hash)

        +String generateRandomPassword()

        +boolean isStrongPassword(String password)

    }

  

    class FileUtility {

        +String saveFile(MultipartFile file, String directory)

        +Resource loadFile(String fileName, String directory)

        +void deleteFile(String fileName, String directory)

        +boolean isValidFileType(String fileName)

        +String getFileExtension(String fileName)

    }

  

    class EmailUtility {

        +JavaMailSender mailSender

        +void sendEmail(String to, String subject, String content)

        +void sendHtmlEmail(String to, String subject, String htmlContent)

        +String generateOtp()

        +void sendOtpEmail(String email, String otp)

    }

  

    %% Interceptor Classes

    class JwtFilter {

        +JwtUtil jwtUtil

        +CustomUserDetailsService userDetailsService

        +doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)

        +String getJwtFromRequest(HttpServletRequest request)

    }

  

    class SessionInterceptor {

        +void preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)

        +void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView)

        +void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)

    }

  

    class WebSocketInterceptor {

        +boolean preSend(Message~?~ message, MessageChannel channel, MessageSendingOperations~?~ messagingTemplate)

        +void afterMessageHandled(Message~?~ message, MessageChannel channel, MessageSendingOperations~?~ messagingTemplate, boolean exception)

    }

```

  

This comprehensive class diagram in two parts provides a complete view of the ePathshala system architecture, including:

  

**Part 1:**

- Core entities and their relationships

- Controller layer with all REST endpoints

- Authentication and authorization flow

  

**Part 2:**

- Service layer with business logic

- Repository layer for data access

- DTOs for data transfer

- Frontend React components

- Configuration and utility classes

  

The diagrams show the complete object-oriented design of the system, making it easy to understand the relationships between different components and how they interact with each other.