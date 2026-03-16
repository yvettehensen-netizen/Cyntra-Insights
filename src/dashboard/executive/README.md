# Executive Controlekamer (NL)

Deze map bevat de frontend + intelligence laag voor de route `/executive`.

## Inhoud
- `api/intelligenceApi.ts`: live datalaag naar `/intelligence/*` endpoints.
- `api/types.ts`: contracttypes voor de control room.
- `components/`: alle Executive Controlekamer-componenten.

## Kernprincipes
- Geen 14-analysekaarten in de primaire flow.
- Één primaire entry: **Start Executive Intelligence**.
- Maximaal 7 primaire visuals per executive scherm.
- Board Mode voor bestuurlijke samenvatting.
