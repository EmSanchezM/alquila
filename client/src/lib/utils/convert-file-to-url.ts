export const convertFileToUrl = (file: File) => {
  return URL.createObjectURL(file)
}