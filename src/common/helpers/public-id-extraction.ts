export const publicIdExtract = (imagePath: string) =>
  imagePath.split('/').pop()?.split('.')[0] || '';
