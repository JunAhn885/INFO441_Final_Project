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
|P1|As a club officer|I want to be able to send out mass emails to all members|



###  Endpoints
