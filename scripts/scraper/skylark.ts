/**
 * すかいらーくグループ アレルゲンデータ スクレイパー
 * allergy.skylark.co.jp から全ブランドのデータを取得してJSON出力する
 */
import { chromium, type Browser, type Page } from "playwright";
import * as fs from "fs";
import * as path from "path";

// Step 1で取得した全ブランドコード
const BRANDS: { id: string; nameJa: string; brandCode: string; type: "brand" | "shop" }[] = [
  { id: "gusto", nameJa: "ガスト", brandCode: "010016", type: "brand" },
  { id: "bamiyan", nameJa: "バーミヤン", brandCode: "170001", type: "brand" },
  { id: "shabuyou", nameJa: "しゃぶ葉", brandCode: "190010", type: "brand" },
  { id: "yumean", nameJa: "夢庵", brandCode: "130002", type: "brand" },
  { id: "jonathans", nameJa: "ジョナサン", brandCode: "020001", type: "brand" },
  { id: "steakgusto", nameJa: "ステーキガスト", brandCode: "010042", type: "brand" },
  { id: "musashinomori", nameJa: "むさしの森珈琲", brandCode: "190011", type: "brand" },
  { id: "karayoshi", nameJa: "から好し", brandCode: "010221", type: "brand" },
  { id: "aiya", nameJa: "藍屋", brandCode: "130001", type: "brand" },
  { id: "laohana", nameJa: "La Ohana", brandCode: "190012", type: "brand" },
  { id: "tonkaratei", nameJa: "とんから亭", brandCode: "010217", type: "brand" },
  { id: "chawan", nameJa: "chawan", brandCode: "010207", type: "brand" },
  { id: "totoyamichi", nameJa: "魚屋路", brandCode: "010006", type: "brand" },
  { id: "momona", nameJa: "桃菜", brandCode: "010046", type: "brand" },
  { id: "grazie", nameJa: "グラッチェガーデンズ", brandCode: "010035", type: "brand" },
  // 個店（shop=パラメータ）
  { id: "hachirosoba", nameJa: "八郎そば", brandCode: "131011", type: "shop" },
  { id: "yumean-shokudo", nameJa: "ゆめあん食堂", brandCode: "131001", type: "shop" },
  { id: "sanmarusan", nameJa: "三○三", brandCode: "130489", type: "shop" },
];

const USAGE_TYPES = [
  { id: 1, nameJa: "店内メニュー" },
];

const ALLERGEN_NAMES = ["そば", "落花生", "小麦", "卵", "乳", "えび", "かに", "くるみ"];
const GROUP_NAME = "すかいらーくグループ";

interface ScrapedItem {
  nameJa: string;
  allergens: Record<string, boolean>;
}

interface ScrapedCategory {
  nameJa: string;
  items: ScrapedItem[];
}

async function navigateToChart(page: Page, brandCode: string, brandType: "brand" | "shop"): Promise<boolean> {
  try {
    // Step 1: 留意事項ページ
    await page.goto("https://allergy.skylark.co.jp/consideration", { waitUntil: "networkidle", timeout: 30000 });

    // Step 2: ブランド検索へ
    const searchBtn = page.locator('a[href*="consideration?mode=top"], a:has-text("ブランド検索へ")');
    if (await searchBtn.count() > 0) {
      await searchBtn.first().click();
      await page.waitForTimeout(2000);
    }

    // Step 3: ブランド選択
    if (brandType === "brand") {
      const brandBtn = page.locator(`button[value="${brandCode}"]`);
      await brandBtn.waitFor({ timeout: 10000 });
      await brandBtn.click();
    } else {
      // 個店は data-href で遷移
      const shopBtn = page.locator(`button[data-href="scene?shop=${brandCode}"]`);
      await shopBtn.waitFor({ timeout: 10000 });
      await shopBtn.click();
    }
    await page.waitForTimeout(2000);

    // Step 4: 利用シーン（店内メニュー）
    const usageBtn = page.locator('button:has-text("店内メニュー")');
    if (await usageBtn.count() > 0) {
      await usageBtn.first().click();
      await page.waitForTimeout(2000);
    }

    // Step 5: 一覧表リンク
    const chartLink = page.locator('a[href*="chart"]');
    if (await chartLink.count() > 0) {
      await chartLink.first().click();
    }

    // テーブルデータが出るまでポーリング
    for (let attempt = 0; attempt < 20; attempt++) {
      await page.waitForTimeout(1500);
      const count = await page.evaluate(() => document.querySelectorAll("table tbody tr th").length);
      if (count > 0) return true;
    }
    console.log(`  Debug: tables exist but no data rows after polling`);
    return false;
  } catch (e: any) {
    console.log(`  Error: ${e.message}`);
    return false;
  }
}

