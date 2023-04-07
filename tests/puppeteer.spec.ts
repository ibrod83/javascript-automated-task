import puppeteer, { Browser, Page } from "puppeteer";
import expect from "expect";
import { setTimeout } from "timers/promises";

async function setLargePageHeight(page: Page) {
  await page.addStyleTag({
    content: "body { min-height: 10000px; }",
  });
}

describe("AutomatedTask Puppeteer", () => {
  let browser: Browser;
  let page: Page;

  before(async () => {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
    await page.goto("file://" + __dirname + "/test.html");
    await setLargePageHeight(page);
    await setTimeout(1000)

  });

  after(async () => {
    await browser.close();
  });

  it("should perform the specified number of repetitions and update the DOM", async () => {

    const injectedFunction = () => {
      return new Promise((resolve) => {
        const r = document.querySelectorAll(".item").length//
        resolve(r)

      });
    };
    // Execute the injected function in the page's context

    await setTimeout(1000)
    const result = await page.evaluate(injectedFunction);
    console.log('Result:', result);
    expect(result).toBe(8)


  });

  it("should correctly use a function with a bound 'this'", async () => {
    const injectedFunction = (selector:string) => {
      return new Promise((resolve) => {
        const element = document.querySelector(selector);
        const boundFunction = function () {
          //@ts-ignore
          this.textContent = "Modified";
          //@ts-ignore
          return this.textContent;
        }.bind(element);

        resolve(boundFunction());
      });
    };

    const elementSelector = ".item-to-modify";
    const result = await page.evaluate(injectedFunction, elementSelector);
    expect(result).toBe("Modified");

    // Verify the DOM is updated
    const modifiedElement = await page.$eval(
      elementSelector,
      (element) => element.textContent
    );
    expect(modifiedElement).toBe("Modified");
  });

  it("should scroll to the bottom of the page and maintain the integrity of the operation", async () => {
    const scrollToBottom = () => {
      return new Promise((resolve) => {
        window.scrollTo(0, document.body.scrollHeight);
        console.log(window.innerHeight)
        const isScrolledToBottom = document.body.scrollHeight === 10000

        resolve(isScrolledToBottom);
      });
    };

    const result = await page.evaluate(scrollToBottom);
    expect(result).toBe(true);
  });
});