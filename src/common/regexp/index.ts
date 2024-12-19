const emailRegex =
  /^(?!.*\s)(?=.{6,320}$)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const passwordRegex =
  /^(?!.*[А-Яа-яЁёЇїЄєҐґІі])(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]).*$/;

export { emailRegex, passwordRegex };
