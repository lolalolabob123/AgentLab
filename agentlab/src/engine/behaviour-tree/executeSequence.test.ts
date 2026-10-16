import {describe, it, expect} from "vitest";
import { executeSequence } from "./executeSequence";


describe("Sequence execution", () => {
    it("returns success when all children succeed", () => {
        const result = executeSequence([
            "success",
            "success",
            "success",
        ]);

        expect(result).toBe("success");
    });

    it("returns failure when a child fails", () => {
        const result = executeSequence([
            "success",
            "failure",
            "success",
        ]);

        expect(result).toBe("failure");
    });

    it("returns running when a child is still executing", () => {
        const result = executeSequence([
            "success",
            "running",
            "failure",
        ]);

        expect(result).toBe("running");
    });
});