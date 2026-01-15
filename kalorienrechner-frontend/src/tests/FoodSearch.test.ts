import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import FoodSearch from "@/components/ui/FoodSearch.vue";
import type { MealType } from "@/types/FoodSearchTypes";

describe("FoodSearch.vue", () => {
  it("emits add payload when portion is valid", async () => {
    // jsdom hat kein alert()
    vi.stubGlobal("alert", vi.fn());

    const mealType: MealType = "breakfast";

    const baseProps = {
      mealType,
      query: "apple",
      loading: false,
      error: "",
      hasSearched: true,
      page: 0,
      results: [
        {
          id: 1,
          name: "Apple",
          description: "raw",
          calories: 52,
          carbs: 14,
          fat: 0.2,
          protein: 0.3,
        },
      ],
    };

    const wrapper = mount(FoodSearch, { props: baseProps });

    // 1) Result-Item auswählen (sonst wird der Add-Bereich nicht gerendert)
    const buttons = wrapper.findAll('button[type="button"]');
    const itemBtn = buttons.find((b) => b.text().includes("Apple"));
    expect(itemBtn, "Expected result item button to exist").toBeTruthy();
    await itemBtn!.trigger("click");

    // 2) Portion setzen
    const portionInput = wrapper.find('input[type="number"]');
    expect(portionInput.exists()).toBe(true);
    await portionInput.setValue("100");

    // 3) Add-Button klicken (Text enthält "hinzufügen")
    const addBtn = wrapper
      .findAll('button[type="button"]')
      .find((b) => b.text().toLowerCase().includes("hinzufügen"));
    expect(addBtn, "Expected add button to exist").toBeTruthy();
    await addBtn!.trigger("click");

    // 4) Emit prüfen (TS-safe guards)
    const raw = wrapper.emitted("add");
    if (!raw || raw.length === 0) {
      throw new Error("Expected 'add' event to be emitted with payload");
    }
    if (!raw[0] || raw[0].length === 0) {
      throw new Error("Expected first 'add' emission to contain payload");
    }

    type AddPayload = { item: any; portion: number; mealType: MealType };
    const payload = raw[0][0] as AddPayload;

    expect(payload.portion).toBe(100);
    expect(payload.mealType).toBe("breakfast");
    expect(payload.item?.name).toBe("Apple");
  });
});
