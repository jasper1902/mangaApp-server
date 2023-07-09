import fs from "fs";

export const deleteImageMiddleware = (imagePathArray: string[]) => {
  const imageFolderPath = process.env.IMAGE_PATH as string;
  imagePathArray.map((img) => {
    const imagePath = img.slice(15);
    try {
      fs.unlinkSync(`${imageFolderPath}${imagePath}`);
      console.log(
        `Image file deleted successfully ${imageFolderPath}${imagePath}`
      );
    } catch (error) {
      console.error("Failed to delete the image file:", error);
    }
  });
};
