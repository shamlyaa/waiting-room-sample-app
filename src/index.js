import { Host } from './Host';
import { Participant } from './Participant';

(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomName = urlParams.get('room');
  if (window.location.pathname === '/host') {
    const host = new Host(roomName);
    host.init();
  } else if (window.location.pathname === '/participant') {
    const participant = new Participant(roomName);
    participant.init();
  }
})();
