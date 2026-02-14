# Contact Management Backend

Spring Boot REST API backend for the Contact Management Application.

## 🛠️ Technologies

- **Framework**: Spring Boot 3.x
- **Security**: Spring Security 6 + JWT
- **Database**: Microsoft SQL Server
- **ORM**: Hibernate/JPA
- **Build Tool**: Maven
- **Java**: 17+

## 📦 Dependencies

Key dependencies include:
- `spring-boot-starter-web` - REST API
- `spring-boot-starter-data-jpa` - Database access
- `spring-boot-starter-security` - Security framework
- `mssql-jdbc` - SQL Server driver
- `jjwt` - JWT authentication
- `spring-boot-starter-validation` - Input validation

## 🗃️ Database Schema

### User Table
- `id` - Primary key
- `email` - Unique email address
- `phone_number` - User phone
- `password` - Hashed password
- `first_name`, `last_name` - User name
- `profile_image_url` - Profile picture

### Contact Table
- `id` - Primary key
- `user_id` - Foreign key to User
- `first_name`, `last_name` - Contact name
- `organization`, `job_title` - Work info
- `is_favorite` - Favorite flag
- `notes` - Additional notes
- `tags` - List of tags

### Email Address & Phone Number
- Embeddable entities for contact information

## ⚙️ Configuration

### application.properties

```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.SQLServerDialect

# JWT Configuration
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:86400000}
```

### Environment Variables

Required environment variables:
- `DB_URL` - Database connection URL
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - Secret key for JWT signing (min 256 bits)
- `JWT_EXPIRATION` - Token expiration time in milliseconds (optional, default: 24 hours)

## 🚀 Running the Application

### Using Maven Wrapper (Recommended)
```bash
# Clean and build
./mvnw clean install

# Run the application
./mvnw spring-boot:run
```

### Using Maven
```bash
# Clean and build
mvn clean install

# Run the application
mvn spring-boot:run
```

### Running JAR
```bash
# Build JAR
./mvnw clean package

# Run JAR
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

## 🔌 API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "phoneNumber": "+1234567890",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "SecurePassword123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Contact Endpoints (Requires Authentication)

All contact endpoints require `Authorization: Bearer <token>` header.

#### Get All Contacts
```http
GET /api/contacts?page=0&size=10&sortBy=firstName
```

#### Get Contact by ID
```http
GET /api/contacts/{id}
```

#### Create Contact
```http
POST /api/contacts
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "emails": [
    {
      "email": "jane.smith@example.com",
      "type": "WORK"
    }
  ],
  "phoneNumbers": [
    {
      "phoneNumber": "+1234567890",
      "type": "MOBILE"
    }
  ],
  "organization": "Tech Corp",
  "jobTitle": "Engineer",
  "tags": ["colleague", "tech"],
  "isFavorite": false
}
```

#### Update Contact
```http
PUT /api/contacts/{id}
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  ... (same as create)
}
```

#### Delete Contact
```http
DELETE /api/contacts/{id}
```

#### Search Contacts
```http
GET /api/contacts/search?query=Jane&page=0&size=10
```

#### Toggle Favorite
```http
PATCH /api/contacts/{id}/favorite
```

### User Profile Endpoints

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/profile
Content-Type: application/json
Authorization: Bearer <token>

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1234567890"
}
```

#### Change Password
```http
PUT /api/users/change-password
Content-Type: application/json
Authorization: Bearer <token>

{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

## 🔒 Security

- **JWT Authentication**: Stateless authentication using JWT tokens
- **Password Encryption**: BCrypt hashing for passwords
- **CORS Configuration**: Configured for frontend access
- **Exception Handling**: Global exception handler for consistent error responses

## 🧪 Testing

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=UserServiceTest

# Run with coverage
./mvnw test jacoco:report
```

## 📝 Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/contactmanagement/backend/
│   │   │   ├── config/
│   │   │   │   ├── CorsConfig.java
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── ContactController.java
│   │   │   │   └── UserController.java
│   │   │   ├── dto/
│   │   │   │   ├── ContactDTO.java
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── LoginResponse.java
│   │   │   │   └── RegisterRequest.java
│   │   │   ├── entity/
│   │   │   │   ├── Contact.java
│   │   │   │   ├── EmailAddress.java
│   │   │   │   ├── PhoneNumber.java
│   │   │   │   └── User.java
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   └── ResourceNotFoundException.java
│   │   │   ├── repository/
│   │   │   │   ├── ContactRepository.java
│   │   │   │   └── UserRepository.java
│   │   │   ├── security/
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   └── JwtUtil.java
│   │   │   ├── service/
│   │   │   │   ├── ContactService.java
│   │   │   │   └── UserService.java
│   │   │   └── BackendApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/com/contactmanagement/backend/
│           └── (test files)
└── pom.xml
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify SQL Server is running
   - Check connection string in environment variables
   - Ensure database exists

2. **JWT Token Invalid**
   - Verify JWT_SECRET is properly set
   - Check token expiration time
   - Ensure Bearer token format in Authorization header

3. **Build Fails**
   - Run `./mvnw clean install -U` to update dependencies
   - Check Java version: `java -version`

## 📄 License

This project is part of the Contact Management Application and follows the same MIT License.

## 👤 Author

**Saqib Khushal**
- GitHub: [@SaqibKhushal](https://github.com/SaqibKhushal)
