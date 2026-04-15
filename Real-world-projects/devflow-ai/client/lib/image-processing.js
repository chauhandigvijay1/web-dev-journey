export const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const createImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

export const getCroppedImageBlob = async (imageSrc, cropAreaPixels) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = cropAreaPixels.width;
  canvas.height = cropAreaPixels.height;
  const context = canvas.getContext("2d");

  context.drawImage(
    image,
    cropAreaPixels.x,
    cropAreaPixels.y,
    cropAreaPixels.width,
    cropAreaPixels.height,
    0,
    0,
    cropAreaPixels.width,
    cropAreaPixels.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
  });
};

export const compressImageBlob = async (blob, { maxWidth = 512, quality = 0.82 } = {}) => {
  const imageBitmap = await createImage(URL.createObjectURL(blob));
  const scale = Math.min(1, maxWidth / Math.max(imageBitmap.width, imageBitmap.height));
  const targetWidth = Math.round(imageBitmap.width * scale);
  const targetHeight = Math.round(imageBitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  context.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve) => {
    canvas.toBlob((fileBlob) => resolve(fileBlob), "image/jpeg", quality);
  });
};
