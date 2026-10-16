import {describe, it, expect} from "vitest";
import { executeSelector } from "./executeSelector";

describe("Selector execution", () => {
    it("returns success when a child succeeds after a failure", () => {
        const result = executeSelector([
            "failure",
            "success",
            "failure",
        ]);

        expect(result).toBe("success");
    });

    it("returns failure when all children fail", () => {
        const result = executeSelector([
            "failure",
            "failure",
            "failure",
        ]);

        expect(result).toBe("failure");
    });

    it("returns running when a child is still executing", () => {
        const result = executeSelector([
            "failure",
            "running",
            "success",
        ]);
        expect(result).toBe("running")
    });
});