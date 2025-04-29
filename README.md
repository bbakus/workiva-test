# MTG Card Collection

A modern Angular application that displays Magic: The Gathering cards with details and external purchase links.

## Features

- Browse a collection of rare and valuable MTG cards
- View detailed information about each card
- Filter functionality for price ranges
- External links to purchase cards on Amazon
- Responsive design for all device sizes

## Screenshots

*Screenshots would be added here when available*

## Technology Stack

- Angular 17+ (Standalone Components)
- TypeScript
- RxJS
- CSS with modern animations and effects

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/mtg-collection.git
cd mtg-collection
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx ng serve
```

4. Open your browser and navigate to `http://localhost:4200`

## Project Structure

- `src/app/components` - All application components
  - `product-card` - Card display component for the main grid
  - `product-list` - List/grid view of all available cards
  - `product-detail` - Modal view showing detailed card information
- `src/app/models` - TypeScript interfaces
- `src/app/services` - Data and utility services
- `src/assets/data` - JSON data files with card information

## Development Notes

- Card data is stored in `src/assets/data/products.json`
- The application uses Angular's HttpClient to fetch the card data
- Styles use a consistent dark theme with purple/magenta accents

## Running the Tests

```bash
npm test
```

## Building for Production

```bash
npx ng build --prod
```

The build artifacts will be stored in the `dist/` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Card data and descriptions based on actual Magic: The Gathering cards
- All Magic: The Gathering imagery and card names are property of Wizards of the Coast
