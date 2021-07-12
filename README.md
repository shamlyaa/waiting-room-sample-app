# Waiting Room and Pre-call Best Practices

![Pre-call result](https://raw.githubusercontent.com/nexmo-se/waiting-room-sample-app/main/src/images/both-participants.png)

This application will show you how to implement a waiting room (wait for the host to join). It also showcases best practices to improve the pre-call user experience. The app lets you change the audio and video devices and will update the list of devices available if there's a device plugged/unplugged during the call. It will show a progress bar moving as you speak to make sure that your microphone works and it will run a pre-call test before connecting you to the session. You will see the results on screen once the test is completed. The UI is not optimized for more than 2 participants, but the logic is valid for a multiparty call as well.

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

If a participant joins the session, and there's no host connected yet, they will remain connected until the host joins the session. If a participant joins the session and there's at least one host connected, they will start publishing.

![Pre-call result](https://raw.githubusercontent.com/nexmo-se/waiting-room-sample-app/main/src/images/precall-inprogress.png)
![Pre-call result](https://raw.githubusercontent.com/nexmo-se/waiting-room-sample-app/main/src/images/precall-result.png)

### Host

Navigate to http://localhost:3000/host?room=${roomName} to join a session as a Host. Bear in mind that so that two users (participants or hosts) can join the same session, they need to be on the same room.
For the sake of simplicity, the app doesn't run a pre-call test on the host, but the same logic as the participant would apply. The host gets connected and start publishing into the session immediately. If there are participants waiting for the host, they will also start publishing once the host connects to the session. The host has an extra button on the toolbar to terminate the call for all participants. Upon click, all active connections will be disconnected.

![Pre-call result](https://raw.githubusercontent.com/nexmo-se/waiting-room-sample-app/main/src/images/host.png)

## Application Structure

## Server side

The server (index.js) is a basic nodeJS express server that serves two HTML files depending on the route choosen (/host or /participant). The server is also in charge of generating crendentials for the session (token and session IDs). The server will generate either a moderator token for the host or a publisher token for a participant depending on the request coming from the client side. For more information on token creations, visit [this link](https://tokbox.com/developer/guides/create-token/node/). The server will store in memory a map of session and roomNames. For a production application, you will need to store this sessions on a database or similar.

## Client side

The application uses [Webpack](https://webpack.js.org/) to bundle all Javascript files together and make the application more scalable and easier to understand. It also uses [Boostrap](https://getbootstrap.com/) to simplify the UI design process.

All the Javascript files are within the /src folder:

- The main entry point is index.js. This file will get the roomName out of the URL and depending on the route visited, will create an instance of Host or Participant. It will then initialise the process.
  -T here is a Host Class and a Participant Class. Each of these files follow a different logic as mentioned above
- utils.js is a file with some utilities used by both Host and Participants. It also contains the logic used for device selection and change.
- credentials.js contains the logic necessary to request credentials for the Host, Participant and the precall test.
- network-test.js contains the logic to run the pre-call test. It uses [OpenTok Network Test](https://www.npmjs.com/package/opentok-network-test-js). The running time of the test is set by default to around 30 seconds. The longer it runs, the more accurate results, you will get.
- quality-test-results.js and connectivity-test-results are two files to parse the results and show the results to the participant on screen
- test-progress.js contains some utility to show and hide the progress of the pre-call test.
- quality-test-error.js handles the logic to display the result of a failed quality test

## Pre-call test

We will use the [network test](https://www.npmjs.com/package/opentok-network-test-js) npm module to check that the participant has connectivity to Vonage Video API logging, messaging, media, and API servers; as well as to check expected quality during the call. For the sake of simplicity, we will only run a precall test on our participants but not on the Host. The precall test results also provide a recommended resolution and a [MOS score](https://www.npmjs.com/package/opentok-network-test-js#mos-estimates) from 0 to 4.5. Given that this is a bit subjective, we will add the ability to decide whether we want to display the preferred Resolution and a result label based on the MOS score i.e. (Good, Bad, Excellent..). You can decide whether to include the recommended resolution and the score label by toggling the `addFeedback` variable under /src/variables.js.
