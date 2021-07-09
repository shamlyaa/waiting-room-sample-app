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

# Using the application

### Participant

Navigate to http://localhost:3000/participant?room=${roomName} to join a session as a Participant. Bear in mind that so that two users (participants or hosts) can join the same session, they need to be on the same room.
Participants won't be connected to the session until the pre-call test is completed, but they will be able to choose the devices to use during the call. A participant won't publish into the session unless there's a host present. The participants will see the results of the pre-call test as they become available. There's an audio level indicator in the form of a progress bar that indicates the speaker audio Levels. The idea is that once a participant joins a session with a host, they've made sure that they're using the right and working device (camera and mic), they have connectivity to our Servers (API, Media, Logging) and their bitrate supports Audio and Video.
