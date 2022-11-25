export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) { return '0 Bytes'; }
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`;
}

export function getSizeInBytes(size) {
  let sizeOfFiles = size.toLowerCase();
  if (sizeOfFiles.endsWith('bytes')) {
    sizeOfFiles = parseFloat(sizeOfFiles);
  } else if (sizeOfFiles.endsWith('kb')) {
    sizeOfFiles = parseFloat(sizeOfFiles) * 1024;
  } else if (sizeOfFiles.endsWith('mb')) {
    sizeOfFiles = parseFloat(sizeOfFiles) * (1024 ** 2);
  } else {
    sizeOfFiles = parseFloat(sizeOfFiles);
  }
  return sizeOfFiles;
}
