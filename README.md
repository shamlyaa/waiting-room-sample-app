# Waiting Room and Pre-call Best Practices

![Main](https://github.com/nexmo-se/)

This application will show you how to implement a waiting room (wait for the host to join). It also showcases best practices to improve the pre-call user experience. The app lets you change the audio and video devices, it will show a progress bar moving as you speak to make sure that your microphone works and it will run a pre-call test before connecting you to the session. You will see the results on screen once the test is completed.

### Setup (Local)

1. clone this repo.
2. run `npm install`.
3. setup `.env` according to `.env.example`.
4. run `npm install`.
5. run `npm start`.
6. Navigate to http://localhost:3000/participant?room=${roomName} for a participant and http://localhost:3000/host?room=${roomName} for the host
