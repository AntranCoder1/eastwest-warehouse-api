import bcrypt from "bcrypt";
// import pdf2img from "pdf-img-convert";
import * as fs from "fs";
// import { pdfToPng } from "pdf-to-png-converter";
import path from "path";
export let encryptPassword = async (password: string) => {
  const hashPassword = await bcrypt.hash(password, 12);
  return hashPassword;
};

export let comparePassword = async (hashPassword: string, password: string) => {
  hashPassword = hashPassword.replace(/^\$2y(.+)$/i, "$2a$1");
  return bcrypt.compare(password, hashPassword);
};

export let convertPdfToImages = (pdfPath: string, fileName: string) => {
  // const outputImages1: any = pdf2img.convert(pdfPath);
  // outputImages1.then((outputImages) => {
  //   for (let i = 0; i < outputImages.length; i++) {
  //     fs.writeFile(pdfPath + "_" + i + ".png", outputImages[i], (error) => {
  //       if (error) {
  //         console.error("Error: " + error);
  //       }
  //     });
  //   }
  // });
  console.log("pdfPathpdfPathpdfPathpdfPath", pdfPath);
  // const pngPages = pdfToPng(pdfPath, {
  //   disableFontFace: true, // When `false`, fonts will be rendered using a built-in font renderer that constructs the glyphs with primitive path commands. Default value is true.
  //   useSystemFonts: true, // When `true`, fonts that aren't embedded in the PDF document will fallback to a system font. Default value is false.
  //   viewportScale: 2.0, // The desired scale of PNG viewport. Default value is 1.0.
  //   outputFolder: "./assets/upload/png", // Folder to write output PNG files. If not specified, PNG output will be available only as a Buffer content, without saving to a file.
  //   // outputFileMask: 'buffer', // Output filename mask. Default value is 'buffer'.
  //   // pdfFilePassword: 'pa$$word', // Password for encrypted PDF.
  //   // pagesToProcess: [1, 3, 11],   // Subset of pages to convert (first page = 1), other pages will be skipped if specified.
  //   // strictPagesToProcess: false // When `true`, will throw an error if specified page number in pagesToProcess is invalid, otherwise will skip invalid page. Default value is false.
  //   verbosityLevel: 0, // Verbosity level. ERRORS: 0, WARNINGS: 1, INFOS: 5. Default value is 0.
  // });
};
