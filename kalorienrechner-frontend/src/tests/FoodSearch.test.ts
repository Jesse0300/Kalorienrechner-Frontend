import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import FoodSearch from "@/components/fatSecretSearch.vue";

describe("FoodSearch.vue", () => {
  const baseProps = {
    mealType: "breakfast",
    query: "apple",
    results: [
      {
        id: 1,
        name: "Apple",
        calories: 52,
        carbs: 14,
        fat: 0,
        protein: 0,
      },
    ],
    loading: false,
    error: "",
    hasSearched: true,
    page: 0,
  };

  it("emits add payload when portion is valid", async () => {
    const wrapper = mount(FoodSearch as any, { props: baseProps });

    await wrapper.find("button.w-full.text-left").trigger("click");
    await wrapper.find('input[type="number"]').setValue("100");

    const addBtn = wrapper.find("button.w-full.px-4.py-3");
    expect((addBtn.element as HTMLButtonElement).disabled).toBe(false);

    await addBtn.trigger("click");

    const raw = wrapper.emitted("add");

    if (!raw || raw.length === 0 || !raw[0] || raw[0].length === 0) {
      throw new Error("Expected 'add' event to be emitted with payload");
    }

    const emitted = raw as unknown[][];
    const first = emitted[0];

    if (!first || first.length === 0) {
      throw new Error("Expected 'add' event payload");
    }

    type AddPayload = {
      item: any;
      portion: number;
      mealType: string;
    };

    const payload = first[0] as AddPayload;

    expect(payload.portion).toBe(100);
    expect(payload.mealType).toBe("breakfast");
  });
});
