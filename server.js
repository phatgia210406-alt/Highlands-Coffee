import express from 'express';

const app = express();
const PORT = 3000;

app.use('/pages', express.static('./assets/pages'));
app.use(express.static('.'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
