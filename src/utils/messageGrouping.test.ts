import { describe, it, expect } from "vitest";
import { groupMessages, MESSAGE_GROUP_THRESHOLD_MS } from "./messageGrouping";

describe("messageGrouping", () => {
  const createMessage = (senderId: string, timestamp: number, id?: string) => ({
    id: id || `msg-${timestamp}`,
    senderId,
    timestamp,
    content: "test",
  });

  it("should mark single message as both first and last", () => {
    const messages = [createMessage("user1", 1000)];
    const grouped = groupMessages(messages);

    expect(grouped).toHaveLength(1);
    expect(grouped[0].isFirstInGroup).toBe(true);
    expect(grouped[0].isLastInGroup).toBe(true);
    expect(grouped[0].isMiddleInGroup).toBe(false);
  });

  it("should group consecutive messages from same sender within threshold", () => {
    const messages = [
      createMessage("user1", 1000),
      createMessage("user1", 2000), // 1s later
      createMessage("user1", 3000), // 2s later total
    ];
    const grouped = groupMessages(messages);

    // First message
    expect(grouped[0].isFirstInGroup).toBe(true);
    expect(grouped[0].isLastInGroup).toBe(false);
    expect(grouped[0].isMiddleInGroup).toBe(false);

    // Middle message
    expect(grouped[1].isFirstInGroup).toBe(false);
    expect(grouped[1].isMiddleInGroup).toBe(true);
    expect(grouped[1].isLastInGroup).toBe(false);

    // Last message
    expect(grouped[2].isFirstInGroup).toBe(false);
    expect(grouped[2].isMiddleInGroup).toBe(false);
    expect(grouped[2].isLastInGroup).toBe(true);
  });

  it("should NOT group messages from different senders", () => {
    const messages = [
      createMessage("user1", 1000),
      createMessage("user2", 2000),
      createMessage("user1", 3000),
    ];
    const grouped = groupMessages(messages);

    // All messages are separate groups (both first and last)
    expect(grouped[0].isFirstInGroup).toBe(true);
    expect(grouped[0].isLastInGroup).toBe(true);
    expect(grouped[0].isMiddleInGroup).toBe(false);

    expect(grouped[1].isFirstInGroup).toBe(true);
    expect(grouped[1].isLastInGroup).toBe(true);
    expect(grouped[1].isMiddleInGroup).toBe(false);

    expect(grouped[2].isFirstInGroup).toBe(true);
    expect(grouped[2].isLastInGroup).toBe(true);
    expect(grouped[2].isMiddleInGroup).toBe(false);
  });

  it("should NOT group messages beyond threshold", () => {
    const messages = [
      createMessage("user1", 0),
      createMessage("user1", MESSAGE_GROUP_THRESHOLD_MS + 1000), // 10min + 1s
    ];
    const grouped = groupMessages(messages);

    // Both are separate groups
    expect(grouped[0].isFirstInGroup).toBe(true);
    expect(grouped[0].isLastInGroup).toBe(true);

    expect(grouped[1].isFirstInGroup).toBe(true);
    expect(grouped[1].isLastInGroup).toBe(true);
  });

  it("should use custom threshold", () => {
    const customThreshold = 5000; // 5 seconds
    const messages = [
      createMessage("user1", 0),
      createMessage("user1", 4000), // Within 5s
      createMessage("user1", 10000), // Beyond 5s from previous
    ];
    const grouped = groupMessages(messages, customThreshold);

    // First two grouped
    expect(grouped[0].isFirstInGroup).toBe(true);
    expect(grouped[0].isLastInGroup).toBe(false);

    expect(grouped[1].isFirstInGroup).toBe(false);
    expect(grouped[1].isLastInGroup).toBe(true);

    // Third separate
    expect(grouped[2].isFirstInGroup).toBe(true);
    expect(grouped[2].isLastInGroup).toBe(true);
  });

  it("should handle empty array", () => {
    const grouped = groupMessages([]);
    expect(grouped).toEqual([]);
  });

  it("should handle two messages within threshold", () => {
    const messages = [
      createMessage("user1", 1000),
      createMessage("user1", 2000),
    ];
    const grouped = groupMessages(messages);

    expect(grouped[0].isFirstInGroup).toBe(true);
    expect(grouped[0].isLastInGroup).toBe(false);

    expect(grouped[1].isFirstInGroup).toBe(false);
    expect(grouped[1].isLastInGroup).toBe(true);
  });

  it("should handle messages at exact threshold boundary", () => {
    const messages = [
      createMessage("user1", 0),
      createMessage("user1", MESSAGE_GROUP_THRESHOLD_MS), // Exactly at threshold
    ];
    const grouped = groupMessages(messages);

    // Should be grouped (≤ threshold)
    expect(grouped[0].isFirstInGroup).toBe(true);
    expect(grouped[0].isLastInGroup).toBe(false);

    expect(grouped[1].isFirstInGroup).toBe(false);
    expect(grouped[1].isLastInGroup).toBe(true);
  });
});
