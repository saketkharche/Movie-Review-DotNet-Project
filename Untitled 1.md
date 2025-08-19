# ePathshala Simple Class Diagram

  

## Core Entities

  

```mermaid

classDiagram

    class User {

        +Long id

        +String email

        +String password

        +String firstName

        +String lastName

        +Role role

        +authenticate(password)

        +updateProfile(profileData)

    }

  

    class Student {

        +Long id

        +User user

        +String rollNumber

        +String className

        +getAttendance()

        +getGrades()

    }

  

    class Teacher {

        +Long id

        +User user

        +String employeeId

        +String qualification

        +markAttendance(studentId, date, status)

        +addGrade(studentId, subject, grade)

    }

  

    class Parent {

        +Long id

        +User user

        +String relationship

        +getChildProgress(studentId)

    }

  

    class Attendance {

        +Long id

        +Student student

        +Teacher teacher

        +LocalDate date

        +AttendanceStatus status

    }

  

    class Grade {

        +Long id

        +Student student

        +Teacher teacher

        +String subject

        +Double marks

        +calculateGrade()

    }

  

    class Assignment {

        +Long id

        +Teacher teacher

        +String title

        +String description

        +LocalDateTime dueDate

    }

  

    User ||--o{ Student : "has"

    User ||--o{ Teacher : "has"

    User ||--o{ Parent : "has"

    Student ||--o{ Attendance : "tracks"

    Student ||--o{ Grade : "receives"

    Teacher ||--o{ Attendance : "marks"

    Teacher ||--o{ Grade : "assigns"

    Teacher ||--o{ Assignment : "creates"

```

  

## Controllers

  

```mermaid

classDiagram

    class BaseController {

        +ResponseEntity~T~ success(T data)

        +ResponseEntity~T~ error(String message)

    }

  

    class AuthController {

        +AuthService authService

        +ResponseEntity~LoginResponse~ login(LoginRequest request)

        +ResponseEntity~String~ logout()

    }

  

    class TeacherController {

        +TeacherService teacherService

        +ResponseEntity~TeacherDashboardDTO~ getDashboard()

        +ResponseEntity~Attendance~ markAttendance(AttendanceDTO dto)

    }

  

    class StudentController {

        +StudentService studentService

        +ResponseEntity~StudentDashboardDTO~ getDashboard()

        +ResponseEntity~List~Assignment~~ getAssignments()

    }

  

    class ParentController {

        +ParentService parentService

        +ResponseEntity~ParentDashboardDTO~ getDashboard()

        +ResponseEntity~List~Student~~ getChildren()

    }

  

    BaseController <|-- AuthController

    BaseController <|-- TeacherController

    BaseController <|-- StudentController

    BaseController <|-- ParentController

```

  

## Services

  

```mermaid

classDiagram

    class BaseService {

        <<interface>>

        +T findById(Long id)

        +List~T~ findAll()

        +T save(T entity)

    }

  

    class AuthService {

        +UserRepository userRepository

        +JwtUtil jwtUtil

        +LoginResponse authenticateUser(LoginRequest request)

        +String generateToken(User user)

    }

  

    class TeacherService {

        +TeacherRepository teacherRepository

        +AttendanceRepository attendanceRepository

        +TeacherDashboardDTO getDashboard(Long teacherId)

        +Attendance markAttendance(AttendanceDTO dto)

    }

  

    class StudentService {

        +StudentRepository studentRepository

        +AssignmentRepository assignmentRepository

        +StudentDashboardDTO getDashboard(Long studentId)

        +List~Assignment~~ getAssignments(Long studentId)

    }

  

    BaseService <|.. AuthService

    BaseService <|.. TeacherService

    BaseService <|.. StudentService

```