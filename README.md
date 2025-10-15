# QR Web - Aplikace pro publikování textu s QR kódem

## Co je hotovo

### ✅ Implementované funkce

1. **Webová aplikace s formulářem**
   - Jednoduchý formulář pro zadání textu
   - Moderní responzivní design
   - Validace vstupů

2. **Backend server (Node.js + Express)**
   - Endpoint `/api/publish` pro publikování textu
   - Generování unikátních ID pomocí nanoid
   - Ukládání dat do JSON souborů

3. **Automatické generování QR kódů**
   - QR kód se vytvoří pro každou publikovanou stránku
   - QR kód obsahuje přímý odkaz na stránku
   - Zobrazení QR kódu na začátku každé publikované stránky

4. **Publikační stránky**
   - Každý text má vlastní unikátní URL (`/p/{id}`)
   - Stránka zobrazuje QR kód nahoře a text dole
   - Responzivní design pro mobily i desktop

## Struktura projektu

```
qrweb/
├── package.json          # Závislosti a skripty
├── server.js            # Backend server
├── public/
│   └── index.html       # Hlavní stránka s formulářem
├── data/                # Ukládání publikovaných textů (generuje se automaticky)
└── .gitignore          # Ignorované soubory pro Git
```

## Jak aplikaci spustit

1. **Instalace závislostí:**
   ```bash
   npm install
   ```

2. **Spuštění serveru:**
   ```bash
   npm start
   ```

3. **Otevření v prohlížeči:**
   ```
   http://localhost:3000
   ```

## Jak aplikaci používat

1. Otevřete aplikaci v prohlížeči
2. Napište text, který chcete publikovat
3. Klikněte na tlačítko "Publikovat"
4. Získáte odkaz na publikovanou stránku
5. Na stránce najdete QR kód pro snadné sdílení

## Technologie

- **Backend:** Node.js, Express
- **QR kódy:** qrcode
- **Unikátní ID:** nanoid
- **Frontend:** Vanilla JavaScript, HTML5, CSS3

## Možnosti nasazení zdarma

- **Render.com** - automatické nasazení z GitHubu
- **Railway.app** - jednoduché CLI nasazení
- **Cyclic.sh** - optimalizované pro Node.js
- **Vercel** - s malými úpravami pro serverless

## Budoucí vylepšení (nejsou implementována)

- Databáze místo lokálních souborů
- Možnost editace/mazání textů
- Expirace starých textů
- Statistiky návštěvnosti
- Ochrana heslem