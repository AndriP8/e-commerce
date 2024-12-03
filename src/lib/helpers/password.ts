import bcrypt from "bcrypt";
const saltRounds = 10;
export const hashPassword = (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return reject(err);
      bcrypt.hash(password, salt, function (err, hash) {
        if (err) return reject(err);
        return resolve(hash);
      });
    });
  });
};
