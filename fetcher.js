const request = require("request");
const fs = require("fs");
const readline = require("readline");
const args = process.argv.slice(2);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const pullData = () => {
  return new Promise((resolve, reject) => {
    request(`${args[0]}`, (error, response, body) => {
      if (error) {resolve(false)}
      resolve(body);
    });
  });
};

const newPath = () => {
  return new Promise((resolve, reject) => {
    rl.question(`File at inputted path of ${args[1]} already exists, overwrite?(y, n):\n: `, (answer) => {
      rl.close();
      if (answer.trim().toLowerCase() === "y") {
        console.log("Overwriting...");
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

const checkPath = () => {
  return new Promise((resolve, reject) => {
    fs.rename(`${args[1]}`, `${args[1]}`, async (err) => {
      if (err) {
        resolve(true);
      } else {
        resolve(await newPath());
      }
    });
  });
}

const createFile = (content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(`${args[1]}`, content, (err) => {
      if (err) {
        console.log(`File path at ${args[1]} not valid.`);
        resolve(false);
      };
      resolve(true);
    });
  });
};

const main = async () => {
  let toWrite = await checkPath();
  
  if(toWrite) {
    const content = await pullData();
    if (content) {toWrite = await createFile(content)}
    else {
      console.log(`URL of ${args[0]} not valid.`);
      return false;
    };
  }
  return toWrite;
};

main().then((toWrite) => {
  if (toWrite) {
    const fileStats = fs.statSync(`${args[1]}`);
    console.log(`Downloaded and saved ${fileStats.size} bytes to ${args[1]}`);
  } else {
    console.log(`File not written.`);
  }
  rl.close();
});