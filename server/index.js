const express = require(`express`);
const path = require(`path`);
const volleyball = require(`volleyball`);
const bodyParser = require(`body-parser`);
const webpack = require(`webpack`);
const webpackDevMiddleware = require(`webpack-dev-middleware`);
const chalk = require(`chalk`);

const app = express();
const config = require(`../webpack.config.js`);

const compiler = webpack(config);

app.use(volleyball);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
}));

app.get(`*`, (req, res) => {
  res.sendFile(path.join(__dirname, `../public/index.html`));
});

const startApp = async () => {
  try {
    app.listen(3000, () => {
      console.log(chalk.cyan(`- - - Server listening on port ${3000} - - - `));
    });
  } catch (err) {
    console.error(err);
  }
};

startApp();
