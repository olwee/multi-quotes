export default {
  up: (pool, Models) => pool.connect(async (conn) => {
    await Models.Quote.Up(conn);
  }),
  down: (pool, Models) => pool.connect(async (conn) => {
    await Models.Quote.Down(conn);
  }),
};
