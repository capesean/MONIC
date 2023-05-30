# MONIC
### An open-source monitoring & evaluation system for impact-driven organisations

**Please note:**
- Monic is currently under development and is likely receive a lot of breaking changes.
- Setting up Monic (either on your computer or on a web server) requires some technical skills. If you would like to test/demo Monic and are not technically minded, please get in touch with me (Sean).


## Setup Instructions
Pre-requisites:
- Visual Studio - you can download the free version (Community Edition) [here](https://visualstudio.microsoft.com/downloads/).
- Node.js - you can download Node [here](https://nodejs.org/en/download).
- SQL Server - you can download a free version (Developer/Express) [here](https://www.microsoft.com/en-us/sql-server/sql-server-downloads).

1. Download the zip file and extract it into a folder on your computer.
2. Open the file `Monic.sln` (it should open with Visual Studio).
3. Edit the file `appSettings.json`. The main setting to change is the `ConnectionStrings` -> `DefaultConnection`. This needs to be a valid connection string to a SQL Server database.

   **Note** the database doesn't need to exist at this point, as it will be created by the application when it runs. However, the connection string needs to connect to a SQL Server and have a valid database name for it to run.
4. Build/Run the application in Visual Studio using either <kbd>F5</kbd>, <kbd>Ctrl</kbd>-<kbd>F5</kbd>, or via the `Debug` menu in Visual Studio.

   **Note** the first time the application runs, it will take a little time to install the required packages. Please be patient!
   
If it runs successfully, you should see a browser window with the following setup screen:

![image](https://github.com/capesean/MONIC/assets/642609/494df0fc-89ce-41a5-a7f8-de3178b1fab6)


