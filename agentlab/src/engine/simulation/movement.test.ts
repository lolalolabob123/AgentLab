import {describe, it, expect} from "vitest";
import { moveTowards } from "./movement";

describe("AI movement", () => {
    it("moves the agent toward a target", () => {
        const result = moveTowards(
            {x: 100, y: 100},
            {x: 200, y: 100},
            50,
            1
        );

        expect(result).toEqual({
            x: 150,
            y: 100,
        });
    });

    it("does not overshoot the target", () => {
        const result = moveTowards(
            {x: 100, y: 100},
            {x: 120, y: 100},
            50,
            1
        );

        expect(result).toEqual({
            x: 120,
            y: 100,
        });
    });

    it("remains stationary when already at the target", () => {
        const position = {x: 100, y: 100};

        const result = moveTowards(
            position,
            position,
            50,
            1
        );

        expect(result).toBe(position);
    });
});