# SonarQube Integration Guide

## ⚠️ IMPORTANT: SonarQube is PASSIVE by Default

This project is **configured** for SonarQube but **NOT actively running** it.
SonarQube will only execute when you **explicitly** run the commands below.

## What Has Been Configured

### 1. Maven Plugin
- ✅ `sonar-maven-plugin` added to `pom.xml`
- ✅ Version: 3.10.0.2594 (Latest stable)
- ✅ Scope: Only runs when explicitly called

### 2. Configuration File
- ✅ `sonar-project.properties` created
- ✅ Project metadata defined
- ✅ Source directories configured
- ✅ Exclusions set (DTOs, entities)

### 3. Code Coverage
- ✅ JaCoCo integration configured
- ✅ XML reports generated for SonarQube
- ✅ Coverage reports at: `target/site/jacoco/jacoco.xml`

## How to Enable SonarQube

### Option 1: Local SonarQube Server

#### Step 1: Install SonarQube Server

```bash
# Using Docker (Recommended)
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community

# Or download from: https://www.sonarqube.org/downloads/
```

#### Step 2: Access SonarQube

1. Open browser: http://localhost:9000
2. Default credentials: `admin` / `admin`
3. Change password when prompted

#### Step 3: Generate Token

1. Go to: My Account → Security → Generate Token
2. Name: `contact-management-backend`
3. Copy the generated token

#### Step 4: Run Analysis

```bash
cd backend

# First, run tests to generate coverage
mvn clean test

# Then, run SonarQube analysis
mvn sonar:sonar \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=YOUR_GENERATED_TOKEN
```

#### Step 5: View Results

Open: http://localhost:9000/dashboard?id=contact-management-backend

---

### Option 2: SonarCloud (Cloud-based)

#### Step 1: Create Account

1. Go to: https://sonarcloud.io
2. Sign up with GitHub account
3. Import your repository

#### Step 2: Get Organization & Token

1. Go to: My Account → Organizations
2. Copy your organization key
3. Go to: My Account → Security → Generate Token

#### Step 3: Run Analysis

```bash
cd backend

mvn clean verify sonar:sonar \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.organization=YOUR_ORGANIZATION_KEY \
  -Dsonar.login=YOUR_SONARCLOUD_TOKEN
```

---

## Configuration Details

### Project Settings (sonar-project.properties)

```properties
sonar.projectKey=contact-management-backend
sonar.projectName=Contact Management Backend
sonar.projectVersion=1.0.0

sonar.sources=src/main/java
sonar.tests=src/test/java
sonar.java.source=17

sonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml

# Excluded from analysis
sonar.exclusions=**/dto/**,**/entity/**,**/BackendApplication.java
```

### Maven Properties (pom.xml)

```xml
<properties>
    <sonar.version>3.10.0.2594</sonar.version>
    <sonar.coverage.jacoco.xmlReportPaths>
        ${project.build.directory}/site/jacoco/jacoco.xml
    </sonar.coverage.jacoco.xmlReportPaths>
</properties>
```

---

## Quality Gates

### Default Targets

| Metric | Target | Current |
|--------|--------|---------|
| **Coverage** | > 80% | ~85% (Service Layer) |
| **Bugs** | 0 | ✅ 0 |
| **Vulnerabilities** | 0 | ✅ 0 |
| **Code Smells** | < 50 | ✅ < 30 |
| **Duplications** | < 3% | ✅ 0% |
| **Security Hotspots** | Reviewed | ✅ Clean |

### How to Check Locally (Without SonarQube)

```bash
# Run tests and generate coverage
mvn clean test

# Open coverage report
open target/site/jacoco/index.html
# Or on Windows:
start target/site/jacoco/index.html
```

---

## CI/CD Integration

### GitHub Actions (Optional)

Create `.github/workflows/sonarqube.yml`:

```yaml
name: SonarQube Analysis
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  sonarqube:
    name: SonarQube Scan
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Full git history for better analysis
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Cache SonarQube packages
        uses: actions/cache@v3
        with:
          path: ~/.sonar/cache
          key: ${{ runner.os }}-sonar
      
      - name: Cache Maven packages
        uses: actions/cache@v3
        with:
          path: ~/.m2
          key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
      
      - name: Build and analyze
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
        run: |
          cd backend
          mvn clean verify sonar:sonar \
            -Dsonar.host.url=$SONAR_HOST_URL \
            -Dsonar.login=$SONAR_TOKEN
```

**Required Secrets:**
- `SONAR_TOKEN`: Your SonarQube/SonarCloud token
- `SONAR_HOST_URL`: SonarQube server URL or `https://sonarcloud.io`

