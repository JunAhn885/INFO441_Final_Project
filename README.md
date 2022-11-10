# RSO Member Management App
Patricia Ma, Scott Nguyen, Jun Ahn, Jack Sui 

## Project Description
Our target audience for the club member management app is college RSO officers and administrators. We envision club members and club officers to use our applications to easily manage various member status such as attendance, dues, membership status, etc. Our audience will choose our application over their previous management methods because we noticed that many RSOs track their attendance, club dues and activities with Excel or other manual ways, which are not created for human management purposes. We want to build a system that is actually useful for current RSO’s leaders to better manage their organizations and to save time while doing so. As a developer and a student, many of us are part of the RSOs on campus. Based on our experiences, we observed that many RSO’s on campus have a difficult time managing members as they are either using excel or platforms not suitable for member management.


## Technical Description
### Architectural Diagram
![image of architectural diagram](images/arch-diagram%20copy.png)

### User Stories
|Priority|User|Description|Technical Description|
|---|---|---|---|
|P0|As a Club Officer and a regular user|I want a platform or app where I can view and manage all the members|Website will be hosted on **Azure**, while the server side will be written in **Node.js** and **Express** framework. All information will be stored in **Firebase DB**, while communication is handled through **http protocol from the REST API**|
|P0|As a Club Officer and a regular user|I want to be able to change member’s information on the app along with their information (email, phone, grade, major and role)|Use **get**, **post** and **delete** to make appropriate updates about a member. Information will be sent in **JSON** format, While requests will be handled from the backend|
|P1|As a specific club officer|I want to be able to access the app specifically for our club|Use **authentication** to create numerous accounts specific to the RSO and give authorization only to the RSO members|
|P2|As a club officer|I want to be able to send out mass emails to all members|Officer can select members (all or specific) on the app which will send a **GET** request to **Firebase DB** to extract emails which then will send mass emails to the selected memebrs|
|P2|Secretary|I want to be able to check attendance of the members|Secretary can simply check attendance by clicking on the checkbox next to the member’s name, which will send a **POST** request to the **Firebase DB** to update attendance|
|P3|Treasurer|I want to track the dues/finances of my club members|There will be an option to select whether a member has paid dues or not. This functionality will be handled using **POST** and **GET** requests|
|P4|Officer|I want to be able to search members on the app|Create a physical search bar using **HTML**, **CSS**, and **REACT**, while input in the search bar will be sent to the server side via **http** protocol, and information will be sent back from the **Firebase DB** in a **json** format.
|P5|Officer|I want to be able to filter members based on their grade, status and major|Selected criterias will be sent to the server in a **JSON** format while the server will use the **Javascript** function to retrieve & send members with matching criterias from the **Firebase DB**


###  Endpoints
- Authentication
  - /signin
    - Handle user sign in through Azure
  - /signout
    - Delete current user session and signs the user out




