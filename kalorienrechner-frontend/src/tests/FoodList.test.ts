import { describe, it, expect, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import FoodList from "@/components/ui/FoodList.vue";
import { api } from "@/service/api";

// api.get mocken (weil FoodList onMounted api.get("/foods") macht)
vi.mock("@/service/api", () => ({
  api: {
    get: vi.fn(),
  },
}));

describe("FoodList.vue", () => {
  it("loads foods from api and renders them", async () => {
    // Arrange: API gibt Foods zurück
    (api.get as any).mockResolvedValue({
      data: [
        { id: 1, name: "Apple", calories: 52 },
        { id: 2, name: "Banana", calories: 89 },
      ],
    });

    // Act
    const wrapper = mount(FoodList);

    // onMounted + Promise abwarten
    await flushPromises();

    // Assert: API wurde korrekt aufgerufen
    expect(api.get).toHaveBeenCalledWith("/foods");

    // Assert: Inhalte werden gerendert
    const text = wrapper.text();
    expect(text).toContain("Lebensmittel");
    expect(text).toContain("Apple");
    expect(text).toContain("52");
    expect(text).toContain("Banana");
    expect(text).toContain("89");
  });
});