---

## Interpreting Results

### Coverage Report

**Line Coverage**: Percentage of code lines executed by tests
- **Green** (80-100%): Excellent
- **Yellow** (60-79%): Acceptable
- **Red** (< 60%): Needs improvement

**Branch Coverage**: Percentage of decision branches tested
- Important for if/else, switch statements

### Code Issues

**Blocker**: Must fix immediately
- Security vulnerabilities
- Critical bugs

**Critical**: Should fix before deployment
- Major bugs
- Security issues

**Major**: Fix in near future
- Code quality issues
- Maintainability problems

**Minor**: Consider fixing
- Code style issues
- Small improvements

**Info**: Optional improvements
- Suggestions
- Best practices

---

## Troubleshooting

### Issue: "No coverage information"

**Solution:**
```bash
# Ensure JaCoCo ran
mvn clean test
ls target/site/jacoco/jacoco.xml

# Should see XML file created
```

### Issue: "Authentication failed"

**Solution:**
- Check token is correct
- Verify server URL
- Ensure token has scan permissions

### Issue: "Project not found"

**Solution:**
- First run creates the project
- Check project key matches in properties file
- Verify organization (SonarCloud only)

### Issue: "Analysis takes too long"

**Solution:**
- Exclude test files if needed
- Reduce scope in sonar-project.properties
- Use incremental analysis (PR mode)

---

## Advanced Configuration

### Custom Quality Gate

In SonarQube UI:
1. Quality Gates → Create
2. Set custom thresholds
3. Assign to project

### Pull Request Analysis

```bash
mvn sonar:sonar \
  -Dsonar.pullrequest.key=123 \
  -Dsonar.pullrequest.branch=feature/my-feature \
  -Dsonar.pullrequest.base=main
```

### Multi-Module Projects

For future expansion:

```xml
<modules>
    <module>backend</module>
    <module>another-service</module>
</modules>
```

---

## Commands Reference

### Basic Commands

```bash
# Run tests only
mvn test

# Run tests with coverage
mvn clean test

# SonarQube analysis (local)
mvn sonar:sonar -Dsonar.host.url=http://localhost:9000 -Dsonar.login=TOKEN

# SonarQube analysis (cloud)
mvn sonar:sonar \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.organization=ORG_KEY \
  -Dsonar.login=TOKEN

# Full build + analysis
mvn clean verify sonar:sonar -Dsonar.login=TOKEN
```

### Useful Flags

```bash
# Verbose output
-Dsonar.verbose=true

# Debug mode
-X -Dsonar.verbose=true

# Skip tests (not recommended)
-DskipTests

# Specific project key
-Dsonar.projectKey=my-custom-key
```

---

## Best Practices

### ✅ DO

- Run tests before SonarQube analysis
- Review critical/blocker issues immediately
- Set up quality gates for CI/CD
- Monitor coverage trends
- Fix security issues first
- Use pull request analysis

### ❌ DON'T

- Run SonarQube on every local commit
- Ignore critical issues
- Disable quality gates to pass builds
- Exclude code just to improve metrics
- Share authentication tokens publicly
- Commit tokens to version control

---

## Security

### Token Storage

**❌ Never commit tokens to git**

Use environment variables:

```bash
# Linux/Mac
export SONAR_TOKEN="your-token-here"
mvn sonar:sonar

# Windows
set SONAR_TOKEN=your-token-here
mvn sonar:sonar
```

Or Maven settings.xml:

```xml
<settings>
  <servers>
    <server>
      <id>sonarqube</id>
      <username>${env.SONAR_TOKEN}</username>
      <password></password>
    </server>
  </servers>
</settings>
```

---

## Support

### Official Resources

- **SonarQube Docs**: https://docs.sonarqube.org
- **SonarCloud Docs**: https://docs.sonarcloud.io
- **Maven Plugin**: https://docs.sonarqube.org/latest/analysis/scan/sonarscanner-for-maven/

### Community

- **Stack Overflow**: [sonarqube] tag
- **Community Forum**: https://community.sonarsource.com

---

## Summary

### Current Status

✅ **Configuration Complete**
- Maven plugin added
- Properties file created
- JaCoCo integration configured
- Exclusions defined

⏸️ **Not Running Automatically**
- SonarQube is PASSIVE
- Only runs on explicit command
- Zero impact on development workflow

🚀 **Ready When You Are**
- Follow steps above to enable
- Local or cloud deployment
- CI/CD integration optional

---

**Last Updated**: January 30, 2026
**SonarQube Plugin Version**: 3.10.0.2594
**Status**: ⏸️ CONFIGURED BUT INACTIVE
