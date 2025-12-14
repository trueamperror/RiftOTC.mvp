import { test, expect } from "@playwright/test";

test.describe("Deal Lifecycle", () => {
  test.describe.configure({ mode: 'serial' });

  test("should allow creating and viewing a deal", async ({ page }) => {
    // 1. Visit Dashboard
    await page.goto("/");
    await expect(page.getByText("AI-Powered OTC Trading")).toBeVisible();

    // 2. Navigate to Create Deal
    await page.getByRole("link", { name: "+ Create New Deal" }).click();
    await expect(page).toHaveURL("/deals/create");

    // 3. Fill Form
    // Correct placeholder from CreateDealPage
    await page.getByPlaceholder("Search for a token...").fill("bitcoin");
    // Wait for search results and select (Mocking might be needed if external API flakes, 
    // but we test against running backend)
    await page.getByText("Bitcoin").first().click();

    await page.fill('input[type="number"]', "10"); // Amount

    // Wait for Deal Summary to appear (confirms token data loaded and params valid)
    await expect(page.getByText("Deal Summary")).toBeVisible({ timeout: 30000 });
    await expect(page.getByText("You Receive")).toBeVisible();

    // Select Lock Period (optional, default is usually selected)
    // await page.getByText("4 Weeks").click();

    // Submit
    await page.getByRole("button", { name: "Create Deal" }).click();

    // 4. Verify Redirect to Dashboard (CreateDealPage redirects to /?created=true)
    await expect(page).toHaveURL(/\/\?created=true/);

    // 5. Verify Deal on Dashboard
    // Wait for the skeleton loaders to disappear or deal content to appear
    await expect(page.getByText("Available for purchase")).toBeVisible();
    await expect(page.getByText("BTC").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "View Details" }).first()).toBeVisible({ timeout: 10000 });
  });
});
