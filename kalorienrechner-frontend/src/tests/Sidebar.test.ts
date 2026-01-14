import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Sidebar from "@/components/ui/Sidebar.vue";

describe("Sidebar.vue", () => {
  it("highlights current view", () => {
    const wrapper = mount(Sidebar as any, {
      props: {
        currentView: "statistics",
        userGoalData: null,
        currentUserLabel: "Test User",
      },
    });

    // Button "Statistiken" sollte active class haben
    const buttons = wrapper.findAll("nav button");
    const statsBtn = buttons.find((b) => b.text().includes("Statistiken"));
    expect(statsBtn).toBeTruthy();
    expect(statsBtn!.classes().join(" ")).toContain("bg-cyan-50");
  });
});
