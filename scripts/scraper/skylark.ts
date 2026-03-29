/**
 * すかいらーくグループ アレルゲンデータ スクレイパー
 * allergy.skylark.co.jp からデータを取得してJSON出力する
 */
import { chromium, type Browser, type Page } from "playwright";
import * as fs from "fs";
import * as path from "path";

const BRANDS = [
  { id: "bamiyan", nameJa: "バーミヤン", nameEn: "Bamiyan", brandCode: "170001", groupName: "すかいらーくグループ" },
  // 他のブランドは後で追加
  // { id: "gusto", nameJa: "ガスト", nameEn: "Gusto", brandCode: "010016", groupName: "すかいらーくグループ" },
];

const USAGE_TYPES = [
  { id: 1, nameJa: "店内メニュー", nameEn: "Dine-in" },
  // { id: 2, nameJa: "テイクアウト", nameEn: "Takeout" },
  // { id: 3, nameJa: "宅配メニュー", nameEn: "Delivery" },
];

const ALLERGEN_NAMES = ["そば", "落花生", "小麦", "卵", "乳", "えび", "かに", "くるみ"];

const BASE_URL = "https://allergy.skylark.co.jp/chart";

interface MenuItem {
  id: string;
  nameJa: string;
  allergens: Record<string, boolean>;
}

interface Category {
  id: string;
  nameJa: string;
  displayOrder: number;
  items: MenuItem[];
}

interface MenuData {
  brandId: string;
  usageType: number;
  scrapedAt: string;
  categories: Category[];
}

async function scrapeAllergenChart(page: Page, brandCode: string, usageType: number): Promise<Category[]> {
  const url = `${BASE_URL}?brand=${brandCode}&shop=&usage=${usageType}`;
  // Navigate through the SPA flow:
  // 1. Go to consideration page (entry point)
  // 2. Click "ブランド検索へ" to get to brand selection
  // 3. Click the target brand
  // 4. Click usage type (店内メニュー)
  // 5. Click "アレルギー物質一覧表はこちら" to get chart

  console.log("  Step 1: Loading consideration page...");
  await page.goto("https://allergy.skylark.co.jp/consideration", { waitUntil: "networkidle", timeout: 30000 });

  console.log("  Step 2: Clicking ブランド検索へ...");
  const searchBtn = page.locator('a[href*="consideration?mode=top"], a:has-text("ブランド検索へ")');
  if (await searchBtn.count() > 0) {
    await searchBtn.first().click();
    await page.waitForTimeout(2000);
  }

  console.log(`  Step 3: Selecting brand ${brandCode}...`);
  const brandBtn = page.locator(`button[value="${brandCode}"]`);
  await brandBtn.waitFor({ timeout: 10000 });
  await brandBtn.click();
  await page.waitForTimeout(2000);

  console.log(`  Step 4: Selecting usage type ${usageType}...`);
  // Click the usage type button (店内メニュー検索 for usage=1)
  const usageLabels = ["店内メニュー", "テイクアウト", "宅配メニュー"];
  const usageBtn = page.locator(`button:has-text("${usageLabels[usageType - 1]}")`);
  await usageBtn.waitFor({ timeout: 10000 });
  await usageBtn.click();
  await page.waitForTimeout(2000);

  console.log("  Step 5: Clicking アレルギー物質一覧表...");
  const chartLink = page.locator('a[href*="chart"]');
  await chartLink.waitFor({ timeout: 10000 });
  await chartLink.click();
  await page.waitForTimeout(3000);

  console.log(`  Current URL: ${page.url()}`);

  // Wait for table to render
  try {
    await page.waitForSelector("table tbody tr", { timeout: 15000 });
    console.log("  Table found, extracting data...");
  } catch {
    const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 300) || "empty");
    console.log(`  Warning: table not found. Page: ${bodyText.substring(0, 200)}`);
  }

  const categories = await page.evaluate((allergenNames: string[]) => {
    const tables = document.querySelectorAll("table");
    const cats: { nameJa: string; items: { nameJa: string; allergens: Record<string, boolean> }[] }[] = [];

    tables.forEach((table, idx) => {
      // Skip odd-index tables (responsive duplicates)
      if (idx % 2 !== 0) return;

      // Find category name from parent element
      let categoryName = "その他";
      let parent = table.parentElement;
      for (let i = 0; i < 5; i++) {
        if (parent) {
          const prev = parent.previousElementSibling;
          if (prev && prev.textContent) {
            const text = prev.textContent.trim().split("\n")[0].trim();
            if (text.length > 0 && text.length < 30) {
              categoryName = text;
              break;
            }
          }
          parent = parent.parentElement;
        }
      }

      const items: { nameJa: string; allergens: Record<string, boolean> }[] = [];
      table.querySelectorAll("tbody tr").forEach((tr) => {
        const th = tr.querySelector("th");
        if (!th) return;
        const name = th.textContent?.trim() || "";
        if (!name) return;

        const cells: string[] = [];
        tr.querySelectorAll("td").forEach((td) => cells.push(td.textContent?.trim() || ""));

        const allergens: Record<string, boolean> = {};
        allergenNames.forEach((allergen, i) => {
          allergens[allergen] = cells[i] === "●";
        });

        items.push({ nameJa: name, allergens });
      });

      if (items.length > 0) {
        cats.push({ nameJa: categoryName, items });
      }
    });

    return cats;
  }, ALLERGEN_NAMES);

  // Generate IDs
  let itemCounter = 1;
  return categories.map((cat, catIdx) => ({
    id: cat.nameJa.toLowerCase().replace(/[^a-zぁ-んァ-ヶ一-龠]/g, "_"),
    nameJa: cat.nameJa,
    displayOrder: catIdx + 1,
    items: cat.items.map((item) => ({
      id: `item-${String(itemCounter++).padStart(3, "0")}`,
      nameJa: item.nameJa,
      allergens: item.allergens,
    })),
  }));
}

