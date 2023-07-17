type ShipSize = 1 | 2 | 3 | 4;
type ShipNum = number;

const shipsConfig: Map<ShipSize, ShipNum> = new Map([
    [1, 4],
    [2, 3],
    [3, 2],
    [4, 1],
]);
const FIELD_SIZE = 10;
const botTurnTimeout = 500;

export { shipsConfig, FIELD_SIZE, botTurnTimeout };
