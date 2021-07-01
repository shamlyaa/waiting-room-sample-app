const urlParams = new URLSearchParams(window.location.search);
const roomName = urlParams.get('room');

let connectionCount = 0;
let session = null;
let publisher = null;
let isPublishing = false;

function handleError(error) {
  if (error) {
    console.error(error);
  }
}

function handlePublisher() {
  console.log('[handlePublish]', connectionCount);
  if (!isPublishing && connectionCount === 1) {
    // todo publish twice the same stream explode everything
    session.publish(publisher, handleError);
  } else if (connectionCount === 0 && publisher) {
    session.unpublish(publisher);
  }
}

function initializeSession(data) {
  const { apiKey, sessionId, token } = data;
  console.log(data);
  session = OT.initSession(apiKey, sessionId);

  session.on('connectionCreated', function(event) {
    console.log('[connectionCreated]', connectionCount);
    console.log(event.connection);
    if (event.connection.connectionId !== session.connection.connectionId) {
      connectionCount += 1;
      handlePublisher();
    }
  });

  session.on('connectionDestroyed', function(event) {
    console.log('[connectionDestroyed]', connectionCount);
    if (event.connection.connectionId !== session.connection.connectionId) {
      connectionCount -= 1;
      handlePublisher();
    }
  });

  // Subscribe to a newly created stream
  session.on('streamCreated', function streamCreated(event) {
    var subscriberOptions = {
      insertMode: 'append',
      width: '100%',
      height: '100%'
    };
    session.subscribe(
      event.stream,
      'subscriber',
      subscriberOptions,
      handleError
    );
  });

  session.on('sessionDisconnected', function sessionDisconnected(event) {
    console.log('You were disconnected from the session.', event.reason);
  });

  // initialize the publisher
  var publisherOptions = {
    insertMode: 'append',
    width: '100%',
    height: '100%'
  };
  publisher = OT.initPublisher('publisher', publisherOptions, handleError);
  publisher.on('streamCreated', event => {
    console.log('[Publisher] - streamCreated', event.reason);
    isPublishing = true;
  });
  publisher.on('streamDestroyed', event => {
    console.log('[Publisher] - streamDestroyed', event.reason);
    event.preventDefault();
    isPublishing = false;
  });

  // Connect to the session
  session.connect(token, function callback(error) {
    if (error) {
      handleError(error);
    } else {
      console.log('Session Connected');
    }
  });
}

// initializeSession();
