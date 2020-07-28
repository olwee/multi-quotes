import loaders from './loaders';
import app from './app';

app(loaders).catch((err) => {
  // eslint-disable-next-line no-console
  if (err) console.log(err);
});
