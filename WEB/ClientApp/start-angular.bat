:: This starts the angular CLI server using 'npm start'
:: "Use npm start to launch the Angular CLI development server, not ng serve, so that the configuration in package.json is respected"
:: (from: https://stackoverflow.com/questions/57360446/how-to-keep-the-angularcliserver-running-between-builds-on-asp-net-core-with-ang)
:: see also: https://learn.microsoft.com/en-us/aspnet/core/client-side/spa/angular?view=aspnetcore-8.0&tabs=visual-studio
:: to optimize restart of c# changes:
:: Step 1) run this script
:: Step 2) start the aspnet (F5)

ng serve --port 44409 --ssl --ssl-cert %APPDATA%\\ASP.NET\\https\\website3.pem --ssl-key %APPDATA%\\ASP.NET\\https\\website3.key
::npm start

pause
