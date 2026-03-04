import { jest } from '@jest/globals';

const mockCreate = jest.fn();
const mockFindOne = jest.fn();

let mockSearchResults = []; // 🔥 control inbox per test

// 🔹 Mock Complaint model
jest.unstable_mockModule('../models/Complaint.js', () => ({
  default: {
    create: mockCreate,
    findOne: mockFindOne
  }
}));

// 🔹 Mock mailparser
jest.unstable_mockModule('mailparser', () => ({
  simpleParser: jest.fn(() => Promise.resolve({
    messageId: '123',
    from: { value: [{ address: 'test@gmail.com' }] },
    subject: 'Test Subject',
    text: 'Test Body',
    attachments: [],
    date: new Date()
  }))
}));

// 🔹 Mock node-imap
class FakeImap {
  constructor() {}

  once(event, cb) {
    if (event === 'ready') setTimeout(cb, 10);
  }

  openBox(name, readOnly, cb) { cb(null); }

  search(criteria, cb) { cb(null, mockSearchResults); }

  fetch() {
    return {
      on: (event, cb) => {
        if (event === 'message') {
          cb({
            on: (type, bodyCb) => {
              if (type === 'body') bodyCb({});
            }
          });
        }
      },
      once: (event, cb) => {
        if (event === 'end') setTimeout(cb, 20);
      }
    };
  }

  connect() {}
  end() {}
}

jest.unstable_mockModule('node-imap', () => ({
  default: FakeImap
}));

let fetchEmailsInternal;

beforeAll(async () => {
  const module = await import('../services/emailFetcher.js');
  fetchEmailsInternal = module.fetchEmailsInternal;
});

describe("Email Fetcher Module", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should resolve when no new emails", async () => {
    mockSearchResults = []; // ✅ empty inbox

    const result = await fetchEmailsInternal();
    expect(result).toBe("No new emails");
  });

  test("Should create complaint when new email arrives", async () => {
    mockSearchResults = [1]; // ✅ simulate email

    mockFindOne.mockResolvedValue(null); // no duplicate

    mockCreate.mockResolvedValue({
      save: jest.fn() // 🔥 IMPORTANT
    });

    await fetchEmailsInternal();

    expect(mockCreate).toHaveBeenCalled();
  });

});