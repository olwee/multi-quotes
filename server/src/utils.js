import crypto from 'crypto';

const randomInt = async () => {
  const seed = crypto.randomBytes(4);
  return parseInt(seed.toString('hex'), 16);
};

export {
  randomInt,
};
