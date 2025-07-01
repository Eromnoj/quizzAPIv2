import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  secure: true
});

const saveFileCloudinary = async (avatar: string, extension: string) => {
  const b64 = avatar
  const dataUri = "data:image/" + extension + ";base64," + b64
  const options = {
    folder: 'geniegourmand',
    unique_filename: true,
  };
  try {
    // Upload the image
    const result = await cloudinary.uploader.upload(dataUri, options);
    return result.secure_url;
  } catch (error) {
    console.error(error);
  }

}

// *TODO : CHange to Cloudinary
const saveFileLocal = async (avatar: string, extension: string) => {
  const today = new Date()
  const b64 = avatar
  const image = Buffer.from(b64, 'base64')
  const imageName = today.getHours() + '-' + today.getMinutes() + '_image.' + extension
  // Utilisez path.resolve pour viser le répertoire public
  const imagePath = path.resolve(__dirname, '../public/img', imageName);
  try {
    // Vérifiez si le répertoire existe, sinon créez-le
    const dir = path.dirname(imagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(imagePath, image)
    // Supprimez le fichier après l'avoir téléchargé
    fs.unlinkSync(imagePath);
  } catch (error) {
    console.error(error);
  }
  return "/public/img/" + imageName

}

export const saveFile = async (avatar: string, extension: string) => {
  if (process.env.CLOUDINARY_URL !== "") {
    return await saveFileCloudinary(avatar, extension)
  } else {
    return await saveFileLocal(avatar, extension)
  }
}