vi.mock("../toast.utils", () => ({
  toastError: vi.fn(),
}));
describe("backendFetch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("calls handleUnauthorized when API responds with 401", async () => {
    const backendUtils = await import("../backend.utils");
    const toastUtils = await import("../toast.utils");

    // @ts-expect-error - jsdom global fetch override
    global.fetch = vi.fn().mockResolvedValue({
      status: 401,
      ok: false,
      json: () => Promise.resolve({ message: "Expired" }),
    });

    await expect(backendUtils.backendFetch("/api/protected")).rejects.toThrow(
      "Unauthorized - Session expired"
    );
    expect(toastUtils.toastError).toHaveBeenCalledWith(
      "Session expired. Please log in again."
    );
  });
});
