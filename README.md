# slid-api
API server for the Slid summarization service

# Routes
## POST `/api/v1/summary/new`
```json
{
    "type": String, // text, audio
    "data": String | File // array of sent. or audio file
}
```
- **Supported types:**
    - `.txt`
    - `.mp4`
    - `.jpg`
    - `.png`
    - `.mov`
    - `.pdf`
 ## POST `/api/v1/users/new`
 ```json
 {
    "username": string,
    "password": string
 }
 ```

 ## GET `/api/v1/summary/:id`
 ## GET `/api/v1/users:id`

 # Usage
 To start the API server locally, run the command `make run`

 > **NOTE:** If you are on windows run the command `npm run start` instead
