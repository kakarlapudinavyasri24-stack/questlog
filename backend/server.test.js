const { buildChroniclePrompt, mockChronicle, normalizeTaskType } = require("./server");

describe("QuestLog backend", () => {
  it("normalizes unknown quest types to daily", () => {
    expect(normalizeTaskType("main")).toBe("main");
    expect(normalizeTaskType("side")).toBe("side");
    expect(normalizeTaskType("anything-else")).toBe("daily");
  });

  it("builds a chronicle that reflects completed quest context", () => {
    const story = mockChronicle(
      [
        {
          id: "1",
          title: "Finish the compliance pass",
          type: "main",
          status: "completed"
        }
      ],
      {
        title: "Champion",
        hp: 100,
        streak: 3,
        completionRate: 100
      }
    );

    expect(story).toContain("Champion");
    expect(story).toContain("Finish the compliance pass");
    expect(story).toContain("3-day");
  });

  it("builds an AI prompt from quest and game state", () => {
    const prompt = buildChroniclePrompt(
      [
        {
          id: "1",
          title: "Ship the release checklist",
          type: "main",
          status: "completed"
        },
        {
          id: "2",
          title: "Refill the potion shelf",
          type: "daily",
          status: "active"
        }
      ],
      {
        title: "Adventurer",
        hp: 88,
        streak: 4,
        completionRate: 50
      }
    );

    expect(prompt).toContain("Adventurer");
    expect(prompt).toContain("HP: 88");
    expect(prompt).toContain("Ship the release checklist");
    expect(prompt).toContain("Refill the potion shelf");
  });
});
