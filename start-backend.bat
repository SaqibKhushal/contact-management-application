@echo off
cd /d "%~dp0backend"
echo Starting Contact Management Backend...
echo.
call mvnw.cmd spring-boot:run
