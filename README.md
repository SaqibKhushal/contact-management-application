# Contact Management Application

A full-stack contact management system built with Spring Boot (backend) and React (frontend), featuring JWT authentication, CRUD operations, and SQL Server database integration.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication and authorization
- **Contact Management**: Create, read, update, and delete contacts
- **Profile Management**: Upload profile pictures and manage user information
- **Tag System**: Organize contacts with custom tags
- **Favorites**: Mark important contacts as favorites
- **Search & Filter**: Advanced search functionality for contacts
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Real-time Validation**: Form validation on both frontend and backend

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Security**: Spring Security with JWT
- **Database**: Microsoft SQL Server
- **ORM**: Hibernate/JPA
- **Build Tool**: Maven
- **Java Version**: 17+

### Frontend
- **Framework**: React 18
- **Build Tool**: Create React App
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Notifications**: react-toastify

## 📋 Prerequisites

- Java 17 or higher
- Node.js 16+ and npm
- Microsoft SQL Server
- Maven (or use included wrapper)

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/SaqibKhushal/contact-management-application.git
cd contact-management-application
```

### 2. Database Setup

Create a SQL Server database:
```sql
CREATE DATABASE ContactManagementDB;
```

### 3. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Create a `.env` file or set environment variables:
```properties
DB_URL=jdbc:sqlserver://localhost:1433;databaseName=ContactManagementDB;encrypt=true;trustServerCertificate=true
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
JWT_SECRET=your-secret-key-minimum-256-bits-required
JWT_EXPIRATION=86400000
```

Build and run the backend:
```bash
# Using Maven wrapper (recommended)
./mvnw clean install
./mvnw spring-boot:run

# Or using Maven
mvn clean install
mvn spring-boot:run
```

Backend will start on `http://localhost:8080`

### 4. Frontend Setup

Navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm start
```

Frontend will start on `http://localhost:3000`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Contacts
- `GET /api/contacts` - Get all contacts (paginated)
- `GET /api/contacts/{id}` - Get contact by ID
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/{id}` - Update contact
- `DELETE /api/contacts/{id}` - Delete contact
- `GET /api/contacts/search?query=<text>` - Search contacts
- `PATCH /api/contacts/{id}/favorite` - Toggle favorite status

### User Profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/profile/image` - Upload profile image
- `PUT /api/users/change-password` - Change password

## 📁 Project Structure

```
contact-management-application/
├── backend/                  # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/contactmanagement/backend/
│   │   │   │       ├── config/       # Security & CORS config
│   │   │   │       ├── controller/   # REST controllers
│   │   │   │       ├── dto/          # Data transfer objects
│   │   │   │       ├── entity/       # JPA entities
│   │   │   │       ├── exception/    # Exception handling
│   │   │   │       ├── repository/   # Data access layer
│   │   │   │       ├── security/     # JWT utilities
│   │   │   │       └── service/      # Business logic
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/             # Unit tests
│   └── pom.xml              # Maven dependencies
│
├── frontend/                 # React frontend
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   └── package.json         # npm dependencies
│
└── README.md               # This file
```

## 🔐 Environment Variables

Create a `.env` file in the backend root directory or set environment variables:

```properties
# Database Configuration
DB_URL=jdbc:sqlserver://localhost:1433;databaseName=ContactManagementDB
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-secret-key-here-minimum-256-bits-required
JWT_EXPIRATION=86400000
```

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
./mvnw test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Backend Deployment
1. Build JAR file: `./mvnw clean package`
2. Run JAR: `java -jar target/backend-0.0.1-SNAPSHOT.jar`

### Frontend Deployment
1. Build production files: `npm run build`
2. Deploy the `build` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

##  Author

**Saqib Khushal**
- GitHub: [@SaqibKhushal](https://github.com/SaqibKhushal)
- Repository: [contact-management-application](https://github.com/SaqibKhushal/contact-management-application)

## 🙏 Acknowledgments

- Spring Boot documentation
- React documentation
- Tailwind CSS
- Microsoft SQL Server

## 📞 Support

For support, email saqibkhushalofficial@gmail.com or open an issue in the repository.

---

**⭐ If you found this project helpful, please give it a star!**
