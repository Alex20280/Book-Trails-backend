const emailRegex = /^[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/;

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,20}$/;

export { emailRegex, passwordRegex };