async function main() {
  const dataDir = path.resolve(__dirname, "../../data");
  const menusDir = path.resolve(dataDir, "menus");

  console.log("Starting Skylark Group allergen scraper...\n");

  const browser: Browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    for (const brand of BRANDS) {
      console.log(`\nScraping: ${brand.nameJa} (${brand.brandCode})`);

      for (const usage of USAGE_TYPES) {
        console.log(`  Usage: ${usage.nameJa}`);

        const categories = await scrapeAllergenChart(page, brand.brandCode, usage.id);

        const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
        console.log(`  Found: ${categories.length} categories, ${totalItems} items`);

        const menuData: MenuData = {
          brandId: brand.id,
          usageType: usage.id,
          scrapedAt: new Date().toISOString(),
          categories,
        };

        const filename = `${brand.id}-${usage.id}.json`;
        const filepath = path.resolve(menusDir, filename);
        fs.writeFileSync(filepath, JSON.stringify(menuData, null, 2), "utf-8");
        console.log(`  Saved: data/menus/${filename}`);
      }
    }

    // Generate brands.json
    const brandsData = BRANDS.map((b) => ({
      id: b.id,
      nameJa: b.nameJa,
      nameEn: b.nameEn,
      brandCode: b.brandCode,
      groupName: b.groupName,
      sourceUrl: `https://allergy.skylark.co.jp/chart?brand=${b.brandCode}&usage=1`,
      usageTypes: USAGE_TYPES,
      lastScrapedAt: new Date().toISOString(),
    }));
    fs.writeFileSync(path.resolve(dataDir, "brands.json"), JSON.stringify(brandsData, null, 2), "utf-8");
    console.log("\nSaved: data/brands.json");

    // Generate allergens.json
    const allergensData = ALLERGEN_NAMES.map((name, i) => ({
      id: i + 1,
      nameJa: name,
      nameEn: ["Buckwheat", "Peanut", "Wheat", "Egg", "Milk", "Shrimp", "Crab", "Walnut"][i],
      category: "mandatory",
      displayOrder: i + 1,
    }));
    fs.writeFileSync(path.resolve(dataDir, "allergens.json"), JSON.stringify(allergensData, null, 2), "utf-8");
    console.log("Saved: data/allergens.json");

  } finally {
    await browser.close();
  }

  console.log("\nDone!");
}

main().catch(console.error);
