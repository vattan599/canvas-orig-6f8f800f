# Welcome to your AI Studio project

This project was built with AI Studio.

## Development

Prefer working locally? You need Node.js and npm.

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Paratha Land site

This project is the Paratha Land website (Langley, BC): `/` is the home page with the 3D aloo paratha story, menu and pickup ordering, rewards and FAQ, and `/catering` is the catering and food truck booking page.

- Menu items, prices, coupon codes and the GoHighLevel webhook URLs are at the top of `paratha/build.py`.
- After editing anything in `paratha/`, run `python3 paratha/build_studio.py`. It regenerates `src/paratha/` (page markup, CSS, structured data and the browser scripts).
- Search files live in `public/`: `robots.txt`, `sitemap.xml`, `llms.txt` and `og-image.jpg`.
