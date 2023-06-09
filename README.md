# MONIC
### An open-source monitoring & evaluation system for impact-driven organisations

The video linked below is a demo of Monic given during the Global Evaluation Initiative's gLOCAL Evaluation Week. (If you click through the YouTube, the video description has bookmarks at a number of interesting points, allowing you to skip through the sections that are relevant to you)

![Demo of Monic during GEI's gLOCAL Evaluation Week](https://github.com/capesean/MONIC/assets/642609/3d1f66ad-efb9-461b-b941-a1a21de7d04a)

Video link: https://www.youtube.com/watch?v=A5eus7Yhv1k

-----

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

![Screenshot 2023-05-30 120502](https://github.com/capesean/MONIC/assets/642609/2cab705e-6d79-4ec3-b14c-d9efa70ec83d)

Note that this software is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE V3.0
