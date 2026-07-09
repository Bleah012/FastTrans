const canUpdateRequestStatus = (role) => ["admin", "manager"].includes(role);

const canDeleteRequest = (role) => role === "admin";

describe("Role access unit tests", () => {
  test("admin can update request status", () => {
    expect(canUpdateRequestStatus("admin")).toBe(true);
  });

  test("manager can update request status", () => {
    expect(canUpdateRequestStatus("manager")).toBe(true);
  });

  test("client cannot update request status", () => {
    expect(canUpdateRequestStatus("client")).toBe(false);
  });

  test("only admin can delete request", () => {
    expect(canDeleteRequest("admin")).toBe(true);
    expect(canDeleteRequest("manager")).toBe(false);
    expect(canDeleteRequest("client")).toBe(false);
  });
});