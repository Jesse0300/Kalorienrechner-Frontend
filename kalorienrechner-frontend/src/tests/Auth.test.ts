import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Auth from "@/components/ui/Auth.vue";

// ✅ Auth-Service mocken
vi.mock("@/service/auth", () => ({
  login: vi.fn(async () => {}),
  register: vi.fn(async () => {}),
}));

describe("Auth.vue", () => {
  it("disables submit if email is invalid", async () => {
    const wrapper = mount(Auth);

    await wrapper.find('input[type="email"]').setValue("not-an-email");
    await wrapper.find('input[type="password"]').setValue("123456");

    const btn = wrapper.find('button[type="submit"]');
    expect((btn.element as HTMLButtonElement).disabled).toBe(true);
  });

  it("shows error if password is too short", async () => {
    const wrapper = mount(Auth);

    await wrapper.find('input[type="email"]').setValue("test@test.de");
    await wrapper.find('input[type="password"]').setValue("123");

    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.text().toLowerCase()).toContain("passwort");
  });
});
