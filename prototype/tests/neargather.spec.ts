import { expect, test, type Page } from "@playwright/test";

test.describe("NearGather privacy-safe RSVP prototype", () => {
  test("keeps the affirmative RSVP and logistics on one dynamic scroll canvas", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Wedding guest RSVP" }).click();
    await page.getByRole("button", { name: "I’m attending — add a memory" }).click();
    await page.getByLabel("I confirm I’m 18 or older").check();
    await page.getByLabel("Adult contributor name").fill("Sarah Thompson");

    await expect(page.getByTestId("rsvp-canvas")).toBeVisible();
    await expect(page.getByText("Your memory is your yes")).toBeVisible();
    await expect(page.getByText("About 2 minutes")).toBeVisible();
    await expect(page.getByRole("button", { name: "RSVP yes with this memory" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Continue to RSVP details" })).toHaveCount(0);

    await page.getByPlaceholder("Write your memory…").fill("I still smile when I remember your first dance.");
    await page.getByRole("button", { name: "RSVP yes with this memory" }).click();
    await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
    await expect(page.getByText("Memory saved — your RSVP is yes.", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("RSVP status: attending but logistics incomplete", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Who’s attending?")).toBeVisible();
    await expect(page.getByTestId("rsvp-progress")).toContainText("Memory ✓");
  });

  test("last-screen experiment keeps answers on the same canvas before the memory gate", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Transparent · last" }).click();
    await page.getByRole("button", { name: "Wedding guest RSVP" }).click();
    await page.getByRole("button", { name: "I’m attending — add a memory" }).click();
    await expect(page.getByTestId("rsvp-canvas")).toBeVisible();
    await expect(page.getByText("Who’s attending?")).toBeVisible();
    await expect(page.getByText("Your memory is your yes")).toBeVisible();
    await expect(page.getByRole("button", { name: "RSVP yes with this memory" })).toBeDisabled();
    await expect(page.getByText("Continue to RSVP details")).toHaveCount(0);
  });

  test("offers birthday and keeps the child honoree adult-managed", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Birthday guest RSVP" })).toBeVisible();
    await page.getByRole("button", { name: "Birthday guest RSVP" }).click();
    await expect(page.getByText("Riley Turns 8")).toBeVisible();
    await expect(page.getByText("Adults participate for this private celebration guestbook.")).toBeVisible();
    await expect(page.getByText("Riley is celebrated here, but does not have a NearGather profile or contributor identity.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Yes, I’ll be there" })).toHaveCount(0);
  });

  test("requires notice and adult affirmation before a valid contribution", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Wedding guest RSVP" }).click();
    await page.getByRole("button", { name: "I’m attending — add a memory" }).click();
    await expect(page.getByTestId("rsvp-canvas")).toBeVisible();
    await expect(page.getByTestId("rsvp-canvas")).toBeVisible();
    await expect(page.getByRole("heading", { name: "First, a quick age check" })).toBeVisible();
    await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
    await page.getByLabel("I confirm I’m 18 or older").check();
    await page.getByLabel("Adult contributor name").fill("Sarah Thompson");
    await expect(page.getByText("Only named hosts can view this.")).toBeVisible();
    await expect(page.getByRole("button", { name: "RSVP yes with this memory" })).toBeDisabled();
    await page.getByPlaceholder("Write your memory…").fill("I still smile when I remember your first dance.");
    await page.getByRole("button", { name: "RSVP yes with this memory" }).click();
    await expect(page.getByText("Who’s attending?")).toBeVisible();
  });

  test("decline skips contribution and logistics", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Wedding guest RSVP" }).click();
    await page.getByRole("button", { name: "Sorry, I can’t make it" }).click();
    await expect(page.getByText("You’re marked as unable to attend")).toBeVisible();
    await expect(page.getByText("Before you share")).toHaveCount(0);
  });

  test("STOP changes messaging only", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /^SMS RSVP/ }).click();
    await expect(page.getByText("Guest-initiated only")).toBeVisible();
    await page.getByPlaceholder("Type a message").fill("RSVP H7K9");
    await page.getByRole("button", { name: "Send message" }).click();
    await page.getByPlaceholder("Type a message").fill("STOP");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("You’re unsubscribed from NearGather messages")).toBeVisible();
    await expect(page.getByText("Attendance: awaiting response")).toBeVisible();
  });

  test("contribution removal preserves attendance in the host-only simulation", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /^Organizer guestbook/ }).click();
    await expect(page.getByText("Private · Hosts only")).toBeVisible();
    await page.getByRole("button", { name: "Remove contribution" }).click();
    await expect(page.getByText("Contribution removed; RSVP unchanged.")).toBeVisible();
    await expect(page.getByText("Attendance: attending but logistics incomplete")).toBeVisible();
  });
});

