import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import App from "./App";

describe("FastTrans App", () => {
  test("renders FastTrans brand name", () => {
    render(<App />);

    expect(screen.getAllByText(/FastTrans/i).length).toBeGreaterThan(0);
  });
});