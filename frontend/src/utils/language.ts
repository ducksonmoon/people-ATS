export const isRTL = (text: string): boolean => {
  const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlChars.test(text);
};

export const getTextDirection = (text: string): 'rtl' | 'ltr' => {
  return isRTL(text) ? 'rtl' : 'ltr';
}; 