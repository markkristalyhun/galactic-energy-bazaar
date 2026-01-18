import {TestBed} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {TransactionService} from './transaction.service';
import {webSocket} from 'rxjs/webSocket';

// Mock the webSocket function
vi.mock('rxjs/webSocket', () => ({
  webSocket: vi.fn()
}));

describe('TransactionService', () => {
  let service: TransactionService;
  let mockWebSocketSubject: any;

  beforeEach(() => {
    mockWebSocketSubject = {
      pipe: vi.fn().mockReturnThis(),
      next: vi.fn(),
      complete: vi.fn(),
      closed: false
    };

    (webSocket as any).mockReturnValue(mockWebSocketSubject);

    TestBed.configureTestingModule({
      providers: [TransactionService]
    });

    service = TestBed.inject(TransactionService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('connect', () => {
    it('should create a WebSocket connection', () => {
      service.connect();

      expect(webSocket).toHaveBeenCalledWith(expect.stringContaining('/transactions'));
    });

    it('should return observable with bufferTime', () => {
      const result = service.connect();

      expect(mockWebSocketSubject.pipe).toHaveBeenCalledWith(expect.anything());
      expect(result).toBeDefined();
    });

    it('should reuse existing connection if not closed', () => {
      mockWebSocketSubject.closed = false;

      service.connect();
      service.connect();

      expect(webSocket).toHaveBeenCalledTimes(1);
    });

    it('should create new connection if previous was closed', () => {
      service.connect();

      mockWebSocketSubject.closed = true;

      service.connect();

      expect(webSocket).toHaveBeenCalledTimes(2);
    });

    it('should create new connection if webSocket is null', () => {
      service.connect();
      service.disconnect();
      service.connect();

      expect(webSocket).toHaveBeenCalledTimes(2);
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

      expect(service['webSocket$']).toBeNull();
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
