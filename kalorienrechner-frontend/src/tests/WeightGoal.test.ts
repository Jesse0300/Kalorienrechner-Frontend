import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import WeightGoal from "@/views/WeightGoal.vue";

describe("WeightGoal.vue", () => {
  it("emits goal-update when calculation is triggered with valid weight", async () => {
    vi.stubGlobal("alert", vi.fn());

    const wrapper = mount(WeightGoal);

    const weightInput = wrapper.find('input[type="number"]');
    await weightInput.setValue("80");


    const btn = wrapper.find("button");
    await btn.trigger("click");

    const emitted = wrapper.emitted("goal-update");

    if (!emitted || emitted.length === 0 || !emitted[0] || emitted[0].length === 0) {
      throw new Error("Expected 'goal-update' event to be emitted with payload");
    }

    const payload = emitted[0][0] as any;

    expect(payload.weight).toBe(80);
    expect(payload.targetCalories).toBeTypeOf("number");
    expect(payload.targetCalories).toBeGreaterThan(0);

    expect(payload.macros).toBeTruthy();
    expect(payload.macros.protein).toBeTypeOf("number");
    expect(payload.macros.carbs).toBeTypeOf("number");
    expect(payload.macros.fat).toBeTypeOf("number");
  });
});
