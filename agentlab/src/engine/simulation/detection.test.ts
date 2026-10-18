import {describe, it, expect} from "vitest";
import {getDistance, canSeePlayer} from "./detection";

describe("AI player detection", () => {
    it("calculates the distance between two positions", () => {
        const agent = {x: 0, y: 0};
        const player = {x: 3, y: 4};

        const distance = getDistance(agent, player);

        expect(distance).toBe(5);
    });

    it("detects a player inside the detection range", () => {
        const agent = {x: 0, y: 0};
        const player = {x: 3, y: 4};

        const detected = canSeePlayer(agent, player, 6);

        expect(detected).toBe(true);
    });

    it("does not detect a player outside the detection range", () => {
        const agent = {x: 0, y: 0};
        const player = {x: 3, y: 4};

        const detected = canSeePlayer(agent, player, 4);

        expect(detected).toBe(false);
    })
})