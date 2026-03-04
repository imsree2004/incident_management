import { jest } from '@jest/globals';

const mockDetectIssueType = jest.fn();
const mockSendMail = jest.fn();
const mockHandleAIResponse = jest.fn();

// 🔹 Mock issue detector
jest.unstable_mockModule('../utils/issueDetector.js', () => ({
  detectIssueType: mockDetectIssueType
}));

// 🔹 Mock templates
jest.unstable_mockModule('../utils/autoResponseTemplates.js', () => ({
  autoResponseTemplates: {
    DELIVERY: {
      subject: "Delivery Update",
      body: "Your order is on the way."
    }
  }
}));

// 🔹 Mock mailer
jest.unstable_mockModule('../services/mailer.js', () => ({
  sendMail: mockSendMail
}));

// 🔹 Mock AI responder
jest.unstable_mockModule('../services/aiResponder.js', () => ({
  handleAIResponse: mockHandleAIResponse
}));

let handleAutoResponse;

beforeAll(async () => {
  const module = await import('../services/autoResponder.js');
  handleAutoResponse = module.handleAutoResponse;
});

describe("Auto Response Module", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should NOT respond for High severity", async () => {
    const complaint = {
      severity: 'High',
      autoResponseSent: false
    };

    await handleAutoResponse(complaint);

    expect(mockSendMail).not.toHaveBeenCalled();
    expect(mockHandleAIResponse).not.toHaveBeenCalled();
  });

  test("Should send TEMPLATE response for Low severity", async () => {
    mockDetectIssueType.mockReturnValue('DELIVERY');

    const complaint = {
      id: 1,
      severity: 'Low',
      autoResponseSent: false,
      from: 'user@test.com',
      subject: 'Where is my order?',
      body: '',
      save: jest.fn()
    };

    await handleAutoResponse(complaint);

    expect(mockSendMail).toHaveBeenCalled();
    expect(complaint.status).toBe('Auto-Handled');
    expect(complaint.autoResponseSent).toBe(true);
    expect(complaint.autoResponseType).toBe('TEMPLATE');
    expect(complaint.save).toHaveBeenCalled();
  });

  test("Should call AI when no template exists", async () => {
    mockDetectIssueType.mockReturnValue('UNKNOWN');

    const complaint = {
      severity: 'Low',
      autoResponseSent: false,
      subject: 'Random issue',
      body: '',
      save: jest.fn()
    };

    await handleAutoResponse(complaint);

    expect(mockHandleAIResponse).toHaveBeenCalled();
  });

  test("Should NOT respond if already auto responded", async () => {
    const complaint = {
      severity: 'Low',
      autoResponseSent: true
    };

    await handleAutoResponse(complaint);

    expect(mockSendMail).not.toHaveBeenCalled();
    expect(mockHandleAIResponse).not.toHaveBeenCalled();
  });

});