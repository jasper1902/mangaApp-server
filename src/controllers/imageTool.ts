import axios from "axios";
import cheerio from "cheerio";
import { RequestHandler } from "express";
import fs from "fs";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";

async function downloadImage(url: string, folder: string, filename: string) {
  const response = await axios.get(url, { responseType: "stream" });

  // Check if the folder exists, and create it if it doesn't
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  const filePath = `${folder}/${filename}`;
  response.data.pipe(fs.createWriteStream(filePath));

  return new Promise<void>((resolve, reject) => {
    response.data.on("end", resolve);
    response.data.on("error", reject);
  });
}

async function deleteFolderIfExist(folder: string) {
  return new Promise<void>((resolve, reject) => {
    if (fs.existsSync(folder)) {
      fs.rmdir(folder, { recursive: true }, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

// async function deleteImage(folder: string, filename: string) {
//   return new Promise<void>((resolve, reject) => {
//     fs.unlink(`${folder}/${filename}`, (error) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve();
//       }
//     });
//   });
// }

async function scrapeImages(url: string, className = "img") {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const imageUrls: string[] = [];
  $(className).each((index, element) => {
    const imageUrl = $(element).attr("src");
    if (imageUrl) {
      imageUrls.push(imageUrl);
    }
  });

  const h2Texts: string[] = [];
  $("h2").each((index, element) => {
    const h2Text = $(element).text();
    h2Texts.push(h2Text);
  });

  console.log(h2Texts);

  const slug = slugify(h2Texts[0], {
    lower: true,
    replacement: "-",
  });
  const foldername = `images/${slug}`;
  for (let i = 0; i < imageUrls.length; i++) {
    const imageUrl = imageUrls[i];
    const filename = `${slug}-${i}-${uuidv4()}.webp`;
    await downloadImage(imageUrl, foldername, filename);
    console.log(`Downloaded ${filename}`);
  }
  setTimeout(async () => {
    //   await deleteImage(foldername, filename);
    //   console.log(`Deleted ${filename}`);

    await deleteFolderIfExist(foldername);
    console.log(`Deleted folder ${foldername}`);
  }, 1 * 60 * 1000 * 1);
}

export const scrapingImages: RequestHandler = async (req, res, next) => {
  try {
    const { url, className } = req.body;
    await scrapeImages(url, className);
    res.status(200).json({ message: "success" });
  } catch (error) {
    next(error);
  }
};
