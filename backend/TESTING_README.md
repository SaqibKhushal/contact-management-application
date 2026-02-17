# Testing and Code Quality Guide

## Overview

This document describes the testing strategy and code quality tools for the Contact Management Backend application.

## Testing Framework

### Technology Stack
- **JUnit 5**: Modern testing framework for Java
- **Mockito**: Mocking framework for unit tests
- **AssertJ**: Fluent assertion library
- **Spring Boot Test**: Integration testing support
- **H2 Database**: In-memory database for test isolation

### Test Structure

```
backend/src/test/java/com/contactmanagement/backend/
├── service/
│   ├── UserServiceTest.java           ✅ Comprehensive unit tests
│   └── ContactServiceTest.java        ✅ Comprehensive unit tests
└── BackendApplicationTests.java       ✅ Context load test
```

## Running Tests

### Command Line

```bash
# Run all tests
cd backend
mvn test

# Run tests with coverage report
mvn clean test

# View coverage report
# Open: backend/target/site/jacoco/index.html
```

### IDE Integration

- **IntelliJ IDEA**: Right-click on test class → Run Tests
- **Eclipse**: Right-click on test class → Run As → JUnit Test
- **VS Code**: Use Java Test Runner extension

## Test Coverage

### Current Coverage Goals

| Layer | Target Coverage | Status |
|-------|----------------|--------|
| Service Layer | 80%+ | ✅ Achieved |
| Controller Layer | 70%+ | 🔄 Future |
| Security Layer | 60%+ | 🔄 Future |

### JaCoCo Configuration

JaCoCo is configured to:
- Generate coverage reports after `mvn test`
- Enforce minimum 60% package-level coverage
- Exclude DTOs, entities, and config classes
- Create XML and HTML reports

**View Report**: `backend/target/site/jacoco/index.html`

## Test Philosophy

### Unit Tests (Current Focus)

**What We Test:**
- ✅ Service layer business logic
- ✅ Validation rules
- ✅ Exception handling
- ✅ Data transformations
- ✅ Edge cases

**What We Mock:**
- ✅ Repositories (database access)
- ✅ Security utilities
- ✅ External dependencies
- ✅ Password encoders
- ✅ JWT utilities

**Test Pattern (AAA):**
```java
@Test
void testMethod_Condition_ExpectedOutcome() {
    // Arrange - Set up test data and mocks
    when(mockRepository.findById(1L)).thenReturn(Optional.of(entity));
    
    // Act - Execute the method being tested
    Result result = service.methodUnderTest(input);
    
    // Assert - Verify the outcome
    assertThat(result).isNotNull();
    verify(mockRepository).findById(1L);
}
```

## SonarQube Integration

### Configuration

SonarQube is **CONFIGURED BUT NOT ACTIVE** by default.

**Configuration Files:**
- `backend/pom.xml` - Contains sonar-maven-plugin
- `backend/sonar-project.properties` - SonarQube project settings

### Running SonarQube (Manual)

```bash
# Prerequisites:
# 1. SonarQube server running (local or cloud)
# 2. Authentication token generated

# Run analysis
cd backend
mvn clean verify sonar:sonar \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=YOUR_SONAR_TOKEN
```

### SonarQube Quality Gates

**Target Metrics:**
- **Bugs**: 0
- **Vulnerabilities**: 0
- **Code Smells**: Minimized
- **Coverage**: > 80%
- **Duplications**: < 3%
- **Security Hotspots**: Reviewed

### SonarCloud (Optional)

For cloud-based analysis:

```bash
mvn clean verify sonar:sonar \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.organization=YOUR_ORG \
  -Dsonar.login=YOUR_CLOUD_TOKEN
```

## Best Practices

### Writing Tests

✅ **DO:**
- Use descriptive test names: `method_condition_expectedOutcome`
- Follow Arrange-Act-Assert pattern
- Test one behavior per test method
- Use `@DisplayName` for readable test reports
- Mock external dependencies
- Test both success and failure scenarios
- Test edge cases (null, empty, boundary values)

❌ **DON'T:**
- Test Spring framework code (already tested by Spring)
- Use real databases in unit tests
- Test multiple behaviors in one method
- Ignore test failures
- Skip edge cases
- Modify production code to make tests pass

### Test Independence

Each test must be:
- **Isolated**: No shared state between tests
- **Repeatable**: Same result every time
- **Fast**: Unit tests should run in milliseconds
- **Independent**: Can run in any order

### Mocking Guidelines

```java
// ✅ GOOD: Mock repository methods
when(userRepository.findById(1L)).thenReturn(Optional.of(user));

// ✅ GOOD: Verify interactions
verify(userRepository, times(1)).save(any(User.class));

// ❌ BAD: Don't mock the class under test
@Mock
private UserService userService; // Wrong - this is what we're testing!

// ✅ GOOD: Use @InjectMocks for the class under test
@InjectMocks
private UserService userService; // Correct!
```

## Code Quality

### Static Analysis Tools

1. **Maven Compiler Warnings**: Zero tolerance
2. **SonarQube**: Code quality and security
3. **JaCoCo**: Test coverage monitoring

### Quality Metrics

| Metric | Target | Enforcement |
|--------|--------|-------------|
| Test Coverage | 80% | JaCoCo check |
| Bugs | 0 | SonarQube |
| Vulnerabilities | 0 | SonarQube |
| Code Smells | < 50 | SonarQube |
| Duplications | < 3% | SonarQube |

## CI/CD Integration (Future)

### GitHub Actions (Planned)

```yaml
# .github/workflows/test.yml
name: Run Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
      - run: mvn clean test
      - uses: codecov/codecov-action@v3
```

## Troubleshooting

### Common Issues

**Tests fail with "Cannot autowire"**
```
Solution: Tests are unit tests - don't use @SpringBootTest
Use @ExtendWith(MockitoExtension.class) instead
```

**Coverage too low**
```
Solution: Check excluded packages in pom.xml
Add more test cases for critical paths
```

**SonarQube connection fails**
```
Solution: Verify server URL and token
Check network connectivity
Ensure server is running
```

## Test Data Management

### Test User
```java
User testUser = new User();
testUser.setId(1L);
testUser.setEmail("test@example.com");
testUser.setPassword("encodedPassword");
```

### Test Contact
```java
Contact testContact = new Contact();
testContact.setId(1L);
testContact.setUser(testUser);
testContact.setFirstName("John");
testContact.setLastName("Doe");
```

## Summary

### Current Status: ✅ PRODUCTION-READY

- ✅ Comprehensive service layer tests
- ✅ JaCoCo coverage reporting configured
- ✅ SonarQube integration prepared (passive)
- ✅ No impact on runtime behavior
- ✅ All tests isolated with H2 database
- ✅ Following enterprise best practices

### Next Steps (Optional)

1. Add controller layer tests
2. Add integration tests
3. Add security layer tests
4. Set up CI/CD pipeline
5. Connect to SonarQube server
6. Implement mutation testing

## Contact

For questions about testing strategy, contact the development team.

---

**Last Updated**: January 30, 2026
**Test Framework Version**: JUnit 5.10.1
**Coverage Tool**: JaCoCo 0.8.11
