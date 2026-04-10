@echo off
echo Running Prisma migration...
npx prisma migrate dev --name add_pdf_to_articles
echo.
echo Migration complete!
pause
