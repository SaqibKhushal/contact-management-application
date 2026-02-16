# SonarCloud Setup Instructions

## Current Status
- ✅ SonarCloud configuration completed in `pom.xml` and `sonar-project.properties`
- ✅ JaCoCo version upgraded from 0.8.11 to 0.8.12 (Java 21 support)
- ⏳ Awaiting SonarCloud authentication token

## How to Get SonarCloud Token

1. Go to https://sonarcloud.io
2. Login with your GitHub account (saqibkhushal)
3. Click on your avatar (top right) → **My Account**
4. Go to **Security** tab
5. Under "Generate Tokens":
   - Token Name: `Contact Management Backend`
   - Type: **Project Analysis Token**
   - Project: Select your project
   - Click **Generate**
6. **Copy the token** (you won't be able to see it again!)

## Option 1: Set Environment Variable (Recommended)

### Windows PowerShell (Current Session):
```powershell
$env:SONAR_TOKEN="your-token-here"
```

### Windows PowerShell (Permanent):
```powershell
[System.Environment]::SetEnvironmentVariable('SONAR_TOKEN', 'your-token-here', 'User')
```

### Verify it's set:
```powershell
echo $env:SONAR_TOKEN
```

## Option 2: Pass as Maven Parameter

```powershell
cd backend
./mvnw clean verify sonar:sonar -Dsonar.token=your-token-here
```

## Run SonarCloud Analysis

Once token is set, run:
```powershell
cd "c:/Users/saqib/Desktop/ALL DATA/Contact-Management-Application/backend"
./mvnw clean verify sonar:sonar
```

## Expected Output
- Tests run: 35 (all passing)
- Coverage report generated
- Code uploaded to SonarCloud
- Quality Gate analysis results available at:
  https://sonarcloud.io/project/overview?id=saqibkhushal_contact-management-backend

## Troubleshooting

### "Project not found" error:
- Ensure the project exists on SonarCloud
- Create it at: https://sonarcloud.io/projects/create
- Project Key must match: `saqibkhushal_contact-management-backend`
- Organization must match: `saqibkhushal`

### "Unsupported class file major version" error:
- ✅ FIXED: Upgraded JaCoCo to 0.8.12

## Files Modified (Ready to Commit)
1. `backend/pom.xml` - SonarCloud config + JaCoCo upgrade
2. `backend/sonar-project.properties` - SonarCloud config
