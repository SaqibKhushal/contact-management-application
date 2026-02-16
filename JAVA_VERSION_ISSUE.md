# Java Version Issue & SonarCloud Solution

## Current Problem

### Issue
- System has **Java 25** installed and active
- pom.xml specifies **Java 17**
- **JaCoCo 0.8.12** doesn't support Java 25 yet (max Java 21)
- Tests pass WITHOUT coverage ✅
- Tests FAIL WITH JaCoCo coverage due to Mockito instrumentation error ❌

### Error Details
```
java.io.IOException: Error while instrumenting 
  com/contactmanagement/backend/repository/UserRepository$MockitoMock$...
  with JaCoCo 0.8.12
Caused by: java.lang.IllegalArgumentException: 
  Unsupported class file major version 69 (Java 25)
```

### Test Results
```bash
✅ Tests without JaCoCo: ./mvnw test -Djacoco.skip=true
Result: Tests run: 35, Failures: 0, Errors: 0, Skipped: 0

❌ Tests with JaCoCo: ./mvnw clean test
Result: BUILD FAILURE (JaCoCo instrumentation error)
```

---

## Solutions (Choose One)

### ✅ Solution 1: Install Java 17 LTS (RECOMMENDED)

#### Steps:
1. **Download Java 17 LTS**:
   - Go to: https://adoptium.net/temurin/releases/?version=17
   - Select: **Windows x64 JDK .msi installer**
   - Download and install

2. **Set JAVA_HOME** (PowerShell as Administrator):
   ```powershell
   [System.Environment]::SetEnvironmentVariable(
     'JAVA_HOME', 
     'C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot\',
     'Machine'
   )
   ```

3. **Update PATH** (PowerShell as Administrator):
   ```powershell
   $path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
   $newPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot\bin;$path"
   [System.Environment]::SetEnvironmentVariable('Path', $newPath, 'Machine')
   ```

4. **Restart PowerShell and Verify**:
   ```powershell
   java -version
   # Should show: openjdk version "17.0.x"
   
   echo $env:JAVA_HOME
   # Should show: C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot\
   ```

5. **Run Tests with Coverage**:
   ```powershell
   cd backend
   ./mvnw clean test
   # Should now pass with coverage!
   ```

6. **Run SonarCloud Analysis**:
   ```powershell
   $env:SONAR_TOKEN="your-sonarcloud-token"
   ./mvnw clean verify sonar:sonar
   ```

---

### Solution 2: Use Java Toolchains (Requires Java 17 Installed)

If you want to keep Java 25 as default but use Java 17 for this project:

1. Install Java 17 (as above)
2. Add to `pom.xml` in `<build>` section:
   ```xml
   <plugins>
       <!-- Toolchain Configuration -->
       <plugin>
           <groupId>org.apache.maven.plugins</groupId>
           <artifactId>maven-toolchains-plugin</artifactId>
           <version>3.2.0</version>
           <executions>
               <execution>
                   <goals>
                       <goal>toolchain</goal>
                   </goals>
               </execution>
           </executions>
           <configuration>
               <toolchains>
                   <jdk>
                       <version>17</version>
                   </jdk>
               </toolchains>
           </configuration>
       </plugin>
   </plugins>
   ```

3. Create `~/.m2/toolchains.xml`:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <toolchains>
     <toolchain>
       <type>jdk</type>
       <provides>
         <version>17</version>
       </provides>
       <configuration>
         <jdkHome>C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot</jdkHome>
       </configuration>
     </toolchain>
   </toolchains>
   ```

---

### Solution 3: Run Without Coverage (NOT RECOMMENDED)

Only for emergency situations - skip coverage temporarily:

```powershell
cd backend
./mvnw clean verify sonar:sonar -Djacoco.skip=true -Dsonar.coverage.jacoco.xmlReportPaths=""
```

**Downside**: SonarCloud analysis will show 0% coverage.

---

## Current Changes Ready to Commit

### Modified Files:
1. **backend/pom.xml**
   - Upgraded JaCoCo: 0.8.11 → 0.8.12
   - Added SonarCloud configuration
   - Added project key with organization prefix

2. **backend/sonar-project.properties** (NEW)
   - SonarCloud host configuration
   - Project identification settings
   - Coverage report paths
   - Exclusions for DTOs/entities

3. **LOGIN_FIX_SUMMARY.md** (NEW)
   - Documentation of login issue resolution

4. **SONARCLOUD_SETUP.md** (NEW)
   - Token setup instructions
   - Analysis command examples

### Commit Plan:
```bash
git add backend/pom.xml
git add backend/sonar-project.properties
git add LOGIN_FIX_SUMMARY.md
git add SONARCLOUD_SETUP.md
git add JAVA_VERSION_ISSUE.md

git commit -m "chore: Configure SonarCloud and upgrade JaCoCo

- Add SonarCloud host URL and project key configuration
- Upgrade JaCoCo from 0.8.11 to 0.8.12 for better Java support
- Add sonar-project.properties with analysis settings
- Document login fix (password hash correction in database)
- Document SonarCloud setup instructions
- Document Java version requirement (Java 17 LTS)

Note: Tests pass (35/35) but require Java 17 for JaCoCo coverage.
SonarCloud analysis requires SONAR_TOKEN environment variable.

No functional code changes - only configuration and documentation."
```

---

## Next Steps After Java 17 Installation

1. **Verify Environment**:
   ```bash
   java -version  # Should show Java 17
   mvn -version   # Should show Java 17
   ```

2. **Run Full Test Suite with Coverage**:
   ```bash
   cd backend
   ./mvnw clean test
   # Expected: Tests run: 35, Failures: 0, Errors: 0
   # Expected: JaCoCo report generated
   ```

3. **Get SonarCloud Token**:
   - Visit: https://sonarcloud.io
   - My Account → Security → Generate Token
   - Copy token

4. **Run SonarCloud Analysis**:
   ```bash
   $env:SONAR_TOKEN="your-token"
   ./mvnw clean verify sonar:sonar
   ```

5. **Review Results**:
   - Visit: https://sonarcloud.io/project/overview?id=saqibkhushal_contact-management-backend
   - Check Quality Gate status
   - Fix any bugs/vulnerabilities reported

6. **Commit Quality Gate Fixes** (if needed)

7. **Push All Changes**:
   ```bash
   git push origin main
   ```

---

## Summary

**Current Status**:
- ✅ Login issue FIXED (database password hash corrected)
- ✅ Backend running (port 8080)
- ✅ Frontend running (port 3000)
- ✅ All tests passing (35/35) without coverage
- ✅ SonarCloud configured
- ⏳ Waiting for Java 17 installation for JaCoCo coverage
- ⏳ Waiting for SonarCloud token for analysis

**Action Required**:
1. Install Java 17 LTS
2. Get SonarCloud token
3. Run analysis
4. Fix Quality Gate issues (if any)
5. Commit and push

**User Credentials Working**:
- Email: saqibkhushalofficial@gmail.com
- Password: testing123
- Status: ✅ LOGIN SUCCESSFUL
