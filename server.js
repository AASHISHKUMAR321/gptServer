// let data = require("./data");
import puppeteer from "puppeteer-extra";
// const clipboardy = require("clipboardy");
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import prompt from "./prompt.js";
import clipboardy from "clipboardy";

puppeteer.use(StealthPlugin());

const GPT = async (prompt) => {
  function wait(delay) {
    return new Promise((res) => {
      setTimeout(res, delay);
    });
  }
  async function OpenGPT() {
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage();

    // await page.setUserAgent(
    //   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    // );
    // await page.setExtraHTTPHeaders({
    //   "accept-language": "en-US,en;q=0.9",
    // });

    await page.goto("https://chatgpt.com/");

    return { browser, page };
  }

  async function EnterPromt(page, prompt) {
    const textareaSelector = "textarea#prompt-textarea";
    await page.waitForSelector(textareaSelector);
    const textareaElement = await page.$(textareaSelector);

    await page.evaluate(
      (textarea, text) => {
        textarea.value = text;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      },
      textareaElement,
      prompt
    );

    const sendButtonSelector = `[data-testid="send-button"]`;
    await page.waitForSelector(sendButtonSelector);
    await page.click(sendButtonSelector);
  }

  async function accessDataSelector(selector) {
    const elements = await page.$$(selector);
    // const specificElement = elements[index];
    let index = elements.length - 1;
    //console.log(elements);
    return elements;
  }
  async function AccessResponse(copy) {
    await copy.click();
    let result = clipboardy.readSync();
    return result;
  }

  async function WaitforElement(responseIndex) {
    let flag = true;
    while (flag) {
      try {
        let gtpResponseDiv = await accessDataSelector(
          `div.flex-col.gap-1 button.rounded-md.text-token-text-tertiary`
        );
        if (gtpResponseDiv.length === responseIndex) {
          flag = false;
          console.log("Match");
          return gtpResponseDiv[gtpResponseDiv.length - 1];
        }
        await wait(3000);
      } catch (error) {
        console.log(error);
      }
    }
  }

  // async function RepoJudger(page, repoLink, responseIndex = 2) {
  //   console.log(repoLink, responseIndex);
  //   await EnterPromt(page, repoLink);
  //   await WaitforElement(responseIndex);
  //   let CopyElement = await WaitforElement(responseIndex);
  //   let result = await AccessResponse(CopyElement);
  //   console.log("Result: ", result);
  //   return result;
  // }

  // async function processData(data, page) {
  //   for (const [index, item] of data.entries()) {
  //     await RepoJudger(page, item, index + 2);
  //   }
  // }

  let { browser, page } = await OpenGPT();
  EnterPromt(page, prompt);

  let CopyElement = await WaitforElement(1);
  await CopyElement.click();
  let result = clipboardy.readSync();
  console.log("Response: ", result);
  await browser.close();
  return result;

  // await processData(data, page);
};

export default GPT;
