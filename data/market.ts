export type GroupId =
  | "biznes"
  | "lacetti"
  | "cobalt"
  | "nexia3"
  | "spark"
  | "matiz";

export type KassaId = "kassa-1" | "kassa-2";

export type GroupTone =
  | "amber"
  | "blue"
  | "rose"
  | "sky"
  | "emerald"
  | "violet";

export type Group = {
  id: GroupId;
  name: string;
  spotRange: [number, number];
  tone: GroupTone;
};

export type Row = {
  cells: number[];
};

export type Band = {
  groupId: GroupId;
  rows: Row[];
};

export type Kassa = {
  id: KassaId;
  name: string;
  totalSpots: number;
  groups: Group[];
  bands: Band[];
};

export type Sector = {
  id: string;
  name: string;
  kassas: Kassa[];
};

export type Market = {
  name: string;
  sectors: Sector[];
};

const standardCells = [10, 12, 12, 12, 12, 12, 6];
const standardRow = (): Row => ({ cells: [...standardCells] });

export const market: Market = {
  name: "Авто бозор",
  sectors: [
    {
      id: "sector-1",
      name: "1-СЕКТОР",
      kassas: [
        {
          id: "kassa-1",
          name: "1-КАССА",
          totalSpots: 763,
          groups: [
            { id: "biznes", name: "Бизнес класс", spotRange: [1, 534], tone: "amber" },
            { id: "lacetti", name: "Lacetti", spotRange: [535, 763], tone: "blue" },
          ],
          bands: [
            {
              groupId: "biznes",
              rows: [{ cells: [12, 12, 12, 12, 12, 12, 6] }],
            },
            { groupId: "biznes", rows: [standardRow(), standardRow()] },
            { groupId: "biznes", rows: [standardRow(), standardRow()] },
            { groupId: "biznes", rows: [standardRow(), standardRow()] },
            { groupId: "lacetti", rows: [standardRow(), standardRow()] },
            {
              groupId: "lacetti",
              rows: [{ cells: [11, 12, 12, 12, 12, 12, 6] }],
            },
          ],
        },
        {
          id: "kassa-2",
          name: "2-КАССА",
          totalSpots: 608,
          groups: [
            { id: "cobalt", name: "Cobalt", spotRange: [1, 228], tone: "rose" },
            { id: "nexia3", name: "Nexia 3", spotRange: [229, 380], tone: "sky" },
            { id: "spark", name: "Spark", spotRange: [381, 532], tone: "violet" },
            { id: "matiz", name: "Matiz", spotRange: [533, 608], tone: "emerald" },
          ],
          bands: [
            { groupId: "cobalt", rows: [standardRow()] },
            { groupId: "cobalt", rows: [standardRow(), standardRow()] },
            { groupId: "nexia3", rows: [standardRow(), standardRow()] },
            { groupId: "spark", rows: [standardRow(), standardRow()] },
            { groupId: "matiz", rows: [standardRow()] },
          ],
        },
      ],
    },
  ],
};

export type CellInfo = {
  start: number;
  end: number;
  spots: number[];
};

export type RowInfo = {
  bandIndex: number;
  rowIndex: number;
  groupId: GroupId;
  start: number;
  end: number;
  cells: CellInfo[];
};

export type BandInfo = {
  bandIndex: number;
  groupId: GroupId;
  rows: RowInfo[];
  start: number;
  end: number;
};

export function computeBands(kassa: Kassa): BandInfo[] {
  const result: BandInfo[] = [];
  let counter = 1;
  for (let bandIndex = 0; bandIndex < kassa.bands.length; bandIndex++) {
    const band = kassa.bands[bandIndex];
    const bandStart = counter;
    const rows: RowInfo[] = [];
    for (let rowIndex = 0; rowIndex < band.rows.length; rowIndex++) {
      const row = band.rows[rowIndex];
      const rowStart = counter;
      const cells: CellInfo[] = [];
      for (const size of row.cells) {
        const start = counter;
        const end = counter + size - 1;
        const spots = Array.from({ length: size }, (_, i) => start + i);
        cells.push({ start, end, spots });
        counter += size;
      }
      rows.push({
        bandIndex,
        rowIndex,
        groupId: band.groupId,
        start: rowStart,
        end: counter - 1,
        cells,
      });
    }
    result.push({
      bandIndex,
      groupId: band.groupId,
      rows,
      start: bandStart,
      end: counter - 1,
    });
  }
  return result;
}

export function getKassa(id: KassaId): Kassa | undefined {
  for (const sector of market.sectors) {
    for (const kassa of sector.kassas) {
      if (kassa.id === id) return kassa;
    }
  }
  return undefined;
}

export function getAllKassas(): Kassa[] {
  return market.sectors.flatMap((s) => s.kassas);
}

export function getGroupForSpot(
  kassa: Kassa,
  spotNumber: number
): Group | undefined {
  return kassa.groups.find(
    (g) => spotNumber >= g.spotRange[0] && spotNumber <= g.spotRange[1]
  );
}

export function totalSpots(kassa: Kassa): number {
  return kassa.bands.reduce(
    (sum, band) =>
      sum +
      band.rows.reduce(
        (rs, row) => rs + row.cells.reduce((cs, c) => cs + c, 0),
        0
      ),
    0
  );
}
