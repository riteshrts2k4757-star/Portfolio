import { generatePairingCode } from './pairingManager.js';

export class SessionManager {
  constructor() {
    this.sessions = new Map(); // code -> { browserWs, phoneWs }
  }

  createSession(browserWs) {
    let code;
    do {
      code = generatePairingCode();
    } while (this.sessions.has(code));

    this.sessions.set(code, {
      browserWs,
      phoneWs: null,
      lastPing: Date.now()
    });

    return code;
  }

  pairPhone(code, phoneWs) {
    const session = this.sessions.get(code);
    if (session) {
      if (session.phoneWs) {
        // Disconnect old phone if exists
        try { session.phoneWs.close(); } catch (e) {}
      }
      session.phoneWs = phoneWs;
      return true;
    }
    return false;
  }

  getSessionByCode(code) {
    return this.sessions.get(code);
  }

  getSessionByWs(ws) {
    for (const [code, session] of this.sessions.entries()) {
      if (session.browserWs === ws || session.phoneWs === ws) {
        return { code, session };
      }
    }
    return null;
  }

  removeSession(code) {
    const session = this.sessions.get(code);
    if (session) {
      if (session.browserWs) try { session.browserWs.close(); } catch (e) {}
      if (session.phoneWs) try { session.phoneWs.close(); } catch (e) {}
      this.sessions.delete(code);
    }
  }
}