async function extractTableData(page: Page): Promise<ScrapedCategory[]> {
  return await page.evaluate((allergenNames: string[]) => {
    const tables = document.querySelectorAll("table");
    const cats: ScrapedCategory[] = [];

    tables.forEach((table, idx) => {
      if (idx % 2 !== 0) return;

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

      const items: ScrapedItem[] = [];
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
}

async function main() {
  const dataDir = path.resolve(__dirname, "../../data");
  const menusDir = path.resolve(dataDir, "menus");
  fs.mkdirSync(menusDir, { recursive: true });

  const targetBrand = process.argv[2]; // 特定ブランドだけ実行する場合
  const brandsToScrape = targetBrand
    ? BRANDS.filter((b) => b.id === targetBrand)
    : BRANDS;

  console.log(`Starting Skylark Group scraper (${brandsToScrape.length} brands)...\n`);

  const browser = await chromium.launch({ headless: true });
  const results: { id: string; nameJa: string; items: number; success: boolean }[] = [];

  try {
    for (const brand of brandsToScrape) {
      console.log(`\n[${ brandsToScrape.indexOf(brand) + 1}/${brandsToScrape.length}] ${brand.nameJa} (${brand.brandCode})`);

      const page = await browser.newPage();

      try {
        const success = await navigateToChart(page, brand.brandCode, brand.type);

        if (!success) {
          console.log(`  ⚠ テーブルが見つかりません。スキップします。`);
          results.push({ id: brand.id, nameJa: brand.nameJa, items: 0, success: false });
          await page.close();
          continue;
        }

        const categories = await extractTableData(page);

        let itemCounter = 1;
        const categoriesWithIds = categories.map((cat, catIdx) => ({
          id: cat.nameJa.toLowerCase().replace(/[^a-zぁ-んァ-ヶ一-龠]/g, "_"),
          nameJa: cat.nameJa,
          displayOrder: catIdx + 1,
          items: cat.items.map((item) => ({
            id: `item-${String(itemCounter++).padStart(3, "0")}`,
            nameJa: item.nameJa,
            allergens: item.allergens,
          })),
        }));

        const totalItems = categoriesWithIds.reduce((sum, cat) => sum + cat.items.length, 0);
        console.log(`  ✓ ${categories.length}カテゴリ, ${totalItems}品目`);

        const menuData = {
          brandId: brand.id,
          usageType: 1,
          scrapedAt: new Date().toISOString(),
          categories: categoriesWithIds,
        };

        const filename = `${brand.id}-1.json`;
        fs.writeFileSync(path.resolve(menusDir, filename), JSON.stringify(menuData, null, 2), "utf-8");
        console.log(`  → data/menus/${filename}`);

        results.push({ id: brand.id, nameJa: brand.nameJa, items: totalItems, success: true });
      } catch (e: any) {
        console.log(`  ✗ エラー: ${e.message}`);
        results.push({ id: brand.id, nameJa: brand.nameJa, items: 0, success: false });
      }

      await page.close();

      // レート制限回避
      await new Promise((r) => setTimeout(r, 1000));
    }

    // brands.json 更新（成功したブランドのみ）
    const successBrands = results.filter((r) => r.success);
    const brandsData = successBrands.map((r) => {
      const brand = BRANDS.find((b) => b.id === r.id)!;
      return {
        id: brand.id,
        nameJa: brand.nameJa,
        brandCode: brand.brandCode,
        groupName: GROUP_NAME,
        sourceUrl: brand.type === "brand"
          ? `https://allergy.skylark.co.jp/chart?brand=${brand.brandCode}&usage=1`
          : `https://allergy.skylark.co.jp/scene?shop=${brand.brandCode}`,
        usageTypes: USAGE_TYPES,
        lastScrapedAt: new Date().toISOString(),
      };
    });
    fs.writeFileSync(path.resolve(dataDir, "brands.json"), JSON.stringify(brandsData, null, 2), "utf-8");

    // allergens.json
    const allergensData = ALLERGEN_NAMES.map((name, i) => ({
      id: i + 1,
      nameJa: name,
      nameEn: ["Buckwheat", "Peanut", "Wheat", "Egg", "Milk", "Shrimp", "Crab", "Walnut"][i],
      category: "mandatory",
      displayOrder: i + 1,
    }));
    fs.writeFileSync(path.resolve(dataDir, "allergens.json"), JSON.stringify(allergensData, null, 2), "utf-8");

    // 結果サマリ
    console.log("\n\n========== 結果サマリ ==========");
    console.log(`成功: ${successBrands.length}/${brandsToScrape.length}`);
    console.log(`合計品目数: ${results.reduce((sum, r) => sum + r.items, 0)}`);
    console.log("");
    for (const r of results) {
      console.log(`  ${r.success ? "✓" : "✗"} ${r.nameJa}: ${r.items}品目`);
    }

  } finally {
    await browser.close();
  }
}

main().catch(console.error);
