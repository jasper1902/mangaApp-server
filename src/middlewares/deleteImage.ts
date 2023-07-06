import fs from "fs";
const imageFolderPath =
  "/../Users/Jasper/Documents/GitHub/mangaApp-client/src/assets/public/images/";

export const deleteImage = (imagePathArray: string[]) => {
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