async function openBirthdayRsvp(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Birthday guest RSVP" }).click();
}

async function affirmAdult(page: Page) {
  await page.getByLabel("I confirm I’m 18 or older").check();
  if (await page.getByLabel("I have authority to share for this child-focused celebration").count()) await page.getByLabel("I have authority to share for this child-focused celebration").check();
  await page.getByLabel("Adult contributor name").fill("Sarah Thompson");
}

test.describe("NearGather birthday P0 acceptance", () => {
  test("organizer assurance gates all setup inputs without collecting a birth date", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Organizer three-preset setup" }).click();

    await expect(page.getByRole("heading", { name: "Before you create an event" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Wedding" })).toHaveCount(0);
    await expect(page.getByLabel("Event title")).toHaveCount(0);
    await expect(page.getByLabel("Honoree name")).toHaveCount(0);
    await expect(page.getByLabel("Date of birth")).toHaveCount(0);
    await page.getByLabel("I confirm I’m 18 or older as an organizer or cohost").check();
    await page.getByRole("button", { name: "Start event setup" }).click();
    await expect(page.getByRole("heading", { name: "Event type" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Birthday party" })).toBeVisible();
  });

  test("offers all presets and birthday research variants", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("button", { name: "Wedding guest RSVP" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Baby shower guest RSVP" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Birthday guest RSVP" })).toBeVisible();
    await expect(page.getByLabel("Birthday variant")).toHaveValue("child");

    await page.getByLabel("Error state").selectOption("offline");
    await page.getByRole("button", { name: "Error fallback" }).click();
    await expect(page.getByRole("heading", { name: "You’re offline—but your answers are saved." })).toBeVisible();
    await page.getByRole("button", { name: "Return to Scenario Lab" }).click();

    await page.getByLabel("Birthday variant").selectOption("adult");
    await page.getByRole("button", { name: "Birthday guest RSVP" }).click();
    await expect(page.getByRole("heading", { name: "Riley’s 40th Birthday" })).toBeVisible();
    await expect(page.getByText("private adult-managed celebration guestbook")).toHaveCount(0);
  });

  test("uses Riley Turns 8 and separates the child honoree from adult contributors", async ({ page }) => {
    await openBirthdayRsvp(page);

    await expect(page.getByRole("heading", { name: "Riley Turns 8" })).toBeVisible();
    await expect(page.getByText("Adults participate for this private celebration guestbook.")).toBeVisible();
    await expect(page.getByText("Riley is celebrated here, but does not have a NearGather profile or contributor identity.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Yes, I’ll be there" })).toHaveCount(0);
  });

  test("decline skips assurance, contribution, and logistics", async ({ page }) => {
    await openBirthdayRsvp(page);
    await page.getByRole("button", { name: "Sorry, I can’t make it" }).click();

    await expect(page.getByText("You’re marked as unable to attend")).toBeVisible();
    await expect(page.getByLabel("I confirm I’m 18 or older")).toHaveCount(0);
    await expect(page.getByPlaceholder("Write your memory…")).toHaveCount(0);
    await expect(page.getByText("Who’s attending?")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "I can’t attend, but I’d like to leave a memory" })).toBeVisible();
  });

  test("decline memory is optional and never changes declined attendance", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Wedding guest RSVP" }).click();
    await page.getByRole("button", { name: "Sorry, I can’t make it" }).click();
    await page.getByRole("button", { name: "I can’t attend, but I’d like to leave a memory" }).click();

    await expect(page.getByRole("heading", { name: "A memory for the hosts" })).toBeVisible();
    await page.getByLabel("I confirm I’m 18 or older").check();
    await page.getByLabel("Adult contributor name").fill("Sarah Thompson");
    await page.getByPlaceholder("Write your memory…").fill("I wish I could be there to celebrate with you.");
    await page.getByRole("button", { name: "Send memory" }).click();

    await expect(page.getByRole("heading", { name: "Your memory was sent" })).toBeVisible();
    await expect(page.getByText("Your RSVP remains declined.")).toBeVisible();
    await expect(page.getByText("Attendance: declined")).toBeVisible();
  });

  test("adult assurance precedes all collection and YES intent remains awaiting", async ({ page }) => {
    await openBirthdayRsvp(page);
    await page.getByRole("button", { name: "I’m attending — add a memory" }).click();

    await expect(page.getByTestId("rsvp-canvas")).toBeVisible();
    await expect(page.getByRole("heading", { name: "First, a quick age check" })).toBeVisible();
    await expect(page.getByText(/RSVP status:/)).toHaveCount(0);
    await expect(page.locator(".device-screen")).toHaveJSProperty("scrollTop", 0);
    await expect(page.getByPlaceholder("Write your memory…")).toHaveCount(0);
    await expect(page.getByText("Who’s attending?")).toHaveCount(0);
    await expect(page.getByLabel("Date of birth")).toHaveCount(0);
    await page.getByLabel("I confirm I’m 18 or older").check();
    await page.getByLabel("Adult contributor name").fill("Sarah Thompson");
    await expect(page.getByRole("button", { name: "RSVP yes with this memory" })).toBeDisabled();
    await page.getByLabel("I confirm I’m 18 or older").uncheck();

    await affirmAdult(page);
    await expect(page.getByRole("heading", { name: "Your memory is your yes" })).toBeVisible();
    await expect(page.getByPlaceholder("Write your memory…")).toBeVisible();
    await expect(page.getByText("Adult contributor: Sarah Thompson")).toBeVisible();
  });

  test("route changes reset a previously scrolled phone viewport before assurance renders", async ({ page }) => {
    await page.goto("/");
    const deviceScreen = page.locator(".device-screen");
    await deviceScreen.evaluate((screen) => { screen.scrollTop = 173; });
    await page.getByRole("button", { name: "Birthday guest RSVP" }).evaluate((button: HTMLButtonElement) => button.click());
    await expect(page.getByRole("heading", { name: "Riley Turns 8" })).toBeVisible();

    await deviceScreen.evaluate((screen) => { screen.scrollTop = 173; });
    await page.getByRole("button", { name: "I’m attending — add a memory" }).evaluate((button: HTMLButtonElement) => button.click());
    await expect(page.getByRole("heading", { name: "First, a quick age check" })).toBeVisible();
    await expect.poll(() => deviceScreen.evaluate((screen) => screen.scrollTop)).toBe(0);
    await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
    await expect.poll(async () => {
      const screenBox = await deviceScreen.boundingBox();
      const keyboardBox = await page.getByTestId("keyboard-dock").boundingBox();
      return Boolean(screenBox && keyboardBox && keyboardBox.y >= screenBox.y + screenBox.height - 2);
    }).toBe(true);
  });

  test("assurance toolbar clears the overlaid status bar on iPhone and Pixel", async ({ page }) => {
    await openBirthdayRsvp(page);
    await page.getByRole("button", { name: "I’m attending — add a memory" }).click();
    await expect(page.getByRole("heading", { name: "First, a quick age check" })).toBeVisible();

    const toolbarClearsStatusBar = async () => {
      const toolbarBox = await page.locator(".topline").boundingBox();
      const statusBox = await page.locator(".status-bar").boundingBox();
      return Boolean(toolbarBox && statusBox && toolbarBox.y >= statusBox.y + statusBox.height - 1);
    };

    await expect.poll(toolbarClearsStatusBar).toBe(true);
    await page.getByTestId("device-picker").click();
    await page.getByTestId("device-option-pixel-10").click();
    await expect(page.getByTestId("device-screen")).toHaveAttribute("data-device", "pixel-10");
    await expect.poll(toolbarClearsStatusBar).toBe(true);
    await expect(page.getByRole("heading", { name: "First, a quick age check" })).toBeVisible();
  });

  test("under-18 exit retains no contribution draft", async ({ page }) => {
    await openBirthdayRsvp(page);
    await page.getByRole("button", { name: "I’m attending — add a memory" }).click();
    await page.getByRole("button", { name: "I’m under 18" }).click();

    await expect(page.getByRole("heading", { name: "Please ask an adult host to help" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "Please ask an adult host to help" })).toBeVisible();
    await expect(page.getByText("No response or media was saved.")).toBeVisible();
    await expect(page.getByPlaceholder("Write your memory…")).toHaveCount(0);
  });

  test("child honoree cannot become the contributor identity", async ({ page }) => {
    await openBirthdayRsvp(page);
    await page.getByRole("button", { name: "I’m attending — add a memory" }).click();
    await page.getByLabel("I confirm I’m 18 or older").check();
    await page.getByLabel("Adult contributor name").fill("Riley");

    await expect(page.getByText("Enter the adult contributor’s name—not Riley’s.")).toBeVisible();
    await expect(page.getByRole("button", { name: "RSVP yes with this memory" })).toBeDisabled();
  });

  test("birthday QR requires assurance and never changes RSVP", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Birthday event QR" }).click();

    await expect(page.getByRole("heading", { name: "A birthday wish Riley can keep" })).toBeVisible();
    await expect(page.getByText("RSVP status: awaiting response")).toBeVisible();
    await expect(page.getByRole("button", { name: "Text contribution" })).toHaveCount(0);
    await page.getByLabel("I confirm I’m 18 or older").check();
    await expect(page.getByRole("button", { name: "Continue to contribution" })).toBeDisabled();
    await page.getByLabel("I have authority to share for this child-focused celebration").check();
    await page.getByRole("button", { name: "Continue to contribution" }).click();
    await page.getByRole("button", { name: "Text contribution" }).click();

    await expect(page.getByText("Contribution saved to the host archive.")).toBeVisible();
    await expect(page.getByText("RSVP status: awaiting response")).toBeVisible();
  });

  test("SMS YES records intent only while STOP changes messaging only", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Birthday SMS RSVP" }).click();
    await page.getByPlaceholder("Type a message").fill("YES");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Attendance: awaiting response")).toBeVisible();
    await expect(page.getByText("Add your birthday memory through the secure adult contribution link")).toBeVisible();

    await page.getByPlaceholder("Type a message").fill("STOP");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("You’re unsubscribed from NearGather messages")).toBeVisible();
    await expect(page.getByText("Attendance: awaiting response")).toBeVisible();
  });

  test("story before YES stays pending and HELP and START do not change attendance", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Birthday SMS RSVP" }).click();
    await page.getByPlaceholder("Type a message").fill("Riley always makes us laugh.");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Thanks—we’ll hold that story. Reply YES or NO to answer the invitation.")).toBeVisible();
    await page.getByPlaceholder("Type a message").fill("HELP");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("For help, use your secure invitation link or contact the adult host.")).toBeVisible();
    await page.getByPlaceholder("Type a message").fill("START");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("NearGather messages are restored.")).toBeVisible();
    await expect(page.getByText("Attendance: awaiting response")).toBeVisible();
  });

  test("birthday guestbook is host-only and takedown does not alter attendance", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Birthday organizer guestbook" }).click();

    await expect(page.getByRole("heading", { name: "Birthday Wishes" })).toBeVisible();
    await expect(page.getByText("Private · Hosts only")).toBeVisible();
    await page.getByRole("button", { name: "Request removal" }).click();
    await expect(page.getByText("Removal request logged for the hosts.")).toBeVisible();
    await page.getByRole("button", { name: "Remove contribution" }).click();
    await expect(page.getByText("Contribution removed; RSVP unchanged.")).toBeVisible();
    await expect(page.getByText("Attendance: attending")).toBeVisible();
    await page.getByRole("button", { name: "Restore contribution" }).click();
    await expect(page.getByText("Contribution restored; RSVP unchanged.")).toBeVisible();
  });

  test("optional research control records no-contribution provenance without an exemption", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Optional control" }).click();
    await page.getByRole("button", { name: "Wedding guest RSVP" }).click();
    await page.getByRole("button", { name: "I’m attending — add a memory" }).click();
    await page.getByLabel("I confirm I’m 18 or older").check();
    await page.getByLabel("Adult contributor name").fill("Jordan Lee");
    await expect(page.getByRole("button", { name: "RSVP yes with this memory" })).toBeEnabled();
    await page.getByRole("button", { name: "RSVP yes with this memory" }).click();

    await expect(page.getByText("Contribution not required · research control", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/waived|organizer exemption/i)).toHaveCount(0);
  });

  test("shared birthday completion and archive use every honoree name", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Birthday variant").selectOption("shared");
    await page.getByRole("button", { name: "Birthday organizer guestbook" }).click();
    await expect(page.getByText("Stories About Riley & Morgan")).toBeVisible();
    await expect(page.getByText("Stories About Riley", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Return to Scenario Lab" }).click();

    await page.getByRole("button", { name: "Optional control" }).click();
    await page.getByRole("button", { name: "Birthday guest RSVP" }).click();
    await page.getByRole("button", { name: "I’m attending — add a memory" }).click();
    await page.getByLabel("I confirm I’m 18 or older").check();
    await page.getByLabel("I have authority to share for this child-focused celebration").check();
    await page.getByLabel("Adult contributor name").fill("Jordan Lee");
    await page.getByRole("button", { name: "RSVP yes with this memory" }).click();
    await page.getByRole("button", { name: /Sarah Thompson/ }).click();
    await page.getByRole("button", { name: "Continue" }).nth(0).click();
    await page.getByRole("button", { name: "Continue" }).nth(0).click();
    await page.getByRole("button", { name: "Chicken" }).click();
    await page.getByRole("button", { name: "Continue" }).nth(0).click();
    await page.getByLabel("Dietary restrictions").fill("None");
    await page.getByRole("button", { name: "Continue" }).nth(0).click();
    await page.getByRole("button", { name: "Review RSVP" }).click();
    await page.getByRole("button", { name: "Confirm RSVP" }).click();
    await expect(page.getByText("We can’t wait to celebrate Riley & Morgan with you.")).toBeVisible();
  });

  test("event-day QR validates and preserves entered adult attribution", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Birthday event QR" }).click();
    await page.getByLabel("I confirm I’m 18 or older").check();
    await page.getByLabel("I have authority to share for this child-focused celebration").check();
    await page.getByRole("button", { name: "Continue to contribution" }).click();
    await page.getByRole("button", { name: "Use my adult name" }).click();
    await page.getByLabel("Adult contributor name").fill("Riley");
    await expect(page.getByText("Enter an adult contributor name—not a celebrated child’s name.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Text contribution" })).toBeDisabled();
    await page.getByLabel("Adult contributor name").fill("Jordan Lee");
    await page.getByRole("button", { name: "Text contribution" }).click();
    await expect(page.getByText("Attributed to Jordan Lee")).toBeVisible();
  });

  test("RSVP review distinguishes the respondent from the entered contributor", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Wedding guest RSVP" }).click();
    await page.getByRole("button", { name: "I’m attending — add a memory" }).click();
    await page.getByLabel("I confirm I’m 18 or older").check();
    await page.getByLabel("Adult contributor name").fill("Jordan Lee");
    await page.getByPlaceholder("Write your memory…").fill("I still smile when I remember your first dance.");
    await page.getByRole("button", { name: "RSVP yes with this memory" }).click();
    await page.getByRole("button", { name: /Sarah Thompson/ }).click();
    await page.getByRole("button", { name: "Continue" }).nth(0).click();
    await page.getByRole("button", { name: "Continue" }).nth(0).click();
    await page.getByRole("button", { name: "Chicken" }).click();
    await page.getByRole("button", { name: "Continue" }).nth(0).click();
    await page.getByLabel("Dietary restrictions").fill("None");
    await page.getByRole("button", { name: "Continue" }).nth(0).click();
    await page.getByRole("button", { name: "Review RSVP" }).click();

    await expect(page.getByText("Respondent", { exact: true })).toBeVisible();
    await expect(page.getByText("Contributor", { exact: true })).toBeVisible();
    await expect(page.getByText("Jordan Lee")).toBeVisible();
  });
});
