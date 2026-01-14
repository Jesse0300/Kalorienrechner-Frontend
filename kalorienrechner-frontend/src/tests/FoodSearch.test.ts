import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import FoodSearch from "@/components/ui/FoodSearch.vue";

describe("FoodSearch.vue", () => {
  it("emits add payload when portion is valid", async () => {
    // jsdom hat kein alert() → stubben, sonst stderr / ggf. Fail
    vi.stubGlobal("alert", vi.fn());

    const baseProps = {
      mealType: "breakfast",
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

    // 1) Item auswählen (sonst wird unten der Add-Bereich gar nicht gerendert)
    //    In deiner Komponente ist jedes Result ein <button ... @click="selectedId = food.id">
    const resultButtons = wrapper.findAll('button[type="button"]');
    expect(resultButtons.length).toBeGreaterThan(0);

    // Der erste button ist i.d.R. ein Filter-Button ("Alle") – wir klicken gezielt den Result-Button:
    // Wir suchen einen Button, der den Food-Namen enthält.
    const itemBtn = resultButtons.find((b) => b.text().includes("Apple"));
    expect(itemBtn).toBeTruthy();
    await itemBtn!.trigger("click");

    // 2) Portion setzen (Input existiert erst nach Auswahl)
    const portionInput = wrapper.find('input[type="number"]');
    expect(portionInput.exists()).toBe(true);
    await portionInput.setValue("100");

    // 3) Add Button klicken (existiert erst nach Auswahl)
    //    Der Button ist im Footer: type="button" und Text enthält "hinzufügen"
    const addBtn = wrapper
      .findAll('button[type="button"]')
      .find((b) => b.text().toLowerCase().includes("hinzufügen"));
    expect(addBtn).toBeTruthy();
    await addBtn!.trigger("click");

    // 4) Emit prüfen
    const emitted = wrapper.emitted("add") as unknown as any[][] | undefined;
    expect(emitted).toBeTruthy();
    expect(emitted!.length).toBeGreaterThan(0);

    const payload = emitted![0][0] as { item: any; portion: number; mealType: string };

    expect(payload.portion).toBe(100);
    expect(payload.mealType).toBe("breakfast");
    expect(payload.item).toBeTruthy();
    expect(payload.item.name).toBe("Apple");
  });
});
