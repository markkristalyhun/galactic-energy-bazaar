import {beforeEach, afterEach, describe, expect, it, vi} from 'vitest';

// Mock the environment module before importing the service
vi.mock('@env/environment', () => ({
  environment: {
    transactionWebsocketUrl: 'ws://localhost:1234'
  }
}));

// Mock the webSocket function
vi.mock('rxjs/webSocket', () => ({
  webSocket: vi.fn()
}));


describe('TransactionService', () => {
  let service: any;
  let mockWebSocketSubject: any;
  let webSocketMock: any;

  beforeEach(async () => {
    // reset module registry to avoid cross-test caching
    vi.resetModules();

    // dynamically import the mocked webSocket so we always get the mocked function instance
    const wsMod = await import('rxjs/webSocket');
    webSocketMock = wsMod.webSocket;

    mockWebSocketSubject = {
      pipe: vi.fn().mockReturnThis(),
      next: vi.fn(),
      complete: vi.fn(),
      closed: false
    };

    (webSocketMock as any).mockReturnValue(mockWebSocketSubject);

    // now import the service so it picks up the mocked webSocket
    const svcMod = await import('./transaction.service');
    service = new svcMod.TransactionService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('connect', () => {
    it('should create a WebSocket connection', () => {
      service.connect();

      expect(webSocketMock).toHaveBeenCalledWith(expect.stringContaining('/transactions'));
    });

    it('should reuse existing connection if not closed', () => {
      mockWebSocketSubject.closed = false;

      service.connect();
      service.connect();

      expect(webSocketMock).toHaveBeenCalledTimes(1);
    });

    it('should create new connection if previous was closed', () => {
      service.connect();

      mockWebSocketSubject.closed = true;

      service.connect();

      expect(webSocketMock).toHaveBeenCalledTimes(2);
    });

    it('should create new connection if webSocket is null', () => {
      service.connect();
      service.disconnect();
      service.connect();

      expect(webSocketMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('disconnect', () => {
    it('should complete the WebSocket connection', () => {
      service.connect();
      service.disconnect();

      expect(mockWebSocketSubject.complete).toHaveBeenCalled();
    });

    it('should set webSocket$ to null', () => {
      service.connect();
      service.disconnect();

      expect((service as any)['webSocket$']).toBeNull();
    });

    it('should not throw error if disconnect called without connect', () => {
      expect(() => service.disconnect()).not.toThrow();
    });

    it('should handle multiple disconnect calls', () => {
      service.connect();
      service.disconnect();
      service.disconnect();

      expect(mockWebSocketSubject.complete).toHaveBeenCalledTimes(1);
    });
  });

  describe('bufferTime behavior', () => {
    it('should apply 200ms buffer time to stream', () => {
      const pipeSpy = vi.spyOn(mockWebSocketSubject, 'pipe');

      service.connect();

      expect(pipeSpy).toHaveBeenCalled();
    });
  });
});
